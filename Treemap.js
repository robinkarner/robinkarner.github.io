import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

export default class Treemap {
    constructor(_config, data, dispatcher) {
        this.config = {
            parentElement: _config.parentElement,
            containerWidth: _config.containerWidth,
            containerHeight: _config.containerHeight,
            scaleMaximum: _config.scaleMaximum,
            margin: {top: 0, bottom: 0, left: 0, right: 0}
        };

        this.data = data;
        this.currentNode = data;

        this.dispatcher = dispatcher;

        this.currentPrefix = data.codePrefix || "";

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

        vis.leafLayer = vis.svg.append("g");
        vis.branchLayer = vis.svg.append("g");

        vis.colorScale = d3.scaleSequential()
            .interpolator(d3.interpolateBlues);

        vis.renderVis(vis.currentNode);
    }

    renderVis(nodeData) {
        let vis = this;

        vis.currentNode = nodeData;

        const root = d3.hierarchy(nodeData)
            .sum(d => d.balance || 0)
            .sort((a, b) => (b.value || 0) - (a.value || 0));

        d3.treemap()
            .tile(d3.treemapSquarify)
            .size([vis.width, vis.height])
            .paddingInner(0.5)
            .round(true)(root);

        const leaves = root.leaves();
        const branches = (root.children || []);

        vis.colorScale.domain([0, vis.config.scaleMaximum]);

        vis.renderLeaves(leaves);
        vis.renderBranches(branches);
        vis.renderEmptyState(leaves.length === 0 && branches.length === 0);
    }

    renderBranches(branches) {
        let vis = this;

        vis.branchLayer.selectAll("rect.branch")
            .data(branches, d => d.data.codePrefix || d.data.name)
            .join(
                enter => enter.append("rect")
                    .attr("class", "branch")
                    .attr("x", d => d.x0)
                    .attr("y", d => d.y0)
                    .attr("width", d => Math.max(0, d.x1 - d.x0))
                    .attr("height", d => Math.max(0, d.y1 - d.y0))
                    .attr("fill", "transparent")
                    .attr("stroke", "black")
                    .attr("stroke-opacity", 1)
                    .attr("stroke-width", 1)
                    .style("pointer-events", "all")
                    .style("cursor", "zoom-in")
                    .on("click", (event, d) => {
                        event.stopPropagation();
                        vis.currentPrefix = d.data.codePrefix || "";
                        vis.dispatcher.call("filtersChanged", event, {filter: "job", value: d.data.codePrefix});
                    }),
                update => update,
                exit => exit.transition().duration(300).style("opacity", 0).remove()
            )
            .transition()
            .duration(500)
            .ease(d3.easeCubicInOut)
            .attr("x", d => d.x0)
            .attr("y", d => d.y0)
            .attr("width", d => Math.max(0, d.x1 - d.x0))
            .attr("height", d => Math.max(0, d.y1 - d.y0));
    }

    renderLeaves(leaves) {
        let vis = this;

        const leaf = vis.leafLayer.selectAll("g.leaf")
            .data(leaves, d => d.data.codePrefix || d.data.code || d.data.name)
            .join(
                enter => {
                    const g = enter.append("g")
                        .attr("class", "leaf")
                        .style("opacity", 0);

                    g.append("rect");

                    g.append("clipPath")
                        .attr("id", d => `clip-${(d.data.codePrefix || d.data.code).replace(/\s+/g, "-")}`)
                        .append("rect");

                    g.append("text");

                    return g;
                },
                update => update,
                exit => exit.transition().duration(300).style("opacity", 0).remove()
            );

        leaf.transition()
            .duration(500)
            .ease(d3.easeCubicInOut)
            .style("opacity", 1)
            .attr("transform", d => `translate(${d.x0}, ${d.y0})`);
            //.style("pointer-events", "none");

        leaf.select("rect")
            .transition()
            .duration(500)
            .ease(d3.easeCubicInOut)
            .attr("width", d => Math.max(0, d.x1 - d.x0))
            .attr("height", d => Math.max(0, d.y1 - d.y0))
            .attr("fill", d => vis.colorScale(d.data.averageStay || 0))
            //.attr("fill-opacity", d => vis.colorScale(d.data.averageStay || 0))
            .attr("stroke", "#fff");

        leaf.select("clipPath rect")
            .transition()
            .duration(500)
            .ease(d3.easeCubicInOut)
            .attr("width", d => Math.max(0, d.x1 - d.x0))
            .attr("height", d => Math.max(0, d.y1 - d.y0));

        leaf.each(function(d) {
            const g = d3.select(this);
            const text = g.select("text");

            const w = d.x1 - d.x0;
            const h = d.y1 - d.y0;

            if(w < 50 || h < 30) return;

            const label = d.data.label || d.data.name || "";
            const avg = `⌀ ${d3.format(".1f")(d.data.averageStay || 0)} months unemployed`;
            const people = `⌀ ${Math.round(d.data.balance / 12)} people unemployed per month`;

            const maxChars = Math.max(3, Math.floor(w / 7));

            text.selectAll("tspan").remove();

            text.attr("clip-path", `url(#clip-${(d.data.codePrefix || d.data.code).replace(/\s+/g, "-")})`)
                .attr("x", 4)
                .attr("y", 0)
                .attr("font-size", 11)
                .attr("fill", "#111");

            text.append("tspan")
                .attr("x", 4)
                .attr("dy", "1.2em")
                .text(vis.truncateText(label, maxChars));

            text.append("tspan")
                .attr("x", 4)
                .attr("dy", "1.1em")
                .attr("fill-opacity", 0.75)
                .text(vis.truncateText(avg, maxChars));

            text.append("tspan")
                .attr("x", 4)
                .attr("dy", "1.1em")
                .attr("fill-opacity", 0.75)
                .text(vis.truncateText(people, maxChars));
        });
    }

    hierarchyUp(){
        let vis = this;
        if(vis.currentPrefix.length > 0){
            vis.currentPrefix = vis.currentPrefix.slice(0, -1);
            vis.dispatcher.call("filtersChanged", null, {filter: "job", value: vis.currentPrefix});
        }
    }

    truncateText(text, maxChars) {
        if (!text) return "";
        if (text.length <= maxChars) return text;
        return text.slice(0, Math.max(0, maxChars - 1)) + "…";
    }

    updateVis(newData, newScaleMaximum) {

        let vis = this;

        vis.data = newData;

        vis.config.scaleMaximum = newScaleMaximum;

        const nodeToRender = vis.findNodeByPrefix(vis.data, vis.currentPrefix) || vis.data;

        this.renderVis(nodeToRender);
    }

    findNodeByPrefix(node, prefix){
        if(!prefix || node.codePrefix === prefix) return node;
        if(!node.children) return null;

        for(const child of node.children){
            const found = this.findNodeByPrefix(child, prefix);
            if(found) return found;
        }

        return null;
    }

    navigateTo(prefix){
        let vis = this;
        vis.currentPrefix = prefix || "";
        vis.dispatcher.call("filtersChanged", null, {filter: "job", value: vis.currentPrefix});
    }

    renderEmptyState(isEmpty){
        let vis = this;
        vis.svg.selectAll("text.treemap-empty")
            .data(isEmpty ? [0] : [])
            .join(
                enter => enter.append("text")
                    .attr("class", "treemap-empty")
                    .attr("x", vis.width / 2)
                    .attr("y", vis.height / 2)
                    .attr("text-anchor", "middle")
                    .attr("fill", "#888")
                    .attr("font-size", 16)
                    .attr("font-weight", 600)
                    .text("No Data"),
                update => update,
                exit => exit.remove()
            );
    }

}
