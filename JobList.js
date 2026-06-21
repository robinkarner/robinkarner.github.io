import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

export default class JobList {
    constructor(_config, data, dispatcher) {
        this.config = {
            parentElement: _config.parentElement,
            colorScaleMax: _config.colorScaleMax,
            onNavigate: _config.onNavigate,
        };

        this.leaves = data.leaves;

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

        vis.container.append("input")
            .attr("type", "search")
            .attr("class", "job-list-search")
            .attr("placeholder", "Suche… (* = beliebig)")
            .on("input", function () {
                vis.searchTerm = this.value;
                vis.renderVis();
            });

        vis.list = vis.container.append("div")
            .attr("class", "job-list-items");

        vis.renderVis();
    }

    renderVis() {
        let vis = this;

        const term = (vis.searchTerm || "").trim();
        let shown = vis.leaves;
        if (term) {
            const regex = vis.buildSearchRegex(term);
            shown = vis.leaves.filter(d => regex.test(d.name || ""));
        }

        vis.list.selectAll("div.job-list-row")
            .data(shown, d => d.code)
            .join(
                enter => {
                    const row = enter.append("div")
                        .attr("class", "job-list-row");

                    row.append("span")
                        .attr("class", "job-list-dot")
                        .attr("title", "Im Treemap anzeigen")
                        .on("click", (event, d) => {
                            event.stopPropagation();
                            if (vis.config.onNavigate) vis.config.onNavigate(d.code);
                        });

                    row.append("span").attr("class", "job-list-name");

                    return row;
                },
                update => update,
                exit => exit.remove()
            )
            .order()
            .attr("title", d => d.name)
            .each(function (d) {
                const row = d3.select(this);
                row.select(".job-list-dot").style("background-color", vis.colorScale(d.averageStay || 0));
                row.select(".job-list-name").text(d.name);
            });
    }

    buildSearchRegex(term){
        const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        const pattern = escaped.replace(/\\\*/g, ".*");
        return new RegExp(pattern, "i");
    }

    updateVis(data) {
        let vis = this;

        vis.leaves = data.leaves;

        vis.renderVis();
    }
}
