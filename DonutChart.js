import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

export default class DonutChart {
    constructor(_config, data) {
        this.config = {
            parentElement: _config.parentElement,
            containerWidth: _config.containerWidth,
            containerHeight: _config.containerHeight,
            margin: { top: 50, right: 50, bottom: 50, left: 50 }
        };

        this.data = data;
        this.initVis();
    }

    initVis() {
        let vis = this;

        vis.width = vis.config.containerWidth - vis.config.margin.left - vis.config.margin.right;
        vis.height = vis.config.containerHeight - vis.config.margin.top - vis.config.margin.bottom;
        vis.radius = Math.min(vis.width, vis.height) / 2;

        vis.svg = d3.select(vis.config.parentElement).append("svg")
            .attr("width", vis.config.containerWidth)
            .attr("height", vis.config.containerHeight)
            .append("g")
            .attr("transform", `translate(${vis.config.containerWidth / 2}, ${vis.config.containerHeight / 2})`);

        vis.pie = d3.pie()
            .value(d => d.value)
            .sort(null);

        vis.arc = d3.arc()
            .innerRadius(vis.radius * 0.55)
            .outerRadius(vis.radius);

        vis.colorScale = d3.scaleOrdinal()
            .domain(vis.data.map(d => d.label))
            .range(["#0097E0", "#FFAA4F"]);

        vis.renderVis();
    }

    renderVis() {
        let vis = this;

        const total = d3.sum(vis.data, d => d.value);
        if(!(total > 0)){
            vis.svg.selectAll(".arc").remove();
            vis.svg.selectAll(".arc-label").remove();
            return;
        }

        const arcs = vis.pie(vis.data);

        vis.svg.selectAll(".arc")
            .data(arcs, d => d.data.label)
            .join("path")
            .attr("class", "arc")
            .attr("d", vis.arc)
            .attr("fill", d => vis.colorScale(d.data.label));

        vis.svg.selectAll(".arc-label")
            .data(arcs, d => d.data.label)
            .join("text")
            .attr("class", "arc-label")
            .attr("transform", d => `translate(${vis.arc.centroid(d)})`)
            .attr("text-anchor", "middle")
            .attr("dominant-baseline", "middle")
            .text(d => `${d.data.label}: ${d3.format(".0%")(d.data.value / d3.sum(vis.data, x => x.value))}`);
    }

    updateVis(newData) {
        this.data = newData;
        this.renderVis();
    }
}