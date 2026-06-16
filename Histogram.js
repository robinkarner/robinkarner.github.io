import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

export default class Histogram {
    constructor(_config){
        this.config = {
            data: _config.data,
            parentElement: _config.parentElement,
            containerWidth: _config.containerWidth,
            containerHeight: _config.containerHeight,
            margin: { top: 20, bottom: 20, right: 50, left: 50 }
        }

        this.initVis();
    }

    initVis() {
        let vis = this;

        let data = vis.config.data;

        const width = vis.config.containerWidth - vis.config.margin.left - vis.config.margin.right;
        const height = vis.config.containerHeight - vis.config.margin.top - vis.config.margin.bottom;

        const barWidth = (width / data.length) - 0.15;

        vis.svg = d3.select(vis.config.parentElement).append("svg")
            .attr("width", vis.config.containerWidth)
            .attr("height", vis.config.containerHeight)
            .append("g")
            .attr("transform", `translate(${vis.config.margin.left}, ${vis.config.margin.top})`);

        vis.xScale = d3.scaleBand()
            .domain(data.map(d => d.month))
            .range([0, width])
            .paddingInner(0);

        vis.yScale = d3.scaleLinear()
            .domain([0, d3.max(data, d => d.unemployed_sum)])
            .range([height, 0]);

        vis.xAxis = d3.axisBottom(vis.xScale)
            .tickValues(data
                .map(d => d.month)
                .filter(month => month.endsWith("-01"))
            )
            .tickFormat(d => d.slice(0, 4))
            .tickSizeOuter(0);

        vis.yAxis = d3.axisLeft(vis.yScale)
            .ticks(6)
            .tickSizeOuter(0);

        const xAxisGroup = vis.svg.append("g")
            .attr("transform", `translate(0, ${height})`)
            .call(vis.xAxis);

        const yAxisGroup = vis.svg.append("g")
            .call(vis.yAxis);

        vis.svg.selectAll("rect")
            .data(data)
            .enter()
        .append("rect")
            .attr("width", barWidth)
            .attr("height", d => height - vis.yScale(d.unemployed_sum))
            .attr("x", d => vis.xScale(d.month))
            .attr("y", d => vis.yScale(d.unemployed_sum))

        const windowWidth = vis.xScale.step() * 12;

        vis.svg.append("rect")
            .attr("x", width - windowWidth)
            .attr("y", 0)
            .attr("width", windowWidth)
            .attr("height", height)
            .attr("fill", "black")
            .attr("fill-opacity", 0.18)
            .attr("stroke", "red")
            .attr("stroke-width", 1.5)
            .call(
                d3.drag().on("drag", function (event) {
                    let startIndex = Math.round((event.x - (windowWidth / 2)) / vis.xScale.step());

                    startIndex = Math.max(0, Math.min(startIndex, data.length - 12));

                    const snappedX = startIndex * vis.xScale.step();

                    d3.select(this).attr("x", snappedX);

                    console.log(data[startIndex], data[startIndex + 11])

                })
            );
    }
}