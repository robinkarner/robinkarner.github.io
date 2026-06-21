import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";
import { feature, mesh } from "https://cdn.jsdelivr.net/npm/topojson-client@3.1/+esm"

export default class ChoroplethMap {
    constructor(_config, topoData, data, dispatcher) {
        this.config = {
            parentElement: _config.parentElement,
            containerWidth: _config.containerWidth,
            containerHeight: _config.containerHeight,
            scaleMaximum: _config.scaleMaximum,
            margin: {top: 20, bottom: 20, right: 50, left: 50}
        }

        this.topoData = topoData;
        this.data = data;

        this.dispatcher = dispatcher;

        this.selectedState = null;

        this.initVis();
    }

    initVis() {
        let vis = this;

        vis.width = vis.config.containerWidth - this.config.margin.left - this.config.margin.right;
        vis.height = vis.config.containerHeight - this.config.margin.top - this.config.margin.bottom;

        vis.svg = d3.select(vis.config.parentElement).append("svg")
            .attr("width", vis.config.containerWidth)
            .attr("height", vis.config.containerHeight)
        .append("g")
            .attr("transform", `translate(${vis.config.margin.left}, ${vis.config.margin.top})`);

        vis.stateCollection = feature(vis.topoData, vis.topoData.objects.laender);

        vis.states = vis.stateCollection.features;

        vis.projection = d3.geoMercator().fitSize([vis.width, vis.height], vis.stateCollection);
        vis.geoPath = d3.geoPath().projection(vis.projection);

        vis.mapGroup = vis.svg.append("g");
        vis.borderGroup = vis.svg.append("g");

        vis.colorScale = d3.scaleSequential()
            .interpolator(d3.interpolateBlues);

        vis.renderVis();
    }

    renderVis() {

        let vis = this;

        vis.states.forEach(d => {
            d.properties.value = vis.data.get(d.properties.name)?.averageStay ?? 0;
        });

        vis.colorScale.domain([0, vis.config.scaleMaximum]);

        vis.mapGroup.selectAll(".state")
            .data(vis.states, d => d.properties.name)
            .join("path")
            .attr("class", "state")
            .attr("d", vis.geoPath)
            .attr("fill", d => {
                if(d.properties.name === vis.selectedState) {
                    return "red";
                }
                return vis.colorScale(d.properties.value)
            })
            .on("click", (event, d) => {
                let value = null;

                if(vis.selectedState !== d.properties.name) {
                    vis.selectedState = d.properties.name;
                    value = d.properties.name;
                }else{
                    vis.selectedState = null;
                }

                vis.mapGroup.selectAll(".state")
                    .classed("selected", state => state.properties.name === vis.selectedState);

                vis.dispatcher.call("filtersChanged", event, {filter: "state", value: value});
            })
            .transition();

        vis.borderGroup.selectAll(".state-border")
            .data([mesh(vis.topoData, vis.topoData.objects.laender)])
            .join("path")
            .attr("class", "state-border")
            .attr("d", vis.geoPath)
            .attr("fill", "none")
            .attr("stroke", "black")
            .attr("stroke-width", 1);
    }

    updateVis(newData, newScaleMaximum) {
        let vis = this;
        vis.data = newData;
        vis.config.scaleMaximum = newScaleMaximum;
        vis.renderVis();
    }
}