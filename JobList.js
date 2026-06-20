import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

// Einfache, scrollbare Namensliste der Berufe, die gerade im Treemap-Ausschnitt liegen.
// Synchron zum Treemap (von außen via updateVis gefüttert). Klick auf eine Zeile macht
// dasselbe wie die Auswahl der zugehörigen Treemap-Kachel: feuert den Job-Filter.
export default class JobList {
    constructor(_config, data, dispatcher) {
        this.config = {
            parentElement: _config.parentElement,
            colorScaleMax: _config.colorScaleMax, // gleiche Blau-Skala wie Treemap/Choropleth
        };

        this.leaves = data.leaves;                 // [{code, name, averageStay, balance}]
        this.selectedCode = data.selectedCode ?? null;

        this.dispatcher = dispatcher;

        this.initVis();
    }

    initVis() {
        let vis = this;

        vis.searchTerm = "";

        vis.colorScale = d3.scaleSequential(d3.interpolateBlues)
            .domain([0, vis.config.colorScaleMax || 1]);

        vis.container = d3.select(vis.config.parentElement)
            .classed("job-list", true);

        // lokales Suchfeld: filtert nur diese Liste (kein Dispatcher, keine Wechselwirkung)
        vis.container.append("input")
            .attr("type", "search")
            .attr("class", "job-list-search")
            .attr("placeholder", "Suche…")
            .on("input", function () {
                vis.searchTerm = this.value.toLowerCase();
                vis.renderVis();
            });

        vis.list = vis.container.append("div")
            .attr("class", "job-list-items");

        vis.renderVis();
    }

    renderVis() {
        let vis = this;

        // lokaler Suchfilter über die Namen
        const shown = vis.searchTerm
            ? vis.leaves.filter(d => (d.name || "").toLowerCase().includes(vis.searchTerm))
            : vis.leaves;

        vis.list.selectAll("div.job-list-row")
            .data(shown, d => d.code)
            .join(
                enter => {
                    const row = enter.append("div")
                        .attr("class", "job-list-row")
                        .on("click", (event, d) => {
                            // Toggle: gleiche Kachel nochmal -> Auswahl aufheben
                            const value = vis.selectedCode === d.code ? null : d.code;
                            vis.dispatcher.call("filtersChanged", event, {filter: "job", value});
                        });

                    row.append("span").attr("class", "job-list-dot");
                    row.append("span").attr("class", "job-list-name");

                    return row;
                },
                update => update,
                exit => exit.remove()
            )
            .attr("title", d => d.name)
            .classed("selected", d => d.code === vis.selectedCode)
            .each(function (d) {
                const row = d3.select(this);
                row.select(".job-list-dot").style("background-color", vis.colorScale(d.averageStay || 0));
                row.select(".job-list-name").text(d.name);
            });
    }

    updateVis(data) {
        let vis = this;

        vis.leaves = data.leaves;

        if (data.selectedCode !== undefined) {
            vis.selectedCode = data.selectedCode;
        }

        vis.renderVis();
    }
}
