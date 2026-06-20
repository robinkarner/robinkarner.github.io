# Story-Konzept (Assignment 3) — Storytelling-Vorschlag

**Team-Größe: n = 2** → Mindestanforderungen: ≥ 2 Visualisierungs­komponenten, ≥ 3 Interaktions­techniken, ≥ 2n = **4 Narrative-Views**.

---

## 1. Kernbotschaft (der „Aufhänger")

> **Österreichs Arbeitsmarkt wirkt insgesamt stabil — aber ausgerechnet die hochqualifizierten IT-/Software-Berufe kippen, und zwar genau ab dem Moment, in dem generative KI Mainstream wird.**

Wir verschieben die Erzählung von Assignment 2 („Arbeitslosigkeit in Monaten statt Köpfen") **nicht weg**, sondern **spitzen sie zu**: Dieselbe Metrik (Verweildauer / „Verweildauer" nach Little's Law) und dasselbe Dashboard, aber als geführte Story mit einem konkreten, aktuellen Befund — *Software Engineering & KI*. Das Dashboard bleibt ein allgemeines Explorations-Tool; die Story ist der geführte Pfad, der im Demo den interessantesten Insight zeigt (genau das verlangt Assignment 3: „clear storytelling component" + „live demo … most interesting insights").

Das ist auch der Brückenschlag zu unserem Assignment-2-Paradox: **78 % der Betriebe melden Fachkräftemangel**, gleichzeitig **steigt** die Arbeitslosigkeit in einem hochqualifizierten Feld. Wir zeigen, wo aus „Übergang zwischen zwei Jobs" ein „Steckenbleiben" wird — am Beispiel IT.

---

## 2. Die Befunde aus UNSEREN Daten (echt, selbst berechnet)

Quelle: `data/unemployment_data.parquet` (AMS, Jän 2019 – Mai 2026). IT-Proxy = AMS-Codes **6471** (Dipl.-Ing. Datenverarbeitung ≈ Software Engineers), **6475 + 6478** (DV-Techniker:innen). Metrik = Projekt-Logik: `avgStock = ΣBESTAND/Monate`, `Verweildauer = ΣBESTAND / ((ΣZUGANG + ΣABGANG)·0,5)`.

### Gesamt vs. IT (Datenverarbeitung 6471/6475/6478)

| Fenster (12 Mon.) | Gesamt Bestand⌀ | Gesamt Dauer | Gesamt Zugang | **IT Bestand⌀** | **IT Dauer** | **IT Zugang** |
|---|---:|---:|---:|---:|---:|---:|
| 2019 | 301.328 | 3,54 | 956.275 | 2.745 | 4,25 | 7.316 |
| 2020 (COVID) | 409.639 | 4,90 | 1.018.077 | 3.504 | 5,61 | 7.613 |
| 2022 (Tief) | 263.121 | 3,16 | 932.119 | 2.747 | 3,69 | 8.422 |
| 2023 | 270.773 | 3,20 | 972.351 | 3.059 | 3,69 | 9.746 |
| 2024 | 297.851 | 3,53 | 962.312 | 3.841 | 4,17 | 10.981 |
| 2025 | 317.540 | 3,81 | 936.901 | 4.838 | 4,60 | 12.186 |
| **aktuell (06/25–05/26)** | 321.249 | 3,86 | 920.718 | **5.268** | **4,75** | **12.608** |

### Die Pointe (Veränderung vom Tief 2022 → aktuell)

| | Bestand⌀ | Zugang/Jahr | Verweildauer |
|---|---:|---:|---:|
| **Gesamt-Österreich** | +22 % | **−1 % (flach)** | +22 % (3,16→3,86) |
| **IT (DV-Kern)** | **+92 %** | **+50 %** | +29 % (3,69→4,75) |
| **nur Dipl.-Ing. DV (6471)** | **+136 %** (253→597) | **+95 %** (757→1.474) | +22 % (3,81→4,66) |

**Lesart (das ist der „smoking gun"):** Während die *Zugänge* (neu arbeitslos werdende Menschen) gesamtösterreichisch praktisch **flach** sind, **explodieren** sie in der IT (+50 % bis +95 %). Es geht also nicht nur darum, dass IT-Leute länger brauchen — es werden *deutlich mehr* IT-Leute überhaupt arbeitslos, **gegen** den nationalen Trend. Der Bruch beginnt **2023** und beschleunigt 2024–2025 — exakt das generative-KI-Zeitfenster (ChatGPT: Nov 2022). Zugleich steigt die Verweildauer (2023-Tief 3,56 → 4,66 bei 6471, +31 %): Eine Gruppe, die früher schnell wieder Arbeit fand, **bleibt zunehmend hängen**.

### Wo? (IT, aktuelles 12-Monats-Fenster, ⌀ Bestand)

| Bundesland | Bestand⌀ | Verweildauer |
|---|---:|---:|
| **Wien** | **2.681 (≈ 51 %)** | **5,21** (höchste!) |
| Niederösterreich | 701 | 4,84 |
| Steiermark | 631 | 4,63 |
| Oberösterreich | 518 | 3,79 |
| Rest (K/S/T/V/B) | < 210 je | 3,7–5,3 |

→ **Wien (Tech-Hub) ist das Epizentrum**: rund die Hälfte aller IT-Arbeitslosen *und* die längsten Verweildauern.

### Wer? (IT, aktuelles Fenster)

- **Männer: ⌀ 4.315 (≈ 82 %), Verweildauer 4,90** Monate
- Frauen: ⌀ 954, Verweildauer 4,18 Monate

→ Spiegelt die männerdominierte IT-Belegschaft; Männer bleiben zusätzlich länger hängen.

---

## 3. Externe Belege / „letzte Meldungen" (für Annotationen & Pitch)

> ⚠️ Vor Abgabe Links/Zahlen gegenprüfen — unten aus Web-Recherche (Juni 2026).

- **campus-a.at, 29.09.2025 — „AMS: Starker Anstieg der IT-Arbeitslosigkeit"**: laut AMS **+85,6 %** absolute IT-Arbeitslosigkeit 2019–2025, IT-Quote **3,9 % → 5,5 %**, nennt **KI** als Treiber, datiert den Anstieg auf den **ChatGPT-Start 2022**. → *Deckt sich mit unseren Daten (DV-Kern 2019→2025 +76 %, bis aktuell +92 %).* <https://campus-a.at/2025/09/29/ams-starker-anstieg-der-it-arbeitslosigkeit/>
- **arbeit plus, Jän 2026 — „Arbeitsmarkt-Weckruf"**: ~456.000 arbeitslos/Schulung, Langzeit­arbeitslosigkeit **+14 %**, ⌀ AMS-Vormerkdauer **184 Tage**. <https://arbeitplus.at/arbeitsmarkt-weckruf-jaenner-2026/>
- **WKO — Fachkräftemangel**: 78 % der Betriebe, 64 Mangelberufe (das „Paradox"). <https://marie.wko.at/unternehmertum/fachkraeftemangel-2025-bremst-oesterreichs-aufschwung.html>
- **Stanford Digital Economy Lab / Brynjolfsson, Nov 2025**: **−16 %** Frühkarriere-Beschäftigung in KI-exponiertesten Berufen seit Ende 2022; Entwickler 22–25 **−20 %**; Entry-Level-SWE-Stellen **−67 %** (2023→2024). (Zusammenf.: Yale Insights) <https://insights.som.yale.edu/insights/the-real-job-destruction-from-ai-is-hitting-before-careers-can-start>
- **HBR, Jan 2026 — „Companies Are Laying Off Workers Because of AI's *Potential* — Not Its Performance"**. <https://hbr.org/2026/01/companies-are-laying-off-workers-because-of-ais-potential-not-its-performance>
- **IEEE Spectrum — „How AI Is Reshaping Entry-Level Tech Jobs"**. <https://spectrum.ieee.org/ai-effect-entry-level-jobs>

---

## 4. Ehrliche Einschränkungen (gehören in die Conclusion — Publikum ist statistik-affin)

1. **Taxonomie-Proxy:** Die AMS-Berufssystematik im Datensatz ist alt; es gibt **keinen** eigenen Code „Softwareentwickler:in / ML / KI". Wir nähern IT über „Datenverarbeitung" (6471/6475/6478), optional breiter inkl. Nachrichtentechnik (6271/6278) und DV-Operator (7861). „Software Engineering" ist also **angenähert**, nicht exakt.
2. **Korrelation ≠ Kausalität:** Der IT-Einbruch ab 2023 hat mehrere plausible Treiber — Post-COVID-Overhiring-Korrektur, Zinswende 2022/23 (teures VC-/Tech-Kapital), globale Big-Tech-Layoffs — **KI ist einer davon**, nicht beweisbar der einzige. Die Visualisierung zeigt **zeitliche Koinzidenz + Divergenz vom nationalen Trend**, keinen Kausalbeweis. So formulieren wir es auch.
3. **Größenordnung:** Absolut sind es Hunderte–wenige Tausend vs. ~320.000 gesamt → ein **Frühindikator / „Kanarienvogel"**, (noch) kein Massenphänomen. Das Signal ist die *Abweichung vom Gesamttrend*, nicht die absolute Höhe.
4. **Dauer = Schätzung** (Little's Law, Bestand/Fluss) — modellabhängig.

---

## 5. Erfüllung der formalen Anforderungen (n = 2)

### A) Visualisierungs­komponenten (≥ 2 — wir haben 6 Typen, schon implementiert)
1. **Timeline-Histogramm** (`Histogram.js`) — Gesamt-Arbeitslose/Monat 2019–26, dient als Zeit-Selektor.
2. **Line Chart** (`LineChart.js`, neu) — Verweildauer-Verlauf über die ganze Zeit, Marker = gewähltes Fenster.
3. **Choropleth-Karte** (`ChoroplethMap.js`) — Verweildauer je Bundesland.
4. **Treemap** (`Treemap.js`) — Berufs-Hierarchie, Fläche = Betroffene, Farbe = Verweildauer.
5. **Bar Charts** (`BarChart.js`) — Vergleich Geschlecht / Nationalität.
6. **Donut Charts** (`DonutChart.js`) — Anteile Geschlecht / Nationalität.

### B) Interaktions­techniken (≥ 3 — wir haben 4)
1. **Dynamic Querying / Brushing** — verschiebbares 12-Monats-Fenster im Histogramm steuert *alle* Views (`windowChanged`).
2. **Filtering + Multiple Coordinated Views (Brushing & Linking)** — Klick auf Bundesland (Karte), Demografie (Bar) oder Berufsgruppe (Treemap) filtert alle verknüpften Views gleichzeitig (`filtersChanged`).
3. **Zooming / Drill-down** — hierarchisches Hineinzoomen in der Treemap (Berufs­bereich → 4-Steller).
4. **Details-on-demand / Highlighting** — Marker im Line Chart fürs aktuelle Fenster; rote Selektions-Hervorhebung.

### C) Narrative-Views / Story-Schritte (≥ 4 — wir liefern 6, siehe Storyboard)

---

## 6. Storyboard (Szene für Szene)

> Aufbau wie in den Assignment-2-Sketches: **Intro-Seite → interaktives Dashboard (geführte Schritte) → Conclusion**. On-Screen-Text in **Englisch** (App-/Abgabesprache); jeder Schritt nutzt vorhandene Komponenten + setzt Filter/Fenster automatisch und zeigt eine kurze Caption.

| # | Szene | On-Screen-Text (EN, Vorschlag) | Viz / Interaktion | Daten-Insight |
|---|---|---|---|---|
| **0** | **Hook / Intro** | *„Austria's unemployment looks stable. One high-skilled group tells a different story."* | Großes annotiertes Histogramm; Event-Marker: COVID-Spike 2020, Tief 2022, **ChatGPT Nov 2022**, AI-/Tech-Layoff-Welle 2023–25, „Weckruf" Jän 2026 | Setzt Kontext; Gesamtbild wirkt ruhig |
| **1** | **The paradox** | *„Nationally: duration up a little, inflow flat."* | Dashboard, Default = ganz Österreich, aktuelles Fenster | Gesamt: Zugang flach, Dauer 3,16→3,86 |
| **2** | **Zoom into IT** *(Kern-Reveal)* | *„Now zoom into IT jobs. The line bends the other way."* | **Treemap-Drill-down** in Datenverarbeitung + **Line Chart** | IT-Bestand ×2, Zugang +50–95 % **gegen** den flachen Bund; Bruch ab 2023 |
| **3** | **Before/After AI** | *„Drag the window across late 2022 — watch IT diverge."* | **Fenster-Brushing**; Marker im Line Chart wandert; Treemap/Karte färben sich dunkler | Verweildauer 6471: 3,56 (2023) → 4,66 (+31 %) |
| **4** | **Where: Vienna** | *„Half of it sits in Vienna — and they stay longest."* | **Klick auf Wien** (Karte) → Linking | Wien ≈ 51 % aller IT-Arbeitslosen, Dauer 5,21 |
| **5** | **Who** | *„And it's overwhelmingly male."* | **Klick auf Bar** (Geschlecht) + Donut | Männer ≈ 82 %, Dauer 4,90 vs. 4,18 |
| **6** | **Conclusion** | *„From transitional to structural — a canary for the AI era."* | Zusammenfassende Ansicht + Caveats | Synthese + ehrliche Grenzen (Abschnitt 4) |

→ **6 Narrative-Views ≥ 2n = 4.** Schritte 2, 3, 4, 5 sind jeweils „interactive steps that reveal different insights" und zählen auch einzeln.

---

## 7. Umsetzungsvorschlag (technisch, im Stil des bestehenden Codes)

- **Story-Mode als dünne Schicht über dem Dashboard:** ein Array `storySteps`, jeder Schritt = `{ caption, window, filters }`. „Next/Back"-Buttons (oder Scroll) rufen einfach den vorhandenen `dispatcher` (`windowChanged` / `filtersChanged`) mit den Preset-Werten auf — **keine Logik-Duplizierung**.
- **Neue Datei** `Story.js` (selbsterklärender Name) + **eine** Container-Zeile in `index.html`. Aller neuer Code in `main.js` mit `// neuer Teil … // ende neuer Teil` eingekastet (wie beim Line Chart).
- **Intro-/Conclusion-Text** als statische Sektionen in `index.html` ober-/unterhalb des Dashboards.
- **Histogramm-Annotationen:** kleine Event-Marker (Datum → Label) als optionale Erweiterung von `Histogram.js`.
- **Per-Chart-Captions** (Assignment-2-Idee „small description of a statistical trend") als kurze Texte unter jeder Viz, im Story-Mode dynamisch.

---

## 8. Contribution-Statement (Vorschlag, n = 2 — anpassbar)

| Bereich | Person A | Person B |
|---|---|---|
| Daten-Pipeline (DuckDB/Parquet, Queries) | ✔ | |
| Treemap + Choropleth + Color-Scale | ✔ | |
| Histogramm + Line Chart + Bar/Donut | | ✔ |
| Story-Mode (`Story.js`, Steps, Captions) | gemeinsam | gemeinsam |
| Recherche, Texte, Slides, Deployment | | ✔ |

*(Genaue Aufteilung im Team festlegen; Disclosure zu KI-Tools auf der letzten Slide nicht vergessen.)*

---

## 9. Offene To-dos / Entscheidungen

- [ ] IT-Berufsset final festlegen: nur DV-Kern (6471/6475/6478) **oder** breiter inkl. 6271/6278/7861? (Story-Zahlen oben = DV-Kern.)
- [ ] Story-Mode: Buttons vs. Scrollytelling?
- [ ] Histogramm-Event-Annotationen umsetzen (ChatGPT-Linie etc.).
- [ ] News-Links/Zahlen vor Abgabe verifizieren (Abschnitt 3).
- [ ] Deployment (GitHub Pages o. ä.) + README mit Clone-/Run-Anleitung (lokaler HTTP-Server nötig wg. DuckDB-WASM/Module).
