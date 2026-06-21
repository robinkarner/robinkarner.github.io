import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

export default class ColorLegend {
    constructor(_config, maxValue) {
        this.config = {
            parentElement: _config.parentElement,
            containerWidth: _config.containerWidth,
            containerHeight: _config.containerHeight,
            margin: {top: 15, bottom: 15, left: 0, right: 50}
        }

        this.maxValue = maxValue;

        this.initVis();
    }

    initVis() {
        let vis = this;

        vis.legendHeight = vis.config.containerHeight - vis.config.margin.top - vis.config.margin.bottom;
        vis.legendWidth = 10;

        vis.container = d3.select(vis.config.parentElement)
            .style("display", "flex")
            .style("align-items", "flex-start")
            .style("gap", "5px");

        vis.canvas = vis.container.append("canvas")
            .attr("width", vis.legendWidth)
            .attr("height", vis.legendHeight)
            .style("width", `${vis.legendWidth}px`)
            .style("height", `${vis.legendHeight}px`)
            .style("margin-top", `${vis.config.margin.top}px`)
            .style("border", "solid 1px black")
            .style("flex", "0 0 auto");

        const svgWidth = vis.config.containerWidth - vis.legendWidth - 10 - vis.config.margin.right;

        vis.svg = vis.container.append("svg")
            .attr("width", svgWidth)
            .attr("height", vis.config.containerHeight)
            .style("flex", "0 0 auto");

        vis.axisGroup = vis.svg.append("g")
            .attr("transform", `translate(0, ${vis.config.margin.top})`);

        vis.svg.append("text")
            .attr("class", "y-axis-title")
            .attr("text-anchor", "middle")
            .attr("transform", `translate(${20}, ${vis.config.containerHeight / 2}) rotate(90)`)
            .text("months unemployed")
            .style("font-size", "15px");

        vis.updateVis(this.maxValue);
    }

    updateVis(maxValue) {
        let vis = this;
        vis.maxValue = maxValue || 1;

        vis.colorScale = d3.scaleSequential([0, vis.maxValue], d3.interpolateBlues);

        const ctx = vis.canvas.node().getContext("2d");

        for (let i = 0; i < vis.legendHeight; i++) {
            const t = 1 - i / (vis.legendHeight - 1);
            const value = t * vis.maxValue;

            ctx.fillStyle = vis.colorScale(value);
            ctx.fillRect(0, i, vis.legendWidth, 1);
        }

        const yScale = d3.scaleLinear()
            .domain([0, vis.maxValue])
            .range([vis.legendHeight, 0]);

        vis.axisGroup.call(d3.axisRight(yScale).ticks(5).tickSizeOuter(0));
    }
}