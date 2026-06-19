import { initDB, query } from "./db.js";
import Histogram from "./Histogram.js";
import BarChart from "./BarChart.js";
import Treemap from "./Treemap.js";
import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

await initDB();

const charts = [];

let filters = {
    gender: null,
    nationality: null,
    job: null,
    state: null
}

const dispatcher = d3.dispatch("windowChanged", "filtersChanged");

let unemployedPerMonth = await query(`SELECT STRFTIME(CAST(Datum AS DATE), '%Y-%m') AS month, 
                                          CAST( SUM(BESTAND) AS INTEGER) AS unemployed_sum 
                                          FROM unemployment GROUP BY 1 ORDER BY 1;`);

const timeline = new Histogram({
    parentElement: "#timeline-chart-container",
    containerWidth: 1000,
    containerHeight: 100,
}, unemployedPerMonth, dispatcher);

let data = await getData("2025-06", "2026-05");

let formattedBarChartData = formatBarChartData(data);
let formattedJobData = formatJobData(data);

const genderBarChart = new BarChart({
    parentElement: "#gender-bar-chart-container",
    containerWidth: 300,
    containerHeight: 300,
}, [
    {demographic: "male", value: formattedBarChartData.gender.male.averageStay},
    {demographic: "female", value: formattedBarChartData.gender.female.averageStay}
], dispatcher);

charts.push(genderBarChart);

const nationalityBarChart = new BarChart({
    parentElement: "#nationality-bar-chart-container",
    containerWidth: 300,
    containerHeight: 300,
}, [
    {demographic: "citizens", value: formattedBarChartData.nationality.citizens.averageStay},
    {demographic: "non-citizens", value: formattedBarChartData.nationality.nonCitizens.averageStay}
], dispatcher);

charts.push(nationalityBarChart);

const treeMap = new Treemap({
    parentElement: "#treemap-container",
    containerWidth: 600,
    containerHeight: 400,
}, formattedJobData, dispatcher);

charts.push(treeMap);

document.querySelector("#zoom-out").addEventListener("click", () => {
    treeMap.zoomOut();
});

dispatcher.on("windowChanged", async windowDates => {
    data = await getData(windowDates.startDate, windowDates.endDate);

    updateChartData();

});

dispatcher.on("filtersChanged", filterUpdate => {

    if(filterUpdate.filter === "gender"){
        filters.gender = filterUpdate.value;
    }else if(filterUpdate.filter === "nationality"){
        filters.nationality = filterUpdate.value;
    }else if(filterUpdate.filter === "job"){
        filters.job = filterUpdate.value;
    }else if(filterUpdate.filter === "state"){
        filters.state = filterUpdate.value;
    }

    updateChartData();

});

function updateChartData(){

    let genderBarChartData =  formatBarChartData(filterData("gender"));

    genderBarChart.updateVis([
        {demographic: "male", value: genderBarChartData.gender.male.averageStay},
        {demographic: "female", value: genderBarChartData.gender.female.averageStay}
    ]);

    let nationalityBarChartData = formatBarChartData(filterData("nationality"));

    nationalityBarChart.updateVis([
        {demographic: "citizens", value: nationalityBarChartData.nationality.citizens.averageStay},
        {demographic: "non-citizens", value: nationalityBarChartData.nationality.nonCitizens.averageStay}
    ]);

    let treeMapData = formatJobData(filterData("job"));

    treeMap.updateVis(treeMapData);

}

async function getData(startDate, endDate) {
    let data = await query(`
        SELECT GESCHLECHT                      AS gender,
               NATIONALITAET                   AS nationality,
               CAST(BERUFS4STELLER AS INTEGER) AS job_number,
               BERUFS4STELLERBEZ               AS job_string,
               CAST(SUM(ZUGANG) AS INTEGER)    AS sum_entries,
               CAST(SUM(BESTAND) AS INTEGER)   AS sum_balance,
               CAST(SUM(ABGANG) AS INTEGER)    AS sum_departures
        FROM unemployment
        WHERE STRFTIME(CAST(DATUM as DATE), '%Y-%m') >= '${startDate}'
          AND STRFTIME(CAST(DATUM as DATE), '%Y-%m') <= '${endDate}'
        GROUP BY GESCHLECHT,
                 NATIONALITAET,
                 BERUFS4STELLER,
                 BERUFS4STELLERBEZ
        ORDER BY GESCHLECHT,
                 NATIONALITAET,
                 BERUFS4STELLER,
                 BERUFS4STELLERBEZ;
    `);

    return data;
}

