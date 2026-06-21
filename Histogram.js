import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

export default class Histogram {
    constructor(_config, data, dispatcher){
        this.config = {
            parentElement: _config.parentElement,
            containerWidth: _config.containerWidth,
            containerHeight: _config.containerHeight,
            margin: { top: 20, bottom: 20, right: 50, left: 100 }
        }

        this.data = data

        this.dispatcher = dispatcher;

        this.initVis();
    }

    initVis() {
        let vis = this;

        let data = vis.data;

        const width = vis.config.containerWidth - vis.config.margin.left - vis.config.margin.right;
        const height = vis.config.containerHeight - vis.config.margin.top - vis.config.margin.bottom;

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

        vis.svg.append("text")
            .attr("class", "y-axis-title")
            .attr("text-anchor", "middle")
            .attr("transform", `translate(${-60}, ${height / 2}) rotate(-90)`)
            .text("unemployed people")
            .style("font-size", "10px");

        vis.svg.selectAll("rect")
            .data(data)
            .enter()
        .append("rect")
            .attr("width", vis.xScale.bandwidth())
            .attr("height", d => height - vis.yScale(d.unemployed_sum))
            .attr("x", d => vis.xScale(d.month))
            .attr("y", d => vis.yScale(d.unemployed_sum))
            .attr("fill", "#FFBC73")
            .attr("stroke", "black");

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

                })
                .on("end", function (event) {
                    let startIndex = Math.round((event.x - (windowWidth / 2)) / vis.xScale.step());

                    startIndex = Math.max(0, Math.min(startIndex, data.length - 12));

                    vis.dispatcher.call("windowChanged", event, {startDate: data[startIndex].month, endDate: data[startIndex + 11].month});
                })
            );
    }
}