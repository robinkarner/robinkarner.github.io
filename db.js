import * as duckdb from 'https://cdn.jsdelivr.net/npm/@duckdb/duckdb-wasm@1.33.1-dev45.0/+esm';

let db = null;
let conn = null;

export async function initDB() {

    if(db && conn) return {db, conn};

    const bundle = await duckdb.selectBundle(duckdb.getJsDelivrBundles());

    const worker_url = URL.createObjectURL(
        new Blob([`importScripts("${bundle.mainWorker}");`], {type: 'text/javascript'})
    );

    const worker = new Worker(worker_url);
    const logger = new duckdb.ConsoleLogger();
    db = new duckdb.AsyncDuckDB(logger, worker);
    await db.instantiate(bundle.mainModule, bundle.pthreadWorker);
    URL.revokeObjectURL(worker_url);

    conn = await db.connect();

    const parquetUrl = new URL('./data/unemployment_data.parquet', import.meta.url).href;

    await db.registerFileURL(
        'unemployment_data.parquet',
        parquetUrl,
        duckdb.DuckDBDataProtocol.HTTP,
        false
    );

    await conn.query(`
        CREATE OR REPLACE TABLE unemployment AS
        SELECT * FROM read_parquet('unemployment_data.parquet');
    `);

    return {db, conn};
}

export function getConnection(){
    if (!conn) throw new Error("Db not initialized.");
    return conn;
}

export async function query(sql) {
    const result = await getConnection().query(sql);
    return result.toArray().map(row => ({...row}));
}
