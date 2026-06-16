import { initDB, query } from "./db.js";
import Histogram from "./Histogram.js";
import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

await initDB();

let unemployedPerMonth = await query(`SELECT STRFTIME(CAST(Datum AS DATE), '%Y-%m') AS month, 
                                          CAST( SUM(BESTAND) AS INTEGER) AS unemployed_sum 
                                          FROM unemployment GROUP BY 1 ORDER BY 1;`);

new Histogram({
    data: unemployedPerMonth,
    parentElement: "#timeline-chart-container",
    containerWidth: 1000,
    containerHeight: 100,
});