function filterData(omit){

    let filteredData = [];

    for(let dataPoint of data){
        if(!(omit === "gender") && filters.gender){
            if(dataPoint.gender !== filters.gender){
                continue;
            }
        }
        if(!(omit === "nationality") && filters.nationality){
            if(dataPoint.nationality !== filters.nationality){
                continue;
            }
        }
        if(!(omit === "job") && filters.job){
            if(!String(dataPoint.job_number).padStart(4, "0").startsWith(filters.job)){
                continue;
            }
        }
        if(!(omit === "state") && filters.state){
            //TODO
        }

        filteredData.push(dataPoint);
    }

    return filteredData;
}

function formatBarChartData(data) {
    let barChartData = {
        gender: {
            male: {
                entries: 0,
                departures: 0,
                balance: 0,
                averageStay: 0
            },
            female: {
                entries: 0,
                departures: 0,
                balance: 0,
                averageStay: 0
            }
        },
        nationality: {
            citizens: {
                entries: 0,
                departures: 0,
                balance: 0,
                averageStay: 0
            },
            nonCitizens: {
                entries: 0,
                departures: 0,
                balance: 0,
                averageStay: 0
            }
        }
    }

    for(let dataPoint of data){
        if(dataPoint.gender === "M"){
            barChartData.gender.male.entries += dataPoint.sum_entries;
            barChartData.gender.male.departures += dataPoint.sum_departures;
            barChartData.gender.male.balance += dataPoint.sum_balance;
        }else{
            barChartData.gender.female.entries += dataPoint.sum_entries;
            barChartData.gender.female.departures += dataPoint.sum_departures;
            barChartData.gender.female.balance += dataPoint.sum_balance;
        }

        if(dataPoint.nationality === "Inländer_innen"){
            barChartData.nationality.citizens.entries += dataPoint.sum_entries;
            barChartData.nationality.citizens.departures += dataPoint.sum_departures;
            barChartData.nationality.citizens.balance += dataPoint.sum_balance;
        }else{
            barChartData.nationality.nonCitizens.entries += dataPoint.sum_entries;
            barChartData.nationality.nonCitizens.departures += dataPoint.sum_departures;
            barChartData.nationality.nonCitizens.balance += dataPoint.sum_balance;
        }
    }

    barChartData.gender.male.averageStay = getAverageStay(barChartData.gender.male);

    barChartData.gender.female.averageStay = getAverageStay(barChartData.gender.female);

    barChartData.nationality.citizens.averageStay = getAverageStay(barChartData.nationality.citizens);

    barChartData.nationality.nonCitizens.averageStay = getAverageStay(barChartData.nationality.nonCitizens);

    return barChartData;
}

function getAverageStay(demographicData){
    return demographicData.balance / ((demographicData.entries + demographicData.departures) * 0.5);
}

function formatJobData(data){
    const jobsAggregated = Object.values(
        data.reduce((acc, d) => {
            const key = d.job_number;

            if(!acc[key]){
                acc[key] = {
                    job_number: d.job_number,
                    job_string: d.job_string,
                    sum_entries: 0,
                    sum_departures: 0,
                    sum_balance: 0
                };
            }

            acc[key].sum_entries += d.sum_entries ?? 0;
            acc[key].sum_departures += d.sum_departures ?? 0;
            acc[key].sum_balance += d.sum_balance ?? 0;

            return acc;
        }, {})
    ).map(d => ({
        ...d,
        averageStay:
            (d.sum_entries + d.sum_departures) > 0
                ? d.sum_balance / ((d.sum_entries + d.sum_departures) * 0.5)
                : 12
    }));


    const root = {
        name: "Berufe",
        codePrefix: "",
        childrenMap: new Map()
    };

    for (const job of jobsAggregated){
        const code = String(job.job_number).padStart(4, "0");

        let current = root;

        for (let depth = 0; depth < 4; depth++){
            const digit = code[depth];
            const prefix = code.slice(0, depth + 1);

            if(!current.childrenMap.has(digit)){
                const isLeaf = depth === 3;

                current.childrenMap.set(digit, {
                    name: isLeaf ? job.job_string : prefix,
                    codePrefix: prefix,
                    childrenMap: isLeaf ? null : new Map(),
                    ...(isLeaf ? {
                        code,
                        label: job.job_string,
                        balance: job.sum_balance,
                        entries: job.sum_entries,
                        departures: job.sum_departures,
                        averageStay: job.averageStay
                    } : {})
                });
            }

            current = current.childrenMap.get(digit);
        }
    }

    function finalize(node){
        if (!node.childrenMap){
            return {
                name: node.name,
                codePrefix: node.codePrefix,
                code: node.code,
                label: node.label,
                balance: node.balance,
                entries: node.entries,
                departures: node.departures,
                averageStay: node.averageStay
            };
        }

        const children = Array.from(node.childrenMap.values()).map(finalize);

        return {
            name: node.name,
            codePrefix: node.codePrefix,
            children
        };
    }

    return finalize(root);

}