/*
 * Copyright (c) 2017 CCS/GMRV/UPM/URJC.
 *
 * Authors: Juan P. Brito <juanpedro.brito@upm.es>
 * 			Nicusor Cosmin Toader <cosmin.toader.nicu@gmail.com> 
 *
 * This library is free software; you can redistribute it and/or modify it under
 * the terms of the GNU Lesser General Public License version 3.0 as published
 * by the Free Software Foundation.
 *
 * This library is distributed in the hope that it will be useful, but WITHOUT
 * ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS
 * FOR A PARTICULAR PURPOSE.  See the GNU Lesser General Public License for more
 * details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with this library; if not, write to the Free Software Foundation, Inc.,
 * 51 Franklin Street, Fifth Floor, Boston, MA 02110-1301 USA.
 *
 */

MSP.GlobalConnectionsViewGraph = function () {
    this.MSPViewType = "GlobalCV";

    this.marginRatios = {
        top: 0.01,
        bottom: 0.04,
        left: 0.04,
        right: 0.06
    };

    this.minLeftMargin = 60;
    this.minRightMargin = 90;

    this.graphRatio = 0.5;

    this.tooltipMarginRatio = 0.005;

    this.circleRatio = 0.01;

    this.firstGraphMargin;
    this.scndGraphMargin;
    this.firstGraphDim;
    this.scndGraphDim;
    this.svg;

    this.legendRatios ={margin: 0.01, fontSize: 1.3, lineHeight: 1.5, circleWidth: 0.005};
    this.graphTitleFontSizeRatio = 1.3;
    this.fontSizeRatio = 0.012;
    this.minFontSize = 10;
};

