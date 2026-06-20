import { initDB, query } from "./db.js";
import Histogram from "./Histogram.js";
import BarChart from "./BarChart.js";
import Treemap from "./Treemap.js";
import ChoroplethMap from "./ChoroplethMap.js";
import ColorLegend from "./ColorLegend.js";
import DonutChart from "./DonutChart.js";
import LineChart from "./LineChart.js"; // neuer Teil
import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

await initDB();

const topoData = await d3.json("./data/austria_topo.json");

let filters = {
    gender: null,
    nationality: null,
    job: null,
    state: null
}

const stateByDigit = {
    1: "Burgenland",
    2: "Kärnten",
    3: "Niederösterreich",
    4: "Oberösterreich",
    5: "Salzburg",
    6: "Steiermark",
    7: "Tirol",
    8: "Vorarlberg",
    9: "Wien"
}

const dispatcher = d3.dispatch("windowChanged", "filtersChanged");

let unemployedPerMonth = await query(`SELECT STRFTIME(CAST(Datum AS DATE), '%Y-%m') AS month, 
                                          CAST( SUM(BESTAND) AS INTEGER) AS unemployed_sum 
                                          FROM unemployment GROUP BY 1 ORDER BY 1;`);

const timeline = new Histogram({
    parentElement: "#timeline-chart-container",
    containerWidth: 1300,
    containerHeight: 150,
}, unemployedPerMonth, dispatcher);

let data = await getData("2025-06", "2026-05");

let formattedBarChartData = formatBarChartData(data);
let formattedJobData = formatJobData(data);
let formattedChoroplethData = formatChoroplethData(data);
let formattedPieChartData = formatPieChartData(data);

let sharedScaleMax = getSharedScaleMax(formattedJobData, formattedChoroplethData);

const genderBarChart = new BarChart({
    parentElement: "#gender-bar-chart-container",
    containerWidth: 300,
    containerHeight: 300,
}, [
    {demographic: "male", value: formattedBarChartData.gender.male.averageStay},
    {demographic: "female", value: formattedBarChartData.gender.female.averageStay}
], dispatcher);


const nationalityBarChart = new BarChart({
    parentElement: "#nationality-bar-chart-container",
    containerWidth: 300,
    containerHeight: 300,
}, [
    {demographic: "citizens", value: formattedBarChartData.nationality.citizens.averageStay},
    {demographic: "non-citizens", value: formattedBarChartData.nationality.nonCitizens.averageStay}
], dispatcher);


const treeMap = new Treemap({
    parentElement: "#treemap-container",
    containerWidth: 1300,
    containerHeight: 450,
    scaleMaximum: sharedScaleMax,
}, formattedJobData, dispatcher);


document.querySelector("#zoom-out").addEventListener("click", () => {
    treeMap.zoomOut();
});

const choroplethMap = new ChoroplethMap({
    parentElement: "#choropleth-container",
    containerWidth: 600,
    containerHeight: 300,
    scaleMaximum: sharedScaleMax,
}, topoData, formattedChoroplethData, dispatcher);

const legend = new ColorLegend({
    parentElement: "#legend-container",
    containerWidth: 70,
    containerHeight: 300
}, sharedScaleMax);

const genderDonutChart = new DonutChart({
    parentElement: "#gender-donut-container",
    containerWidth: 250,
    containerHeight: 250,
}, formattedPieChartData.gender);

const nationalityDonutChart = new DonutChart({
    parentElement: "#nationality-donut-container",
    containerWidth: 250,
    containerHeight: 250,
}, formattedPieChartData.nationality);

// ─────────────────────────────────────────────────────────────────────────────
// neuer Teil: Line Chart (durchschnittliche Verweildauer über den Gesamtzeitraum)
// ─────────────────────────────────────────────────────────────────────────────
const allMonths = unemployedPerMonth.map(d => d.month);

