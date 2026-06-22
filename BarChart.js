import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

export default class BarChart {
    constructor(_config, data, dispatcher) {
        this.config = {
            parentElement: _config.parentElement,
            containerWidth: _config.containerWidth,
            containerHeight: _config.containerHeight,
            margin: {top: 20, bottom: 20, right: 50, left: 50}
        }

        this.data = data;

        this.dispatcher = dispatcher;

        this.selectedBar = null;

        this.initVis();
    }

    initVis() {
        let vis = this;

        let data = vis.data;

        vis.width = vis.config.containerWidth - vis.config.margin.left - vis.config.margin.right;
        vis.height = vis.config.containerHeight - vis.config.margin.top - vis.config.margin.bottom;

        vis.svg = d3.select(vis.config.parentElement).append("svg")
            .attr("width", vis.config.containerWidth)
            .attr("height", vis.config.containerHeight)
            .append("g")
            .attr("transform", `translate(${vis.config.margin.left}, ${vis.config.margin.top})`);

        vis.xScale = d3.scaleBand()
            .domain(data.map(d => d.demographic))
            .range([0, vis.width])
            .padding(0.5);

        vis.yScale = d3.scaleLinear()
            .domain([0, d3.max(data, d => d.value)])
            .range([vis.height, 0]);

        vis.xAxis = d3.axisBottom(vis.xScale)
            .tickSizeOuter(0);

        vis.yAxis = d3.axisLeft(vis.yScale)
            .ticks(4)
            .tickSizeOuter(0);

        vis.xAxisGroup = vis.svg.append("g")
            .attr("transform", `translate(0, ${vis.height})`)
            .call(vis.xAxis);

        vis.yAxisGroup = vis.svg.append("g")
            .call(vis.yAxis);

        vis.svg.append("text")
            .attr("class", "y-axis-title")
            .attr("text-anchor", "middle")
            .attr("transform", `translate(${-20}, ${vis.height / 2}) rotate(-90)`)
            .text("months unemployed")
            .style("font-size", "15px");

        vis.svg.selectAll("rect")
            .data(data)
            .enter()
        .append("rect")
            .on("click", (event, d) => {
                let filterAspect = null;
                let filterValue = null;

                if(vis.selectedBar !== d.demographic) {

                    vis.selectedBar = d.demographic;

                    switch (d.demographic) {
                        case "male":
                            filterAspect = "gender";
                            filterValue = "M";
                            break;
                        case "female":
                            filterAspect = "gender";
                            filterValue = "W";
                            break;
                        case "citizens":
                            filterAspect = "nationality";
                            filterValue = "Inländer_innen";
                            break;
                        case "non-citizens":
                            filterAspect = "nationality";
                            filterValue = "Ausländer_innen";
                    }
                }else{
                    vis.selectedBar = null;
                    switch (d.demographic) {
                        case "male":
                        case "female":
                            filterAspect = "gender";
                            break;
                        case "citizens":
                        case "non-citizens":
                            filterAspect = "nationality";
                    }
                }

                vis.svg.selectAll("rect").classed("selected", bar => bar.demographic === vis.selectedBar);

                vis.dispatcher.call("filtersChanged", event, {filter: filterAspect, value: filterValue});

            })
            .transition()
            .attr("width", vis.xScale.bandwidth())
            .attr("height", d => vis.height - vis.yScale(d.value ?? 0))
            .attr("x", d => vis.xScale(d.demographic))
            .attr("y", d => vis.yScale(d.value ?? 0))
            .attr("fill", "#FFBC73")
            .attr("stroke", "black");
    }

    updateVis(newData) {
        let vis = this;

        vis.data = newData;

        vis.yScale.domain([0, d3.max(vis.data, d => d.value)]);

        vis.yAxisGroup.call(vis.yAxis);

        vis.svg.selectAll("rect")
            .data(vis.data)
        .join("rect")
            .transition()
            .attr("width", vis.xScale.bandwidth())
            .attr("height", d => vis.height - vis.yScale(d.value ?? 0))
            .attr("x", d => vis.xScale(d.demographic))
            .attr("y", d => vis.yScale(d.value ?? 0))
            .attr("fill", "#FFBC73")
            .attr("stroke", "black");

    }

    selectBar(demographic){
        let vis = this;

        vis.selectedBar = demographic;

        vis.svg.selectAll("rect")
            .classed("selected", bar => bar.demographic === vis.selectedBar)
            .attr("stroke", bar => bar.demographic === vis.selectedBar ? "red" : "black")
            .attr("stroke-width", bar => bar.demographic === vis.selectedBar ? 3 : 1)
            .attr("fill", bar => bar.demographic === vis.selectedBar ? "#FF8F0F" : "#FFBC73");
    }

}