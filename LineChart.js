import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

export default class LineChart {
    constructor(_config, data) {
        this.config = {
            parentElement: _config.parentElement,
            containerWidth: _config.containerWidth,
            containerHeight: _config.containerHeight,
            colorScaleMax: _config.colorScaleMax,
            margin: {top: 25, bottom: 20, right: 50, left: 50}
        }

        this.allMonths = data.allMonths;
        this.points = data.points;
        this.markerMonth = data.markerMonth;

        this.initVis();
    }

    initVis() {
        let vis = this;

        vis.width = vis.config.containerWidth - vis.config.margin.left - vis.config.margin.right;
        vis.height = vis.config.containerHeight - vis.config.margin.top - vis.config.margin.bottom;

        vis.svg = d3.select(vis.config.parentElement).append("svg")
            .attr("width", vis.config.containerWidth)
            .attr("height", vis.config.containerHeight)
            .append("g")
            .attr("transform", `translate(${vis.config.margin.left}, ${vis.config.margin.top})`);

        vis.xScale = d3.scalePoint()
            .domain(vis.allMonths)
            .range([0, vis.width]);

        vis.yScale = d3.scaleLinear()
            .range([vis.height, 0]);

        vis.xAxis = d3.axisBottom(vis.xScale)
            .tickValues(vis.allMonths.filter(month => month.endsWith("-01")))
            .tickFormat(d => d.slice(0, 4))
            .tickSizeOuter(0);

        vis.yAxis = d3.axisLeft(vis.yScale)
            .ticks(6)
            .tickSizeOuter(0);

        vis.xAxisGroup = vis.svg.append("g")
            .attr("transform", `translate(0, ${vis.height})`);

        vis.yAxisGroup = vis.svg.append("g");

        vis.svg.append("text")
            .attr("x", 0)
            .attr("y", -12)
            .attr("font-size", 11)
            .attr("fill", "#555")
            .text("⌀ Verweildauer (Monate) – 12-Monats-Verlauf");

        vis.colorScale = d3.scaleSequential(d3.interpolateBlues)
            .domain([0, vis.config.colorScaleMax || 1]);

        vis.areaLayer = vis.svg.append("g");

        vis.line = d3.line()
            .x(d => vis.xScale(d.month))
            .y(d => vis.yScale(d.averageStay));

        vis.topLine = vis.svg.append("path")
            .attr("fill", "none")
            .attr("stroke", "#08306b")
            .attr("stroke-width", 1);

        vis.markerLine = vis.svg.append("line")
            .attr("stroke", "red")
            .attr("stroke-width", 1)
            .attr("stroke-dasharray", "3 3");

        vis.marker = vis.svg.append("circle")
            .attr("r", 4)
            .attr("fill", "red")
            .attr("stroke", "white")
            .attr("stroke-width", 1);

        vis.markerLabel = vis.svg.append("text")
            .attr("font-size", 11)
            .attr("text-anchor", "middle")
            .attr("fill", "red");

        vis.renderVis();
    }

    renderVis() {
        let vis = this;

        vis.yScale.domain([0, d3.max(vis.points, d => d.averageStay) || 1]);

        vis.xAxisGroup.call(vis.xAxis);
        vis.yAxisGroup.call(vis.yAxis);

        const baseY = vis.yScale(0);
        const segments = d3.pairs(vis.points);

        vis.areaLayer.selectAll("polygon.area-segment")
            .data(segments)
            .join("polygon")
            .attr("class", "area-segment")
            .attr("points", d => {
                const x1 = vis.xScale(d[0].month), y1 = vis.yScale(d[0].averageStay);
                const x2 = vis.xScale(d[1].month), y2 = vis.yScale(d[1].averageStay);
                return `${x1},${baseY} ${x1},${y1} ${x2},${y2} ${x2},${baseY}`;
            })
            .attr("fill", d => vis.colorScale((d[0].averageStay + d[1].averageStay) / 2));

        vis.topLine
            .datum(vis.points)
            .attr("d", vis.line);
        // ─── ende neu ───

        vis.renderMarker();
    }

    renderMarker() {
        let vis = this;

        const markerPoint = vis.points.find(d => d.month === vis.markerMonth);

        if(!markerPoint){
            vis.marker.style("display", "none");
            vis.markerLine.style("display", "none");
            vis.markerLabel.style("display", "none");
            return;
        }

        const x = vis.xScale(markerPoint.month);
        const y = vis.yScale(markerPoint.averageStay);

        vis.markerLine.style("display", null)
            .attr("x1", x)
            .attr("x2", x)
            .attr("y1", vis.height)
            .attr("y2", y);

        vis.marker.style("display", null)
            .attr("cx", x)
            .attr("cy", y);

        vis.markerLabel.style("display", null)
            .attr("x", x)
            .attr("y", y - 8)
            .text(d3.format(".1f")(markerPoint.averageStay));
    }

    updateVis(data) {
        let vis = this;

        vis.points = data.points;

        if(data.markerMonth !== undefined){
            vis.markerMonth = data.markerMonth;
        }

        vis.renderVis();
    }

    updateMarker(markerMonth) {
        let vis = this;

        vis.markerMonth = markerMonth;

        vis.renderMarker();
    }
}
