/**
 * @brief
 * @author  Juan Pedro Brito Mendez <juanpebm@gmail.com>
 * @date
 * @remarks Do not distribute without further notice.
 */

MSP.GlobalConnectionsViewGraph = function () {
    this.MSPViewType = "GlobalCV";
    this.marginTopRatio = 0.01;
    this.marginBottomRatio = 0.03;
    this.marginLeftRatio = 0.04;
    this.marginRightRatio = 0.08;
    this.minLeftMargin = 60;
    this.minRightMargin = 90;
    this.graphRatio = 0.5;
    this.tooltipMarginRatio = 0.005;
    this.firstGraphMargin;
    this.scndGraphMargin;
    this.firstGraphWidth;
    this.firstGraphHeight;
    this.scndGraphWidth;
    this.scndGraphHeight;
    this.svg;
};

MSP.GlobalConnectionsViewGraph.prototype = {
    constructor: MSP.GlobalConnectionsViewGraph,

    resize: function () {
        this.generateGlobalConnectionsViewGraph();
    },
    generateGlobalConnectionsViewGraph: function () {
        d3.selectAll("svg").filter(function() {
            return !this.classList.contains('color')
        }).remove();

        d3.selectAll("canvas")
            .remove();

        var renderWidth = _SigletonConfig.width;
        var renderHeight = _SigletonConfig.height;
        this.firstGraphMargin = {
            top: renderHeight * this.marginTopRatio,
            right: Math.max(this.minRightMargin, renderWidth * this.marginRightRatio),
            bottom: renderHeight * this.marginBottomRatio,
            left: Math.max(this.minLeftMargin, renderWidth * this.marginLeftRatio)
        };
        this.firstGraphWidth = _SigletonConfig.width - this.firstGraphMargin.right - this.firstGraphMargin.left;
        this.firstGraphHeight = (_SigletonConfig.height * this.graphRatio) - this.firstGraphMargin.top
            - this.firstGraphMargin.bottom;

        this.scndGraphMargin = {
            top: renderHeight * this.marginTopRatio,
            right: Math.max(this.minRightMargin, renderWidth * this.marginRightRatio),
            bottom: renderHeight * this.marginBottomRatio,
            left: Math.max(this.minLeftMargin, renderWidth * this.marginLeftRatio)
        };
        this.scndGraphWidth = _SigletonConfig.width - this.scndGraphMargin.right - this.scndGraphMargin.left;
        this.scndGraphHeight = (_SigletonConfig.height * this.graphRatio) - this.scndGraphMargin.top
            - this.scndGraphMargin.bottom;

        this.svg = d3.select("#renderArea")
            .append("svg")
            .attr("width", _SigletonConfig.width)
            .attr("height", _SigletonConfig.height)
            .append("g")
            .call(d3.behavior.zoom().scaleExtent([1, Infinity]).on("zoom", this.zoom))
            .attr("transform", "translate(" + this.firstGraphMargin.left + "," + this.firstGraphMargin.top + ")")
            .append("g")
            .attr("class", "graphs");

        this.updateVisualization();

        this.svg
            .append("rect")
            .attr("class", "overlay")
            .attr("x", 0 - _SigletonConfig.width)
            .attr("y", 0 - _SigletonConfig.height)
            .attr("width", _SigletonConfig.width * 3)
            .attr("height", _SigletonConfig.height * 3)
            .style("opacity", "0.0");

    },
    updateVisualization: function () {
        var lIndex = _SimulationController.actSimStep % _SimulationData.numSimStepsPerFile;
        var dataEE = {text: "EE Conn.", textShort: "", max:0, color: _SigletonConfig.EEColor, data: []};
        var dataEI = {text: "EI  Conn.", textShort: "", max:0, color: _SigletonConfig.EIColor, data: []};
        var dataIE = {text: "IE  Conn.", textShort: "", max:0, color: _SigletonConfig.IEColor, data: []};
        var dataII = {text: "II  Conn.", textShort: "", max:0, color: _SigletonConfig.IIColor, data: []};
        var dataAI = {text: "All E SE.", textShort: "", max:0, color: _SigletonConfig.EColor, data: []};
        var dataAE = {text: "All I SE.", textShort: "", max:0, color: _SigletonConfig.IColor, data: []};
        for (var i = 0; i < lIndex + 1; i++) {
            dataEE.data.push({
                value: i,
                data: _SimulationData.EEConn[i]
            });
            if(_SimulationData.EEConn[i]> dataEE.max) dataEE.max = _SimulationData.EEConn[i];

            dataEI.data.push({
                value: i,
                data: _SimulationData.EIConn[i]
            });
            if(_SimulationData.EIConn[i]> dataEI.max) dataEI.max = _SimulationData.EIConn[i];

            dataIE.data.push({
                value: i,
                data: _SimulationData.IEConn[i]
            });
            if(_SimulationData.IEConn[i]> dataIE.max) dataIE.max = _SimulationData.IEConn[i];

            dataII.data.push({
                value: i,
                data: _SimulationData.IIConn[i]
            });
            if(_SimulationData.IIConn[i]> dataII.max) dataII.max = _SimulationData.IIConn[i];

            dataAE.data.push({
                value: i,
                data: _SimulationData.AESe[i]
            });
            if(_SimulationData.AESe[i]> dataAE.max) dataAE.max = _SimulationData.AESe[i];

            dataAI.data.push({
                value: i,
                data: _SimulationData.AISe[i]
            });
            if(_SimulationData.AISe[i]> dataAI.max) dataAI.max = _SimulationData.AISe[i];
        }
        var secondGraphMarginTop = this.scndGraphMargin.top + this.firstGraphHeight + this.firstGraphMargin.top + this.firstGraphMargin.bottom;

        this.graph(1, this.firstGraphWidth, this.firstGraphMargin.left, this.firstGraphMargin.top, this.firstGraphHeight, [dataEE, dataEI, dataIE, dataII], "Global Connections");
        this.graph(2, this.scndGraphWidth, this.scndGraphMargin.left, secondGraphMarginTop, this.scndGraphHeight, [dataAE, dataAI], "Synaptic elements");

    },
    graph: function (i, width, marginLeft, marginTop, height, data, graphTitle) {
        var renderWidth = _SigletonConfig.width;
        var renderHeight = _SigletonConfig.height;
        var horizontalSpacing = renderWidth * 0.01;
        var self = this;

        d3.select(".graph" + i).remove();

        var graphElements = this.svg.append("g")
            .attr("class", "graph" + i);

        var xx = d3.scale.linear().range([0, width]);

        var gLegend = graphElements.append("g")
            .attr("class", "legend a" + i)
            .attr("transform", "translate(0," + marginTop + ")");

        graphElements.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 0 - (marginLeft / 2))
            .attr("x", 0 - (height / 2) - marginTop)
            .attr("class", "textoA t" + i)
            .style("text-anchor", "middle")
            .style("dominant-baseline", "text-after-edge")
            .text(graphTitle);

        var legendText = gLegend.append("text")
            .attr("y", (height / 2) - (renderHeight * 0.024 * 2))
            .attr("x", width + marginLeft)
            .style("dominant-baseline", "middle")
            .attr("class", "textoL");

        data.forEach(function (d, z) {
            gLegend.append("circle")
                .attr("class", "circleL")
                .attr("cx", width + horizontalSpacing)
                .attr("cy", ((height / 2) + (renderHeight * 0.024 * (z - 1))))
                .style("stroke", d.color)
                .style("fill", d.color)
                .attr("r", renderHeight * 0.005);

            legendText.append("tspan")
                .attr("x", width + horizontalSpacing + renderHeight * 0.005 * 2)
                .attr("dy", renderHeight * 0.024)
                .text(d.text);
        });

        graphElements.append("line")
            .attr("class", "verticalLine" + i)
            .attr("stroke-width", 1)
            .attr("stroke", "#000")
            .attr("x1", 0)
            .attr("x2", 0)
            .attr("y1", marginTop)
            .attr("y2", height + marginTop)
            .attr("style", "display:none;")
            .style("opacity", "0.5")
            .attr("shape-rendering", "crispEdges");


        var valueline = d3.svg.line()
            .x(function (d) {
                return xx(d.value);
            })
            .y(function (d) {
                return y(d.data);
            });

        var max = 0;
        data.forEach(function (data) {
            if(data.max > max) max = data.max;
        });

        var xScale = d3.scale.linear().range([0, width], 1);
        xScale.domain([0, _SimulationController.actSimStep]);
        var xAxis = d3.svg.axis()
            .scale(xScale)
            .tickValues(xScale.ticks().concat(xScale.domain()))
            .orient("bottom")
            .innerTickSize(-height);

        var y = d3.scale.linear().range([height, 0]).domain([0, max]);
        var yAxis = d3.svg.axis().scale(y).orient("left").tickValues(y.ticks().concat(y.domain())).innerTickSize(-width);

        graphElements.append("g")
            .attr("class", "x axis p" + i)
            .attr("transform", "translate(0," + (marginTop + height) + ")")
            .call(xAxis);

        graphElements.append("g")
            .attr("transform", "translate(0," + (marginTop) + ")")
            .attr("class", "y axis p" + i)
            .call(yAxis);

        graphElements.selectAll(".y.axis.p" + i + " text").attr("transform", "translate(" + -4 + ",0)");
        graphElements.selectAll(".x.axis.p" + i + " text").attr("transform", "translate(0," + 4 + ")");

        xx.domain([0, _SimulationController.actSimStep]);
        var x = d3.scale.linear().range([0, _SimulationController.actSimStep]);
        x.domain([0, width]);
        var gBurbujas = graphElements.append("g").attr("class", "history c" + i).attr("transform", "translate(0," + marginTop + ")");
        var glineas = graphElements.append("g").attr("class", "history b" + i).attr("transform", "translate(0," + marginTop + ")");
        var g = graphElements.append("g").attr("class", "history a" + i).attr("transform", "translate(0," + marginTop + ")");

        data.forEach(function (d, z) {
            glineas.append("path")
                .attr("class", "graphLine")
                .style("stroke", d.color)
                .attr("d", valueline(d.data));

            gBurbujas.append("circle")
                .attr("class", "circleIndicatorBackground")
                .style("display", "none")
                .style("stroke", "none")
                .style("fill", "white")
                .attr("r", renderHeight * 0.01);

            g.append("circle")
                .attr("class", "circleIndicator")
                .style("display", "none")
                .style("stroke", d.color)
                .style("fill", "none")
                .style("stroke-width", "0.15vmin")
                .attr("r", renderHeight * 0.01);
        });

        var spacing
        d3.select(".graphs")
            .append("rect")
            .attr("class", "overlay a" + i)
            .attr("width", width)
            .attr("y", marginTop)
            .attr("height", height)
            .on("mousemove", function () {
                var mousePos = d3.mouse(this);
                var tooltipX = d3.mouse(d3.select('body').node())[0] + self.tooltipMarginRatio * _SigletonConfig.width;
                var tooltipY = d3.mouse(d3.select('body').node())[1] + self.tooltipMarginRatio * _SigletonConfig.height;
                var tooltipWidth = $("#tooltip").outerWidth();
                var tooltipHeight = $("#tooltip").outerHeight();
                var simulationStep = Math.round(x(mousePos[0]));
                var graphStepPosition = simulationStep * (width / _SimulationController.actSimStep);

                if ((tooltipX + tooltipWidth) > $(window).width())
                    tooltipX -= tooltipWidth;

                if ((tooltipY + tooltipHeight) > $("#renderArea").height())
                    tooltipY -= tooltipHeight;

                var tooltipHTML = "<span class='stepTooltip'><b>" + simulationStep + "</b></span>";
                data.forEach(function (d) {
                    tooltipHTML += "<div class='circle' style='background-color:" + d.color + "'></div><b>" + d.textShort +
                        "</b><b> " + d.data[Math.round(x(mousePos[0]))].data + "</b><br>";
                });

                d3.select("#tooltip")
                    .html(tooltipHTML)
                    .style("left", tooltipX+ "px")
                    .style("top", tooltipY +"px")
                    .classed("hidden", false);

                var ys = [];
                g.selectAll('.circleIndicator')[0].forEach(function (d, i) {
                    ys.push(y(data[i].data[Math.round(x(mousePos[0]))].data));
                });

                d3.selectAll('.verticalLine' + i)
                    .style("display", "inline")
                    .attr("x1", graphStepPosition)
                    .attr("x2", graphStepPosition);

                g.selectAll('.circleIndicator')
                    .style("display", "inline")
                    .attr("cy", function (d, i) {
                        return y(data[i].data[Math.round(x(mousePos[0]))].data);
                    })
                    .attr("cx", graphStepPosition);

                gBurbujas.selectAll('.circleIndicatorBackground')
                    .style("display", "inline")
                    .attr("cy", function (d, i) {
                        return y(data[i].data[Math.round(x(mousePos[0]))].data);
                    })
                    .attr("cx", graphStepPosition);
            })
            .on("mouseout", function () {
                d3.selectAll('.verticalLine' + i).style("display", "none");
                d3.selectAll('.circleIndicator').style("display", "none");
                d3.selectAll('.circleIndicatorBackground').style("display", "none");
                d3.select("#tooltip").classed("hidden", true);
            });

    },
    zoom: function () {
        _SimulationController.view.svg.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
    }
};
