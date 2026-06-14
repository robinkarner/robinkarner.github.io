import { initDB, query } from "./db.js";
import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

await initDB();

let queryResult = await query("SELECT DATE_TRUNC('month', CAST(Datum AS DATE)) AS monat, SUM(BESTAND) AS summe_bestand FROM unemployment GROUP BY 1 ORDER BY 1;");

console.log(queryResult);