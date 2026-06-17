import { initDB, query } from "./db.js";
import Histogram from "./Histogram.js";
import BarChart from "./BarChart.js";
import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

await initDB();

const charts = [];

const dispatcher = d3.dispatch("windowChanged");

let unemployedPerMonth = await query(`SELECT STRFTIME(CAST(Datum AS DATE), '%Y-%m') AS month, 
                                          CAST( SUM(BESTAND) AS INTEGER) AS unemployed_sum 
                                          FROM unemployment GROUP BY 1 ORDER BY 1;`);

const timeline = new Histogram({
    parentElement: "#timeline-chart-container",
    containerWidth: 1000,
    containerHeight: 100,
}, unemployedPerMonth, dispatcher);

let barChartData = await getData("2025-06", "2026-05");

const genderBarChart = new BarChart({
    parentElement: "#gender-bar-chart-container",
    containerWidth: 300,
    containerHeight: 300,
}, [
    {demographic: "male", value: barChartData.gender.male.averageStay},
    {demographic: "female", value: barChartData.gender.female.averageStay}
]);

charts.push(genderBarChart);

const nationalityBarChart = new BarChart({
    parentElement: "#nationality-bar-chart-container",
    containerWidth: 300,
    containerHeight: 300,
}, [
    {demographic: "citizens", value: barChartData.nationality.citizens.averageStay},
    {demographic: "non-citizens", value: barChartData.nationality.nonCitizens.averageStay}
]);

charts.push(nationalityBarChart);

dispatcher.on("windowChanged", async windowDates => {
    const newBarChartData = await getData(windowDates.startDate, windowDates.endDate);

    genderBarChart.updateVis([
        {demographic: "male", value: newBarChartData.gender.male.averageStay},
        {demographic: "female", value: newBarChartData.gender.female.averageStay}
    ]);

    nationalityBarChart.updateVis([
        {demographic: "citizens", value: newBarChartData.nationality.citizens.averageStay},
        {demographic: "non-citizens", value: newBarChartData.nationality.nonCitizens.averageStay}
    ]);

});

/*console.log(await query(`
        SELECT
           GESCHLECHT AS gender,
           NATIONALITAET AS nationality,
           CAST(BERUFS4STELLER AS INTEGER) AS job_number,
           BERUFS4STELLERBEZ AS job_string,
           CAST(SUM(ZUGANG) AS INTEGER)  AS sum_entries,
           CAST(SUM(BESTAND) AS INTEGER) AS sum_balance,
           CAST(SUM(ABGANG) AS INTEGER)  AS sum_departures
        FROM unemployment
        WHERE STRFTIME(CAST(DATUM as DATE), '%Y-%m') >= '2025-06'
            AND STRFTIME(CAST(DATUM as DATE), '%Y-%m') <= '2026-05'
        GROUP BY
           GESCHLECHT,
           NATIONALITAET,
           BERUFS4STELLER,
           BERUFS4STELLERBEZ
        ORDER BY
           GESCHLECHT,
           NATIONALITAET,
           BERUFS4STELLER,
           BERUFS4STELLERBEZ;
    `));*/

async function getData(startDate, endDate) {
    let data = await query(`
        SELECT
           GESCHLECHT AS gender,
           NATIONALITAET AS nationality,
           CAST(BERUFS4STELLER AS INTEGER) AS job_number,
           BERUFS4STELLERBEZ AS job_string,
           CAST(SUM(ZUGANG) AS INTEGER)  AS sum_entries,
           CAST(SUM(BESTAND) AS INTEGER) AS sum_balance,
           CAST(SUM(ABGANG) AS INTEGER)  AS sum_departures
        FROM unemployment
        WHERE STRFTIME(CAST(DATUM as DATE), '%Y-%m') >= '${startDate}'
            AND STRFTIME(CAST(DATUM as DATE), '%Y-%m') <= '${endDate}'
        GROUP BY
           GESCHLECHT,
           NATIONALITAET,
           BERUFS4STELLER,
           BERUFS4STELLERBEZ
        ORDER BY
           GESCHLECHT,
           NATIONALITAET,
           BERUFS4STELLER,
           BERUFS4STELLERBEZ;
    `);

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