// Umkehrung von stateByDigit, damit ein ausgewähltes Bundesland in den SQL-Filter passt
const digitByState = Object.fromEntries(
    Object.entries(stateByDigit).map(([digit, name]) => [name, digit])
);

// Startmonat des aktuell am Slider ausgewählten 12-Monats-Fensters (= markierter Punkt)
let currentWindowStart = allMonths[allMonths.length - 12];

const lineChart = new LineChart({
    parentElement: "#line-chart-container",
    containerWidth: 800,
    containerHeight: 250,
}, {
    allMonths,
    points: computeAverageStayLine(await getLineData(), allMonths),
    markerMonth: currentWindowStart
});
// ─────────────────────────────────────────────────────────────────────────────
// ende neuer Teil
// ─────────────────────────────────────────────────────────────────────────────

dispatcher.on("windowChanged", async windowDates => {
    data = await getData(windowDates.startDate, windowDates.endDate);

    updateChartData();

    // ─── neuer Teil: markierten Punkt auf das neue Fenster setzen ───
    currentWindowStart = windowDates.startDate;
    lineChart.updateMarker(currentWindowStart);
    // ─── ende neuer Teil ───

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

    // ─── neuer Teil: Line Chart an die geänderten Filter anpassen ───
    updateLineChart();
    // ─── ende neuer Teil ───

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
    let choroplethData = formatChoroplethData(filterData("state"));

    let sharedScaleMax = getSharedScaleMax(treeMapData, choroplethData);

    treeMap.updateVis(treeMapData, sharedScaleMax);
    choroplethMap.updateVis(choroplethData, sharedScaleMax);
    legend.updateVis(sharedScaleMax);

    let pieChartData =  formatPieChartData(filterData(null));

    genderDonutChart.updateVis(pieChartData.gender);
    nationalityDonutChart.updateVis(pieChartData.nationality);

}

async function getData(startDate, endDate) {
    let data = await query(`
        SELECT GESCHLECHT                      AS gender,
               NATIONALITAET                   AS nationality,
               CAST(RGSCODE AS INTEGER)        AS location_code,
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
                 RGSCODE,
                 BERUFS4STELLER,
                 BERUFS4STELLERBEZ
        ORDER BY GESCHLECHT,
                 NATIONALITAET,
                 RGSCODE,
                 BERUFS4STELLER,
                 BERUFS4STELLERBEZ;
    `);

    return data.map(d => ({
        ...d,
        state: getStateFromRGSCode(d.location_code)
    }));
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
            if(dataPoint.state !== filters.state){
                continue;
            }
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

function formatPieChartData(data) {
    return {
        gender: [
            {
                label: "male",
                value: d3.sum(data.filter(d => d.gender === "M"), d => d.sum_balance)
            },
            {
                label: "female",
                value: d3.sum(data.filter(d => d.gender !== "M"), d => d.sum_balance)
            }
        ],
        nationality: [
            {
                label: "citizens",
                value: d3.sum(data.filter(d => d.nationality === "Inländer_innen"), d => d.sum_balance)
            },
            {
                label: "non-citizens",
                value: d3.sum(data.filter(d => d.nationality !== "Inländer_innen"), d => d.sum_balance)
            }
        ]
    };
}

function getAverageStay(demographicData){
    const denominator = (demographicData.entries + demographicData.departures) * 0.5;
    return denominator > 0 ? demographicData.balance / denominator : 0;
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

function getStateFromRGSCode(RGSCode){
    const digit = String(RGSCode)[0];
    return stateByDigit[digit] ?? null;
}

function formatChoroplethData(data){
    let formattedData = new Map();

    for(let dataPoint of data){
        if(!formattedData.has(dataPoint.state)){
            formattedData.set(dataPoint.state, {
                entries: 0,
                departures: 0,
                balance: 0,
                averageStay: 0
            });
        }

        const stateData = formattedData.get(dataPoint.state);

        stateData.entries += dataPoint.sum_entries;
        stateData.departures += dataPoint.sum_departures;
        stateData.balance += dataPoint.sum_balance;
    }

    formattedData.forEach(d => {
        d.averageStay = getAverageStay(d);
    });

    return formattedData;
}

function getSharedScaleMax(jobData, stateData){
    let stateValues = Array.from(stateData.values(), d => d.averageStay);

    function collectValuesFromTree(node, values = []){
        if(node.averageStay != null) {
            values.push(node.averageStay);
        }

        if(node.children){
            for(const child of node.children){
                collectValuesFromTree(child, values);
            }
        }

        return values;
    }

    let jobValues = collectValuesFromTree(jobData);

    const allValues = [...jobValues, ...stateValues]
        .filter(v => Number.isFinite(v))
        .sort(d3.ascending);

    return d3.quantile(allValues, 0.95) ?? d3.max(allValues) ?? 1;
}

// ─────────────────────────────────────────────────────────────────────────────
// neuer Teil: Daten + Berechnung für den Line Chart
//
// getLineData()             holt pro Monat die Summen (entries/balance/departures)
//                           für die aktuell aktiven Filter (Gender, Nationality,
//                           Bundesland und Beruf/Treemap-Auswahl).
// computeAverageStayLine()  bildet daraus rollierende 12-Monats-Fenster und
//                           berechnet je Fenster die durchschnittliche Verweildauer.
//                           Punkte sitzen am Startmonat ihres Fensters; an den
//                           Rändern fehlen Werte, weil ein volles Jahr nötig ist.
// updateLineChart()         lädt + berechnet neu und aktualisiert den Chart.
// ─────────────────────────────────────────────────────────────────────────────
async function getLineData(){
    let conditions = [];

    if(filters.gender)      conditions.push(`GESCHLECHT = '${filters.gender}'`);
    if(filters.nationality) conditions.push(`NATIONALITAET = '${filters.nationality}'`);
    if(filters.state)       conditions.push(`LEFT(CAST(RGSCODE AS VARCHAR), 1) = '${digitByState[filters.state]}'`);
    if(filters.job)         conditions.push(`LPAD(CAST(BERUFS4STELLER AS VARCHAR), 4, '0') LIKE '${filters.job}%'`);

    const whereClause = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

    return await query(`
        SELECT STRFTIME(CAST(DATUM AS DATE), '%Y-%m') AS month,
               CAST(SUM(ZUGANG)  AS INTEGER) AS entries,
               CAST(SUM(BESTAND) AS INTEGER) AS balance,
               CAST(SUM(ABGANG)  AS INTEGER) AS departures
        FROM unemployment
        ${whereClause}
        GROUP BY 1
        ORDER BY 1;
    `);
}

function computeAverageStayLine(monthlyRows, months, windowSize = 12){
    const byMonth = new Map(monthlyRows.map(row => [row.month, row]));

    // an alle Monate ausrichten, damit die Fenster echte 12 Kalendermonate umfassen
    const series = months.map(month => {
        const row = byMonth.get(month);
        return {
            month,
            entries: row ? (row.entries ?? 0) : 0,
            balance: row ? (row.balance ?? 0) : 0,
            departures: row ? (row.departures ?? 0) : 0
        };
    });

    const points = [];

    for(let i = 0; i + windowSize <= series.length; i++){
        let entries = 0, balance = 0, departures = 0;

        for(let j = i; j < i + windowSize; j++){
            entries    += series[j].entries;
            balance    += series[j].balance;
            departures += series[j].departures;
        }

        const denominator = (entries + departures) * 0.5;

        points.push({
            month: series[i].month,
            averageStay: denominator > 0 ? balance / denominator : 0
        });
    }

    return points;
}

async function updateLineChart(){
    const monthlyRows = await getLineData();
    const points = computeAverageStayLine(monthlyRows, allMonths);
    lineChart.updateVis({points, markerMonth: currentWindowStart});
}
// ─────────────────────────────────────────────────────────────────────────────
// ende neuer Teil
// ─────────────────────────────────────────────────────────────────────────────