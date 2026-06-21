# Arbeitslosigkeit Österreich – Visualisierung

Interaktives Dashboard zur österreichischen Arbeitslosenstatistik (AMS-Daten),
gebaut mit [D3.js](https://d3js.org) und [DuckDB-WASM](https://github.com/duckdb/duckdb-wasm).
Die Daten liegen als Parquet im Browser und werden direkt per SQL abgefragt.

## Was es zeigt

- **Konfiguration** – Zeitstrahl mit verschiebbarem 12-Monats-Fenster, Balken
  (Geschlecht / Nationalität), Treemap der Berufe, Österreich-Karte und Berufsliste.
  Klicks setzen Filter, die alle Charts synchron aktualisieren.
- **Analyse** – Liniendiagramm der ⌀ Verweildauer (12-Monats-Verlauf) und Donut-Charts,
  die auf die gesetzten Filter reagieren.

Kennzahl überall: **⌀ Verweildauer = Bestand / ((Zugang + Abgang) · 0,5)**.

## Lokal starten

Vorausgesetzt ist nur ein moderner Browser. D3 und DuckDB werden per CDN geladen –
es gibt **keinen Build-Schritt und kein `npm install`**. Wegen ES-Modulen und dem
Parquet-Fetch muss das Projekt aber über einen lokalen Webserver laufen
(nicht per Doppelklick / `file://`).

```bash
git clone <REPO-URL>
cd DesignAssignmentVisualisierung

# Variante A – Python (meist vorinstalliert)
python -m http.server 8000

# Variante B – Node
npx serve
```

Anschließend im Browser öffnen: <http://localhost:8000>

## Aufbau

| Datei | Inhalt |
|-------|--------|
| `index.html` | Container-Gerüst der beiden Sektionen |
| `main.js` | Laden, SQL-Abfragen, Daten-Aufbereitung, Verdrahtung aller Charts über `d3.dispatch` |
| `db.js` | DuckDB-WASM-Setup + `query()` |
| `Histogram.js` | Zeitstrahl mit Auswahlfenster |
| `BarChart.js` / `DonutChart.js` | Geschlecht / Nationalität |
| `Treemap.js` / `JobList.js` | Berufs-Hierarchie |
| `ChoroplethMap.js` / `ColorLegend.js` | Österreich-Karte |
| `LineChart.js` | Verweildauer-Verlauf |

## Daten

Aufbereitet liegen die Daten bereits als `data/unemployment_data.parquet` im Repo;
die CSVs unter `data/` sind die Rohquellen von [data.gv.at](https://www.data.gv.at):

- Nationalität (Ausländer): <https://www.data.gv.at/datasets/cfe2ff7e9ad53c1ee053c630070ab139?locale=de>
- Inländer / Ausländer: <https://www.data.gv.at/datasets/cfe2ff7e9ad53c1ee053c630070ab133?locale=de>

Projektdokument: <https://docs.google.com/document/d/1mtkFJVe6IhehyjXULkQLHNrF8DwNRPJVQtj-4b66c28/edit>