MSP.GlobalConnectionsViewGraph.prototype = {
    constructor: MSP.GlobalConnectionsViewGraph,

    resize: function () {
        this.generateGlobalConnectionsViewGraph();
    },
    generateGlobalConnectionsViewGraph: function () {
        d3.selectAll("svg").filter(function () {
            return !this.classList.contains('color')
        }).remove();

        d3.selectAll("canvas").filter(function () {
            return !this.classList.contains('imgCanvas')
        }).remove();

        var renderWidth = _SigletonConfig.width;
        var renderHeight = _SigletonConfig.height;
        this.firstGraphMargin = {
            top: renderHeight * this.marginRatios.top,
            cumulativeTop: 0,
            right: Math.max(this.minRightMargin, renderWidth * this.marginRatios.right),
            bottom: renderHeight * this.marginRatios.bottom,
            left: Math.max(this.minLeftMargin, renderWidth * this.marginRatios.left)
        };

        this.firstGraphDim = {
            width: _SigletonConfig.width - this.firstGraphMargin.right - this.firstGraphMargin.left,
            height: (_SigletonConfig.height * this.graphRatio) - this.firstGraphMargin.top
            - this.firstGraphMargin.bottom
        };

        this.firstGraphMargin.cumulativeTop = this.firstGraphMargin.top;

        this.scndGraphMargin = {
            top: renderHeight * this.marginRatios.top,
            cumulativeTop: 0,
            right: Math.max(this.minRightMargin, renderWidth * this.marginRatios.right),
            bottom: renderHeight * this.marginRatios.bottom,
            left: Math.max(this.minLeftMargin, renderWidth * this.marginRatios.left)
        };

        this.scndGraphDim = {
            width: _SigletonConfig.width - this.scndGraphMargin.right - this.scndGraphMargin.left,
            height: (_SigletonConfig.height * this.graphRatio) - this.scndGraphMargin.top - this.scndGraphMargin.bottom
        };

        this.scndGraphMargin.cumulativeTop = this.firstGraphMargin.top + this.firstGraphDim.height
            + this.firstGraphMargin.bottom + this.scndGraphMargin.top;

        this.svg = d3.select("#renderArea")
            .append("svg")
            .attr("width", _SigletonConfig.width)
            .attr("height", _SigletonConfig.height)
            .append("g")
            .call(d3.behavior.zoom().scaleExtent([1, Infinity]).on("zoom", this.zoom))
            .attr("transform",
                "translate(" + this.firstGraphMargin.left + "," + this.firstGraphMargin.cumulativeTop + ")")
            .append("g")
            .attr("class", "graphs");

        this.updateVisualization();

        this.svg
            .append("rect")
            .attr("class", "overlay")
            .attr("x", -_SigletonConfig.width)
            .attr("y", -_SigletonConfig.height)
            .attr("width", _SigletonConfig.width * 3)
            .attr("height", _SigletonConfig.height * 3)
            .style("opacity", "0.0");

    },
    updateVisualization: function () {
        var lIndex = _SimulationController.actSimStep % _SimulationData.numSimStepsPerFile;
        var dataEE = {text: "EE Conn.", textShort: "", max: 0, color: _SigletonConfig.EEColor, data: []};
        var dataEI = {text: "EI  Conn.", textShort: "", max: 0, color: _SigletonConfig.EIColor, data: []};
        var dataIE = {text: "IE  Conn.", textShort: "", max: 0, color: _SigletonConfig.IEColor, data: []};
        var dataII = {text: "II  Conn.", textShort: "", max: 0, color: _SigletonConfig.IIColor, data: []};
        var dataAI = {text: "All E SE.", textShort: "", max: 0, color: _SigletonConfig.EColor, data: []};
        var dataAE = {text: "All I SE.", textShort: "", max: 0, color: _SigletonConfig.IColor, data: []};
        var startStep = _SimulationData.actFile * _SimulationData.numSimStepsPerFile;
        for (var i = 0; i < lIndex + 1; i++) {
            dataEE.data.push({
                simStep: startStep,
                value: _SimulationData.EEConn[i]
            });
            if (_SimulationData.EEConn[i] > dataEE.max) dataEE.max = _SimulationData.EEConn[i];

            dataEI.data.push({
                simStep: startStep,
                value: _SimulationData.EIConn[i]
            });
            if (_SimulationData.EIConn[i] > dataEI.max) dataEI.max = _SimulationData.EIConn[i];

            dataIE.data.push({
                simStep: startStep,
                value: _SimulationData.IEConn[i]
            });
            if (_SimulationData.IEConn[i] > dataIE.max) dataIE.max = _SimulationData.IEConn[i];

            dataII.data.push({
                simStep: startStep,
                value: _SimulationData.IIConn[i]
            });
            if (_SimulationData.IIConn[i] > dataII.max) dataII.max = _SimulationData.IIConn[i];

            dataAE.data.push({
                simStep: startStep,
                value: _SimulationData.AESe[i]
            });
            if (_SimulationData.AESe[i] > dataAE.max) dataAE.max = _SimulationData.AESe[i];

            dataAI.data.push({
                simStep: startStep,
                value: _SimulationData.AISe[i]
            });
            if (_SimulationData.AISe[i] > dataAI.max) dataAI.max = _SimulationData.AISe[i];
            startStep++;
        }

        this.graph(1, this.firstGraphDim, this.firstGraphMargin, [dataEE, dataEI, dataIE, dataII], "Global Connections");
        this.graph(2, this.scndGraphDim, this.scndGraphMargin, [dataAE, dataAI], "Synaptic elements");
    },
    graph: function (graphID, graphDim, graphMargin, dataArray, graphTitle) {
        var self = this;
        var renderWidth = _SigletonConfig.width;
        var renderHeight = _SigletonConfig.height;
        var defaultFontSize = Math.max(Math.min(renderHeight, renderWidth) * this.fontSizeRatio, this.minFontSize);
        var legendProp = {
            margin: renderWidth * this.legendRatios.margin,
            fontSize: defaultFontSize * this.legendRatios.fontSize + "px",
            lineHeight: defaultFontSize * this.legendRatios.lineHeight,
            circleWidth: renderHeight * this.legendRatios.circleWidth
        };
        var axisFontSize = defaultFontSize + "px";
        var titleFontSize = defaultFontSize * this.graphTitleFontSizeRatio + "px";
        var simInitialStep = _SimulationData.actFile * _SimulationData.numSimStepsPerFile;
        var simLastStep = _SimulationController.actSimStep;
        var circleIndicatorRadius = renderHeight * this.circleRatio;

        d3.select(".graph" + graphID).remove();

        var graphElements = this.svg.append("g")
            .attr("class", "graph" + graphID)
            .attr("transform", "translate(0," + graphMargin.cumulativeTop + ")");

        var legendElements = graphElements.append("g")
            .attr("class", "legend a" + graphID);

        var legendText = legendElements.append("text")
            .attr("y", (graphDim.height * 0.5) - (legendProp.lineHeight * dataArray.length * 0.5))
            .attr("x", graphDim.width + graphMargin.left)
            .style("dominant-baseline", "middle")
            .attr("font-size", legendProp.fontSize)
            .attr("font-family", "sans-serif");

        dataArray.forEach(function (d, z) {
            legendElements.append("circle")
                .attr("class", "circleL")
                .attr("cx", graphDim.width + legendProp.margin)
                .attr("cy", (((graphDim.height * 0.5) - (legendProp.lineHeight * dataArray.length * 0.5))
                    + (legendProp.lineHeight * (z + 1))))
                .style("stroke", d.color)
                .style("fill", d.color)
                .attr("r", legendProp.circleWidth);

            legendText.append("tspan")
                .attr("x", graphDim.width + legendProp.margin + legendProp.circleWidth + legendProp.margin)
                .attr("dy", legendProp.lineHeight)
                .text(d.text);
        });

        graphElements.append("line")
            .attr("class", "verticalLine" + graphID)
            .attr("stroke-width", 1)
            .attr("stroke", "#000")
            .attr("x1", 0)
            .attr("x2", 0)
            .attr("y1", 0)
            .attr("y2", graphDim.height)
            .attr("style", "display:none;")
            .style("opacity", "0.5")
            .attr("shape-rendering", "crispEdges");

        var maxDataValue = 0;
        dataArray.forEach(function (data) {
            if (data.max > maxDataValue) maxDataValue = data.max;
        });

        var xScaleStepToWidth = d3.scale.linear()
            .range([0, graphDim.width])
            .domain([simInitialStep, simLastStep]);

        var xAxis = d3.svg.axis()
            .scale(xScaleStepToWidth)
            .tickValues(xScaleStepToWidth.ticks().concat(xScaleStepToWidth.domain()))
            .orient("bottom")
            .innerTickSize(-graphDim.height);

        graphElements.append("g")
            .attr("class", "x axis p" + graphID)
            .attr("transform", "translate(0," + graphDim.height + ")")
            .call(xAxis);

        var yScaleDataToHeight = d3.scale.linear()
            .range([graphDim.height, 0])
            .domain([0, maxDataValue]);

        var yAxis = d3.svg.axis()
            .scale(yScaleDataToHeight)
            .orient("left")
            .tickValues(yScaleDataToHeight.ticks().concat(yScaleDataToHeight.domain()))
            .innerTickSize(-graphDim.width);

        graphElements.append("g")
            .attr("class", "y axis p" + graphID)
            .call(yAxis);


        var yAxisTextWidth = $(".graph" + graphID + " .y.axis text").last()[0].getBoundingClientRect().width;
        var graphTitlePos = {
            x: -((graphMargin.left - yAxisTextWidth) * 0.5) - yAxisTextWidth,
            y: -(graphDim.height * 0.5)
        };

        graphElements.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", graphTitlePos.x)
            .attr("x", graphTitlePos.y)
            .style("text-anchor", "middle")
            .attr("font-family", "sans-serif")
            .attr("font-size", titleFontSize)
            .text(graphTitle);

        var circleIndicatorsBackground = graphElements.append("g");
        var graphLines = graphElements.append("g");
        var circleIndicator = graphElements.append("g");

        var lineFunction = d3.svg.line()
            .x(function (d) {
                return xScaleStepToWidth(d.simStep);
            })
            .y(function (d) {
                return yScaleDataToHeight(d.value);
            });

        dataArray.forEach(function (d) {
            graphLines.append("path")
                .attr("class", "graphLine")
                .style("stroke", d.color)
                .attr("fill", "none")
                .attr("d", lineFunction(d.data));

            circleIndicatorsBackground.append("circle")
                .attr("class", "circleIndicatorBackground")
                .style("display", "none")
                .style("stroke", "none")
                .style("fill", "white")
                .attr("r", circleIndicatorRadius);

            circleIndicator.append("circle")
                .attr("class", "circleIndicator")
                .style("display", "none")
                .style("stroke", d.color)
                .style("fill", "none")
                .style("stroke-width", "0.15vmin")
                .attr("r", circleIndicatorRadius);
        });

        d3.select(".graphs")
            .append("rect")
            .attr("class", "overlay a" + graphID)
            .attr("width", graphDim.width)
            .attr("y", graphMargin.cumulativeTop)
            .attr("height", graphDim.height)
            .attr("fill", "none")
            .on("mousemove", function () {
                var mousePos = d3.mouse(this);
                var tooltip = {
                    x: d3.mouse(d3.select('body').node())[0] + self.tooltipMarginRatio * _SigletonConfig.width,
                    y: d3.mouse(d3.select('body').node())[1] + self.tooltipMarginRatio * _SigletonConfig.height,
                    width: $("#tooltip").outerWidth(),
                    height: $("#tooltip").outerHeight(),
                    html: ""
                };

                if ((tooltip.x + tooltip.width) > $(window).width()) tooltip.x -= tooltip.width;
                if ((tooltip.y + tooltip.height) > $("#renderArea").height()) tooltip.y -= tooltip.height;

                var simulationStep = Math.round(xScaleStepToWidth.invert(mousePos[0]));
                var graphStepPosition = 0;
                if (simLastStep > 0) graphStepPosition = simulationStep * (graphDim.width / simLastStep);

                tooltip.html = "<span class='stepTooltip'><b>" + simulationStep + "</b></span>";
                dataArray.forEach(function (d) {
                    tooltip.html += "<div class='circle' style='background-color:" + d.color + "'></div><b>"
                        + d.textShort + "</b><b> " + d.data[simulationStep].value + "</b><br>";
                });

                d3.select("#tooltip")
                    .html(tooltip.html)
                    .style("left", tooltip.x + "px")
                    .style("top", tooltip.y + "px")
                    .classed("hidden", false);

                d3.selectAll('.verticalLine' + graphID)
                    .style("display", "inline")
                    .attr("x1", graphStepPosition)
                    .attr("x2", graphStepPosition);

                circleIndicator.selectAll('.circleIndicator')
                    .style("display", "inline")
                    .attr("cy", function (d, i) {
                        return yScaleDataToHeight(dataArray[i].data[simulationStep].value);
                    })
                    .attr("cx", graphStepPosition);

                circleIndicatorsBackground.selectAll('.circleIndicatorBackground')
                    .style("display", "inline")
                    .attr("cy", function (d, i) {
                        return yScaleDataToHeight(dataArray[i].data[simulationStep].value);
                    })
                    .attr("cx", graphStepPosition);
            })
            .on("mouseout", function () {
                d3.selectAll('.verticalLine' + graphID).style("display", "none");
                d3.selectAll('.circleIndicator').style("display", "none");
                d3.selectAll('.circleIndicatorBackground').style("display", "none");
                d3.select("#tooltip").classed("hidden", true);
            });

        d3.selectAll(".axis.p" + graphID + " .tick").selectAll("line")
            .attr("stroke-width", 1)
            .attr("stroke", "#000")
            .style("opacity", "0.1");

        d3.select(d3.selectAll(".x.axis.p" + graphID + " .tick").select("line")[0][0]).style("opacity", "1");
        d3.select(d3.selectAll(".y.axis.p" + graphID + " .tick").select("line")[0][0]).style("opacity", "1");

        d3.selectAll(".tick").selectAll("text")
            .attr("font-family", "sans-serif")
            .attr("font-size", axisFontSize);

        d3.selectAll(".axis").selectAll("path").remove();
    },
    zoom: function () {
        _SimulationController.view.svg.attr("transform",
            "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
    }
};
