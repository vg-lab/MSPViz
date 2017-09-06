/**
 * @brief
 * @author  Juan Pedro Brito Mendez <juanpebm@gmail.com>
 * @date
 * @remarks Do not distribute without further notice.
 */

MSP.GraphDetailMicroscopicView = function () {
    this.margin;
    this.margin2;

    this.numYTicks;
    this.ActData;
    this.lConnectionTypes;

    this.width;
    this.height;
    this.width2;
    this.height2;
    this.svg;
    this.maxCalciumValue;
    this.maxEConn;
    this.maxIConn;
    this.maxAConn;
    this.MSPViewType = "GlobalCV";
    this.colorScale;
    this.numBars = 15;
    this.tooltipMarginRatio = 0.005;

    this.defaultFontSize;
    this.axisFontSize;
    this.titleFontSize;
    this.fontSizeRatio = 0.012;
    this.minFontSize = 10;
    this.textBarMarginRatio;
    this.histogramStepsCreated;
    this.lastFile;
    this.barLineHeight;

    this.marginRatios = {
        top: 0.01,
        bottom: 0.04,
        left: 0.08,
        right: 0.005
    };

    this.minLeftMargin = 60;
    this.minRightMargin = 10;

    this.graphRatio = 0.15;

    this.tooltipMarginRatio = 0.005;

    this.circleRatio = 0.01;

    this.firstGraphMargin;
    this.scndGraphMargin;
    this.firstGraphDim;
    this.scndGraphDim;
    this.svg;

    this.legendRatios = {margin: 0.01, fontSize: 1.3, lineHeight: 1.5, circleWidth: 0.005};
    this.graphTitleFontSizeRatio = 1.3;
    this.fontSizeRatio = 0.012;
    this.minFontSize = 10;
};

MSP.GraphDetailMicroscopicView.prototype = {
    constructor: MSP.GraphDetailMicroscopicView,

    resize: function () {
        this.generateGraph();
    },
    generateGraph: function () {

        var self = this;

        this.maxCalciumValue = Math.max.apply(Math, _SimulationData.gNeuronsDetails[_SigletonConfig.neuronSelected].Calcium);
        this.maxEConn = Math.max.apply(Math, _SimulationData.gNeuronsDetails[_SigletonConfig.neuronSelected].DeSeEA);
        this.maxIConn = Math.max.apply(Math, _SimulationData.gNeuronsDetails[_SigletonConfig.neuronSelected].DeSeIA);
        this.maxAConn = Math.max.apply(Math, _SimulationData.gNeuronsDetails[_SigletonConfig.neuronSelected].AxSeA);

        if (_SimulationData.gNeurons[_SigletonConfig.neuronSelected].NAct === "E") {
            this.colorScale = _SimulationData.CaEScale;

        } else {
            this.colorScale = _SimulationData.CaIScale;

        }

        var renderWidth = _SigletonConfig.width;
        var renderHeight = _SigletonConfig.height;

        this.lastFile = _SimulationData.actFile;

        this.histogramStepsCreated = 0;
        this.graphTitleFontSizeRatio = 1.3;
        this.defaultFontSize = Math.max(Math.min(renderHeight, renderWidth) * this.fontSizeRatio, this.minFontSize);
        this.axisFontSize = this.defaultFontSize + "px";
        this.titleFontSize = this.defaultFontSize * this.graphTitleFontSizeRatio + "px";
        this.barFontSize = this.defaultFontSize + "px";
        this.barLineHeight = this.defaultFontSize;
        this.axisLineHeight = this.defaultFontSize * 1.4;

        var renderWidth = _SigletonConfig.width * 0.49;
        var width = _SigletonConfig.width * 0.49;
        var ratioHeight = (_SigletonConfig.height);

        this.firstGraphMargin = {
            top: renderHeight * this.marginRatios.top,
            cumulativeTop: 0,
            right: Math.max(this.minRightMargin, renderWidth * this.marginRatios.right),
            bottom: renderHeight * this.marginRatios.bottom,
            left: Math.max(this.minLeftMargin, renderWidth * this.marginRatios.left)
        };

        this.firstGraphDim = {
            width: renderWidth - this.firstGraphMargin.right - this.firstGraphMargin.left,
            height: (_SigletonConfig.height * 0.3) - this.firstGraphMargin.top
            - this.firstGraphMargin.bottom
        };
        this.firstGraphMargin.cumulativeTop = this.firstGraphMargin.top;

        this.scndGraphMargin = {
            top: renderHeight * this.marginRatios.top,
            cumulativeTop: 0,
            right: this.firstGraphMargin.right,
            bottom: renderHeight * this.marginRatios.bottom,
            left: this.firstGraphMargin.left
        };

        this.scndGraphDim = {
            width: this.firstGraphDim.width,
            height: (_SigletonConfig.height * 0.1) - this.scndGraphMargin.top - this.scndGraphMargin.bottom
        };

        this.scndGraphMargin.cumulativeTop = this.firstGraphMargin.cumulativeTop + this.firstGraphDim.height
            + this.firstGraphMargin.bottom + this.scndGraphMargin.top;

        this.thrdGraphMargin = {
            top: renderHeight *this.marginRatios.top,
            cumulativeTop: 0,
            right: this.firstGraphMargin.right,
            bottom: renderHeight * 0.005,
            left: this.firstGraphMargin.left
        };

        this.thrdGraphDim = {
            width: this.firstGraphDim.width,
            height: (_SigletonConfig.height * 0.11) - this.thrdGraphMargin.top - this.thrdGraphMargin.bottom
        };

        this.thrdGraphMargin.cumulativeTop = this.scndGraphMargin.cumulativeTop + this.scndGraphDim.height
            + this.scndGraphMargin.bottom + this.thrdGraphMargin.top;

        this.frthGraphMargin = {
            top: renderHeight * 0.005,
            cumulativeTop: 0,
            right: this.firstGraphMargin.right,
            bottom: renderHeight * 0.005,
            left: this.firstGraphMargin.left
        };

        this.frthGraphDim = {
            width: this.firstGraphDim.width,
            height: (_SigletonConfig.height * 0.1) - this.frthGraphMargin.top - this.frthGraphMargin.bottom
        };
        this.frthGraphMargin.cumulativeTop = this.thrdGraphMargin.cumulativeTop + this.thrdGraphDim.height
            + this.thrdGraphMargin.bottom + this.frthGraphMargin.top;

        this.ffthGraphMargin = {
            top: renderHeight * 0.005,
            cumulativeTop: 0,
            right: this.firstGraphMargin.right,
            bottom: renderHeight * this.marginRatios.bottom,
            left: this.firstGraphMargin.left
        };

        this.ffthGraphDim = {
            width: this.firstGraphDim.width,
            height: (_SigletonConfig.height * 0.14) - this.ffthGraphMargin.top - this.ffthGraphMargin.bottom
        };
        this.ffthGraphMargin.cumulativeTop = this.frthGraphMargin.cumulativeTop + this.frthGraphDim.height
            + this.frthGraphMargin.bottom + this.ffthGraphMargin.top;

        this.sxthGraphMargin = {
            top: renderHeight * this.marginRatios.top,
            cumulativeTop: 0,
            right: this.firstGraphMargin.right,
            bottom: renderHeight * this.marginRatios.bottom,
            left: this.firstGraphMargin.left
        };

        this.sxthGraphDim = {
            width: this.firstGraphDim.width,
            height: (_SigletonConfig.height * 0.25) - this.sxthGraphMargin.top
            - this.sxthGraphMargin.bottom
        };
        this.sxthGraphMargin.cumulativeTop = this.ffthGraphMargin.cumulativeTop + this.ffthGraphDim.height
            + this.ffthGraphMargin.bottom + this.sxthGraphMargin.top;


        // this.width = width - this.margin.right - this.margin.left;
        // this.height = (_SigletonConfig.height) * 0.21;
        this.textBarMarginRatio = 0.01;
        // this.dimension = {width: this.width, height: this.height};
        //
        // this.margin2 = {
        //     top: this.height + this.margin.top + ratioHeight * 0.02,
        //     right: 15,
        //     bottom: 0,
        //     left: Math.max(50, width * 0.1)
        // };
        // this.width2 = width - this.margin2.right - this.margin2.left;
        // this.height2 = (_SigletonConfig.height) * 0.08;
        //
        // this.margin3 = {
        //     top: this.height2 + this.margin2.top + ratioHeight * 0.06,
        //     right: 15,
        //     bottom: 0,
        //     left: Math.max(50, width * 0.1)
        // };
        // this.width3 = width - this.margin3.right - this.margin3.left;
        // this.height3 = (_SigletonConfig.height) * 0.07;
        // this.dimension3 = {width: this.width3, height: this.height3};
        //
        // this.margin4 = {
        //     top: this.height3 + this.margin3.top + ratioHeight * 0.03,
        //     right: 15,
        //     bottom: 0,
        //     left: Math.max(50, width * 0.1)
        // };
        // this.width4 = width - this.margin4.right - this.margin4.left;
        // this.height4 = (_SigletonConfig.height) * 0.07;
        // this.dimension4 = {width: this.width4, height: this.height4};
        //
        // this.margin5 = {
        //     top: this.height4 + this.margin4.top + ratioHeight * 0.03,
        //     right: 15,
        //     bottom: 0,
        //     left: Math.max(50, width * 0.1)
        // };
        // this.width5 = width - this.margin5.right - this.margin5.left;
        // this.height5 = (_SigletonConfig.height) * 0.07;
        // this.dimension5 = {width: this.width5, height: this.height5};
        //
        // this.margin6 = {
        //     top: this.height5 + this.margin5.top + ratioHeight * 0.04,
        //     right: 15,
        //     bottom: 0,
        //     left: Math.max(50, width * 0.1)
        // };
        // this.width6 = width - this.margin6.right - this.margin6.left;
        // this.height6 = (_SigletonConfig.height) * 0.23;

        this.numYTicks = 10;
        d3.select("#caGraph").remove();

        this.svg = d3.select("#renderArea")
            .append("svg")
            .style("width", "49%")
            .style("border-right", "1px solid #ebebeb")
            .attr("id", "caGraph")
            .attr("width", width)
            .attr("height", _SigletonConfig.height)
            .append("g")
            .call(d3.behavior.zoom().scaleExtent([1, 10]).on("zoom", self.zoom))
            .attr("class", "graphs");

        d3.select("#renderArea")
            .select("svg")
            .append("g")
            .attr("class", "overlays");

        this.initGraphs();

    },
    initGraphs: function () {
        this.lConnectionTypes = [];
        var numBars = this.numBars;

        var lIndex = _SimulationController.actSimStep % _SimulationData.numSimStepsPerFile;
        var length = lIndex + 1 < numBars ? 0 : lIndex - numBars + 1;
        this.ActData = [];
        this.EData = [];
        this.IData = [];
        this.AData = [];

        this.maxCalciumValue = Math.max.apply(Math, _SimulationData.gNeuronsDetails[_SigletonConfig.neuronSelected].Calcium);
        this.maxEConn = Math.max.apply(Math, _SimulationData.gNeuronsDetails[_SigletonConfig.neuronSelected].DeSeEA);
        this.maxIConn = Math.max.apply(Math, _SimulationData.gNeuronsDetails[_SigletonConfig.neuronSelected].DeSeIA);
        this.maxAConn = Math.max.apply(Math, _SimulationData.gNeuronsDetails[_SigletonConfig.neuronSelected].AxSeA);

        var startStep = _SimulationData.actFile * _SimulationData.numSimStepsPerFile;
        for (var i = length; i < lIndex + 1; i++) {

            this.ActData.push({
                id: i - length,
                connType: startStep + i,
                value: _SimulationData.gNeuronsDetails[_SigletonConfig.neuronSelected].Calcium[i],
                color: this.colorScale(_SimulationData.gNeuronsDetails[_SigletonConfig.neuronSelected].Calcium[i])
            });

            this.EData.push({
                id: i - length,
                connType: startStep + i,
                value: _SimulationData.gNeuronsDetails[_SigletonConfig.neuronSelected].DeSeEA[i],
                color: _SigletonConfig.EColor
            });

            this.IData.push({
                id: i - length,
                connType: startStep + i,
                value: _SimulationData.gNeuronsDetails[_SigletonConfig.neuronSelected].DeSeIA[i],
                color: _SigletonConfig.IColor
            });

            this.AData.push({
                id: i - length,
                connType: startStep + i,
                value: _SimulationData.gNeuronsDetails[_SigletonConfig.neuronSelected].AxSeA[i],
                color: _SigletonConfig.AColor
            });
            this.lConnectionTypes.push(startStep + i);
        }

        this.createBarGraph(1, "Calcium concentration", this.firstGraphMargin, this.firstGraphDim, this.lConnectionTypes, this.ActData, this.maxCalciumValue, 7, true, false);
        this.createBarGraph(3, "Excitatory", this.thrdGraphMargin, this.thrdGraphDim, this.lConnectionTypes, this.EData, this.maxEConn, 15, false, true);
        this.createBarGraph(4, "Inhibitory", this.frthGraphMargin, this.frthGraphDim, this.lConnectionTypes, this.IData, this.maxIConn, 15, false, true);
        this.createBarGraph(5, "Axonal", this.ffthGraphMargin, this.ffthGraphDim, this.lConnectionTypes, this.AData, this.maxAConn, 15, true, true);
        this.histogramStepsCreated = lIndex;

        var data = {text: "Calcium", textShort: "", color: _SigletonConfig.EEColor, data: []};
        var dataE = {text: "Excitatory", textShort: "", color: _SigletonConfig.EColor, data: []};
        var dataI = {text: "Inhibitory", textShort: "", color: _SigletonConfig.IColor, data: []};
        var dataA = {text: "Axonal", textShort: "", color: _SigletonConfig.AColor, data: []};

        var dataIDs = {"E": "DeSeEA", "I": "DeSeIA", "A": "AxSeA"};

        switch (_SigletonConfig.SEViewSelector) {
            case 0:
                dataIDs = {"E": "DeSeEA", "I": "DeSeIA", "A": "AxSeA"};
                break;
            case 1:
                dataIDs = {"E": "DeSeEV", "I": "DeSeIV", "A": "AxSeV"};
                break;
            case 2:
                dataIDs = {"E": "DeSeEC", "I": "DeSeIC", "A": "AxSeC"};
                break;
        }

        var startStep = _SimulationData.actFile * _SimulationData.numSimStepsPerFile;
        for (var i = 0; i < lIndex + 1; i++) {
            data.data.push({
                value: startStep,
                data: _SimulationData.gNeuronsDetails[_SigletonConfig.neuronSelected].Calcium[i]
            });

            dataE.data.push({
                value: startStep,
                data: _SimulationData.gNeuronsDetails[_SigletonConfig.neuronSelected][dataIDs["E"]][i]
            });

            dataI.data.push({
                value: startStep,
                data: _SimulationData.gNeuronsDetails[_SigletonConfig.neuronSelected][dataIDs["I"]][i]
            });

            dataA.data.push({
                value: startStep,
                data: _SimulationData.gNeuronsDetails[_SigletonConfig.neuronSelected][dataIDs["A"]][i]
            });
            startStep++;
        }

        this.createLineGraph(2, this.scndGraphMargin, this.scndGraphDim, [data], false, 4);
        this.createLineGraph(6, this.sxthGraphMargin, this.sxthGraphDim, [dataE, dataI, dataA], false, 4);


    },
    createBarGraph: function (graphID, graphTitle, margins, dimensions, dataTypes, histogramData, maxDataValue, numChar, hasXAxis, hasTextOver) {

        var self = this;

        var renderHeight = _SigletonConfig.height;

        var xScale = d3.scale.ordinal().rangeRoundBands([0, dimensions.width], .1).domain(dataTypes);
        var yScale = d3.scale.linear().range([dimensions.height, 0]).domain([0, maxDataValue]).nice();
        var numTicks = Math.floor(dimensions.height / this.axisLineHeight);
        var xAxis = d3.svg.axis().scale(xScale).orient("bottom");
        var yAxis = d3.svg.axis().scale(yScale).orient("left").ticks(numTicks).innerTickSize(-dimensions.width).outerTickSize(2);

        d3.select("#graph" + graphID).remove();

        var graphElements = d3.select(".graphs").append("g")
            .attr("id", "graph" + graphID)
            .attr("transform", "translate(" + margins.left + "," + margins.cumulativeTop + ")");

        if (hasXAxis) {
            graphElements.append("g")
                .attr("class", "x axis")
                .attr("transform", "translate(0," + dimensions.height + ")")
                .call(xAxis);
        }

        graphElements.append("g")
            .attr("class", "y axis")
            .call(yAxis);

        var yAxisTextWidth = $("#graph" + graphID + " .y.axis text").last()[0].getBoundingClientRect().width;
        var graphTitlePos = {
            x: -((margins.left - yAxisTextWidth) * 0.5) - yAxisTextWidth,
            y: -(dimensions.height * 0.5)
        };

        graphElements.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", graphTitlePos.x)
            .attr("x", graphTitlePos.y)
            .style("text-anchor", "middle")
            .attr("font-family", "sans-serif")
            .attr("font-size", this.titleFontSize)
            .text(graphTitle);

        graphElements.append("line")
            .attr("class", "line_over")
            .attr("stroke-width", renderHeight * this.strokeWidthRatio)
            .attr("stroke-linecap", "square")
            .attr("stroke-dasharray", "4, 6")
            .attr("stroke", "#000")
            .attr("x1", 0)
            .attr("x2", dimensions.width)
            .attr("y1", 0)
            .attr("y2", 0)
            .attr("style", "display:none;")
            .attr("opacity", "0.5")
            .attr("shape-rendering", "crispEdges");

        var histogramBarElem = graphElements
            .selectAll(".histogramBar")
            .data(histogramData)
            .enter()
            .append("g")
            .attr("class", "histogramBar");

        histogramBarElem
            .append("rect")
            .attr("class", "bar")
            .attr("fill", function (d) {
                return d.color;
            })
            .attr("stroke", "black")
            .attr("stroke-width", 1)
            .attr("x", function (d) {
                return xScale(d.connType);
            })
            .attr("width", xScale.rangeBand())
            .attr("y", function (d) {
                return yScale(d.value);
            })
            .attr("height", function (d) {
                return dimensions.height - yScale(d.value);
            })
            .on("mouseover", function (d) {
                graphElements.selectAll('.line_over')
                    .style("display", "inline")
                    .attr("y1", yScale(d.value))
                    .attr("y2", yScale(d.value))
            })
            .on("mouseout", function () {
                graphElements.selectAll('.line_over').style("display", "none");
            });

        histogramBarElem
            .append("text")
            .attr("text-anchor", "middle")
            .attr("font-size", self.axisFontSize)
            .attr("font-family", "sans-serif")
            .attr("font-weight", "bold")
            .attr("dominant-baseline", "middle")
            .attr("class", "barText")
            .text(function (d) {
                return d.value.toString().substring(0, numChar)
            })
            .attr("fill", function (d) {
                var barHeight = dimensions.height - yScale(d.value);
                var barHeightForText = self.barLineHeight * 2;

                if (barHeight > barHeightForText && hasTextOver)
                    return "white";
                else
                    return "black";
            })
            .attr("y", function (d) {
                var barHeight = dimensions.height - yScale(d.value);
                var barHeightForText = self.barLineHeight * 2;
                var barMarginTop = yScale(d.value);

                if (barHeight > barHeightForText && hasTextOver)
                    return barMarginTop + (barHeight * 0.5);
                else
                    return barMarginTop - (self.textBarMarginRatio * renderHeight);
            })
            .attr("x", function (d) {
                return xScale(d.connType) + xScale.rangeBand() * 0.5;
            });

        d3.selectAll("#graph" + graphID + " .axis .tick").selectAll("line")
            .attr("stroke-width", 1)
            .attr("stroke", "#000")
            .attr("opacity", "0.1");

        d3.select(d3.selectAll("#graph" + graphID + " .y.axis .tick").select("line")[0][0]).style("opacity", "1");

        d3.selectAll("#graph" + graphID + " .tick").selectAll("text")
            .attr("font-family", "sans-serif")
            .attr("font-size", self.axisFontSize);

        d3.selectAll("#graph" + graphID + " .axis").selectAll("path").remove();
    },
    createLineGraph: function (graphID, margins, dimensions, data, hasLegend, steps) {

        var self = this;

        var renderWidth = _SigletonConfig.width;
        var renderHeight = _SigletonConfig.height;
        var defaultFontSize = Math.max(Math.min(renderHeight, renderWidth) * this.fontSizeRatio, this.minFontSize);
        var axisFontSize = defaultFontSize + "px";
        var titleFontSize = defaultFontSize * this.graphTitleFontSizeRatio + "px";
        var simInitialStep = _SimulationData.actFile * _SimulationData.numSimStepsPerFile;
        var simLastStep = _SimulationController.actSimStep;
        var circleIndicatorRadius = renderHeight * this.circleRatio;

        var scales = [];
        var scalesX = [];
        var xx = d3.scale.linear().range([0, dimensions.width]);

        d3.select("#graph" + graphID).remove();


        var graphElements = d3.select(".graphs").append("g")
            .attr("id", "graph" + graphID)
            .attr("transform", "translate(" + margins.left + "," + margins.cumulativeTop + ")");

        graphElements.append("line")
            .attr("class", "line_over" + graphID)
            .attr("stroke-width", 1)
            .attr("stroke", "#000")
            .attr("x1", 0)
            .attr("x2", 0)
            .attr("y1", 0)
            .attr("y2", dimensions.height)
            .attr("style", "display:none;")
            .style("opacity", "0.5")
            .attr("shape-rendering", "crispEdges");


        var area = d3.svg.area()
            .x(function (d) {
                return xx(d.value);
            })
            .y1(function (d) {
                return y(d.data);
            });

        var valueline = d3.svg.line()
            .x(function (d) {
                return xx(d.value);
            })
            .y(function (d) {
                return y(d.data);
            });
        var max = 0;

        data.forEach(function (d) {
            d.data.forEach(function (d) {
                if (d.data > max) max = d.data;
            });
        });

        var x2 = d3.scale.linear().range([0, dimensions.width], 1);
        x2.domain([_SimulationData.actFile * _SimulationData.numSimStepsPerFile, _SimulationController.actSimStep]);
        var xAxis2 = d3.svg.axis().scale(x2).tickValues(x2.ticks().concat(x2.domain())).orient("bottom").innerTickSize(-dimensions.height).outerTickSize(3);

        var y = d3.scale.linear().range([dimensions.height, 0]).domain([0, max]).nice(steps);
        y.domain([0, d3.max(y.ticks(steps)) + y.ticks(steps)[1]]);
        var yAxis = d3.svg.axis().scale(y).orient("left").ticks(steps).innerTickSize(-dimensions.width).outerTickSize(3);

        d3.select(".x.axis.p" + graphID).remove();
        d3.select(".y.axis.p" + graphID).remove();
        graphElements.append("g")
            .attr("class", "x axis p" + graphID)
            .attr("transform", "translate(0," + dimensions.height + ")")
            .call(xAxis2);


        graphElements.append("g")
            .attr("class", "y axis p" + graphID)
            .call(yAxis);


        xx.domain([_SimulationData.actFile * _SimulationData.numSimStepsPerFile, _SimulationController.actSimStep]);
        var x = d3.scale.linear().range([_SimulationData.actFile * _SimulationData.numSimStepsPerFile, _SimulationController.actSimStep]);
        x.domain([margins.left, dimensions.width + margins.left]);
        var gBurbujas = graphElements.append("g");
        var glineas = graphElements.append("g");
        var g = graphElements.append("g");


        data.forEach(function (d, z) {
            area.y0(y(0));
            scales.push(y);
            scalesX.push(xx);
            if (data.length === 1) {
                glineas.append("path")
                    .datum(d.data)
                    .attr("class", "graphArea a" + graphID)
                    .attr("fill", "lightsteelblue")
                    .attr("d", area);
            }


            glineas.append("path")
                .attr("class", "graphLine")
                .style("stroke", d.color)
                .style("stroke-width", 2)
                .attr("fill", "none")
                .attr("d", valueline(d.data));

            gBurbujas.append("circle")
                .attr("class", "circleBck")
                .style("display", "none")
                .style("stroke", "none")
                .style("fill", "white")
                .attr("r", 6);

            g.append("circle")
                .attr("class", "circlePos")
                .style("display", "none")
                .style("stroke", d.color)
                .style("fill", "none")
                .attr("r", 6);
        });


        d3.selectAll(".overlay.a" + graphID).remove();
        d3.select(".overlays").append("rect")
            .attr("class", "overlay a" + graphID)
            .attr("width", dimensions.width)
            .attr("y", margins.cumulativeTop)
            .attr("x", margins.left)
            .attr("height", dimensions.height)
            .attr("fill", "none")
            .on("mousemove", function () {
                var mousePos = d3.mouse(this);
                var tooltipX = d3.mouse(d3.select('body').node())[0] + self.tooltipMarginRatio * _SigletonConfig.width;
                var tooltipY = d3.mouse(d3.select('body').node())[1] + self.tooltipMarginRatio * _SigletonConfig.height;
                var tooltipWidth = $("#tooltip").outerWidth();
                var tooltipHeight = $("#tooltip").outerHeight();
                var dataIndex = Math.round(x(mousePos[0])) % _SimulationData.numSimStepsPerFile;
                var simulationStep = Math.round(x(mousePos[0]));
                var linePosX = (Math.round(x(mousePos[0])) - _SimulationData.numSimStepsPerFile * _SimulationData.actFile)
                    * ( dimensions.width / (_SimulationController.actSimStep - _SimulationData.numSimStepsPerFile
                    * _SimulationData.actFile));

                if ((tooltipX + tooltipWidth) > $(window).width())
                    tooltipX -= tooltipWidth;

                if ((tooltipY + tooltipHeight) > $("#renderArea").height())
                    tooltipY -= tooltipHeight;

                var tooltipHTML = "<span class='stepTooltip'><b>" + simulationStep + "</b></span>";
                data.forEach(function (d) {
                    tooltipHTML += "<div class='circle' style='background-color:" + d.color + "'></div><b>" + d.textShort +
                        "</b><b> " + d.data[dataIndex].data + "</b><br>";
                });

                d3.select("#tooltip")
                    .html(tooltipHTML)
                    .style("left", tooltipX + "px")
                    .style("top", tooltipY + "px")
                    .classed("hidden", false);


                var ys = [];
                g.selectAll('.circlePos')[0].forEach(function (d, i) {
                    ys.push(y(data[i].data[dataIndex].data));
                });
                d3.selectAll('.line_over' + graphID)
                    .style("display", "inline")
                    .attr("x1", linePosX)
                    .attr("x2", linePosX);


                g.selectAll('.circlePos')
                    .style("display", "inline")
                    .attr("cy", function (d, i) {
                        return y(data[i].data[dataIndex].data);
                    })
                    .attr("cx", linePosX);

                gBurbujas.selectAll('.circleBck')
                    .style("display", "inline")
                    .attr("cy", function (d, i) {
                        return y(data[i].data[dataIndex].data);
                    })
                    .attr("cx", linePosX);
            })
            .on("mouseout", function () {
                d3.selectAll('.line_over' + graphID).style("display", "none");
                d3.selectAll('.circlePos').style("display", "none");
                d3.selectAll('.circleBck').style("display", "none");
                d3.select("#tooltip").classed("hidden", true);
            });


        this.svg.selectAll(".axis.p" + graphID + " .tick").selectAll("line")
            .attr("stroke-width", 1)
            .attr("stroke", "#000")
            .style("opacity", "0.1");

        var verticalAxisBars = this.svg.selectAll(".x.axis.p" + graphID + " .tick").select("line")[0];

        var leftMostVerticalBar = verticalAxisBars[0];
        var minVBarPosX = $((this.svg.selectAll(".x.axis.p" + graphID + " .tick")[0][0]))[0].getBoundingClientRect().left;
        for (var i = 0; i < verticalAxisBars.length; i++) {
            if (minVBarPosX > $((this.svg.selectAll(".x.axis.p" + graphID + " .tick")[0][i]))[0].getBoundingClientRect().left)
                leftMostVerticalBar = verticalAxisBars[i];
        }

        d3.select(leftMostVerticalBar).style("opacity", "1");

        d3.select(this.svg.selectAll(".y.axis.p" + graphID + " .tick").select("line")[0][0]).style("opacity", "1");

        this.svg.selectAll(".tick").selectAll("text")
            .attr("font-family", "sans-serif")
            .attr("font-size", axisFontSize);

        this.svg.selectAll(".axis").selectAll("path").remove();

    },
    updateLineGraph: function (graphID, margins, dimensions, dataTypes, histogramData, maxDataValue, numChar, hasXAxis, hasTextOver) {

        var self = this;

        var xScale = d3.scale.ordinal().rangeRoundBands([0, dimensions.width], .1).domain(dataTypes);
        var yScale = d3.scale.linear().range([dimensions.height, 0]).domain([0, maxDataValue]).nice();
        var numTicks = Math.floor(dimensions.height / this.axisLineHeight);
        var xAxis = d3.svg.axis().scale(xScale).orient("bottom");
        var yAxis = d3.svg.axis().scale(yScale).orient("left").ticks(numTicks).innerTickSize(-dimensions.width).outerTickSize(2);

        var renderHeight = _SigletonConfig.height;

        var graphElements = d3.select("#graph" + graphID);

        graphElements.selectAll('.line_over').style("display", "none");
        if (hasXAxis) {
            graphElements.select(".x.axis")
                .call(xAxis);
        }

        graphElements.select(".y.axis")
            .call(yAxis);

        graphElements
            .selectAll(".bar")
            .data(histogramData)
            .transition()
            .duration(function () {
                return _SimulationController.UpdateVelocity;
            })
            .ease("linear")
            .style("fill", function (d) {
                return d.color;
            })
            .attr("y", function (d) {
                return yScale(d.value);
            })
            .attr("height", function (d) {
                return dimensions.height - yScale(d.value);
            });

        graphElements
            .selectAll(".barText")
            .data(histogramData)
            .transition()
            .duration(function () {
                return _SimulationController.UpdateVelocity;
            })
            .ease("linear")
            .text(function (d) {
                return d.value.toString().substring(0, numChar);
            })
            .attr("fill", function (d) {
                var barHeight = dimensions.height - yScale(d.value);
                var barHeightForText = self.barLineHeight * 2;

                if (barHeight > barHeightForText && hasTextOver)
                    return "white";
                else
                    return "black";
            })
            .attr("y", function (d) {
                var barHeight = dimensions.height - yScale(d.value);
                var barHeightForText = self.barLineHeight * 2;
                var barMarginTop = yScale(d.value);

                if (barHeight > barHeightForText && hasTextOver)
                    return barMarginTop + (barHeight * 0.5);
                else
                    return barMarginTop - (self.textBarMarginRatio * renderHeight);
            })
            .attr("x", function (d) {
                return xScale(d.connType) + xScale.rangeBand() * 0.5
            });
    },
    updateGraph: function () {
        this.lConnectionTypes = [];
        var numBars = this.numBars;

        this.maxCalciumValue = Math.max.apply(Math, _SimulationData.gNeuronsDetails[_SigletonConfig.neuronSelected].Calcium);
        this.maxEConn = Math.max.apply(Math, _SimulationData.gNeuronsDetails[_SigletonConfig.neuronSelected].DeSeEA);
        this.maxIConn = Math.max.apply(Math, _SimulationData.gNeuronsDetails[_SigletonConfig.neuronSelected].DeSeIA);
        this.maxAConn = Math.max.apply(Math, _SimulationData.gNeuronsDetails[_SigletonConfig.neuronSelected].AxSeA);

        var lIndex = _SimulationController.actSimStep % _SimulationData.numSimStepsPerFile;
        var length = lIndex + 1 < numBars ? 0 : lIndex - numBars + 1;
        this.ActData = [];
        this.EData = [];
        this.IData = [];
        this.AData = [];
        var startStep = _SimulationData.actFile * _SimulationData.numSimStepsPerFile;
        for (var i = length; i < lIndex + 1; i++) {

            this.ActData.push({
                id: i - length,
                connType: startStep + i,
                value: _SimulationData.gNeuronsDetails[_SigletonConfig.neuronSelected].Calcium[i],
                color: this.colorScale(_SimulationData.gNeuronsDetails[_SigletonConfig.neuronSelected].Calcium[i])
            });

            this.EData.push({
                id: i - length,
                connType: startStep + i,
                value: _SimulationData.gNeuronsDetails[_SigletonConfig.neuronSelected].DeSeEA[i],
                color: _SigletonConfig.EColor
            });

            this.IData.push({
                id: i - length,
                connType: startStep + i,
                value: _SimulationData.gNeuronsDetails[_SigletonConfig.neuronSelected].DeSeIA[i],
                color: _SigletonConfig.IColor
            });

            this.AData.push({
                id: i - length,
                connType: startStep + i,
                value: _SimulationData.gNeuronsDetails[_SigletonConfig.neuronSelected].AxSeA[i],
                color: _SigletonConfig.AColor
            });
            this.lConnectionTypes.push(startStep + i);
        }


        if (lIndex < numBars || this.histogramStepsCreated !== numBars) {
            this.createBarGraph(1, "Calcium concentration", this.firstGraphMargin, this.firstGraphDim, this.lConnectionTypes, this.ActData, this.maxCalciumValue, 7, true, false);
            this.createBarGraph(3, "Excitatory", this.thrdGraphMargin, this.thrdGraphDim, this.lConnectionTypes, this.EData, this.maxEConn, 15, false, true);
            this.createBarGraph(4, "Inhibitory", this.frthGraphMargin, this.frthGraphDim, this.lConnectionTypes, this.IData, this.maxIConn, 15, false, true);
            this.createBarGraph(5, "Axonal", this.ffthGraphMargin, this.ffthGraphDim, this.lConnectionTypes, this.AData, this.maxAConn, 15, true, true);
            this.histogramStepsCreated = Math.min(lIndex,numBars);
        } else {
            this.updateLineGraph(1, this.firstGraphMargin, this.firstGraphDim, this.lConnectionTypes, this.ActData, this.maxCalciumValue, 7, true, false);
            this.updateLineGraph(3, this.thrdGraphMargin, this.thrdGraphDim, this.lConnectionTypes, this.EData, this.maxEConn, 15, false, true);
            this.updateLineGraph(4, this.frthGraphMargin, this.frthGraphDim, this.lConnectionTypes, this.IData, this.maxIConn, 15, false, true);
            this.updateLineGraph(5, this.ffthGraphMargin, this.ffthGraphDim, this.lConnectionTypes, this.AData, this.maxAConn, 15, true, true);
            this.histogramStepsCreated = numBars;
        }


        var data = {text: "Calcium", textShort: "", color: _SigletonConfig.EEColor, data: []};
        var dataE = {text: "Excitatory", textShort: "", color: _SigletonConfig.EColor, data: []};
        var dataI = {text: "Inhibitory", textShort: "", color: _SigletonConfig.IColor, data: []};
        var dataA = {text: "Axonal", textShort: "", color: _SigletonConfig.AColor, data: []};

        for (var i = 0; i < lIndex + 1; i++) {
            data.data.push({
                value: startStep,
                data: _SimulationData.gNeuronsDetails[_SigletonConfig.neuronSelected].Calcium[i]
            });

            dataE.data.push({
                value: startStep,
                data: _SimulationData.gNeuronsDetails[_SigletonConfig.neuronSelected].DeSeEA[i]
            });

            dataI.data.push({
                value: startStep,
                data: _SimulationData.gNeuronsDetails[_SigletonConfig.neuronSelected].DeSeIA[i]
            });

            dataA.data.push({
                value: startStep,
                data: _SimulationData.gNeuronsDetails[_SigletonConfig.neuronSelected].AxSeA[i]
            });
            startStep++;
        }

        this.createLineGraph(2, this.scndGraphMargin, this.scndGraphDim, [data], false, 4);
        this.createLineGraph(6, this.sxthGraphMargin, this.sxthGraphDim, [dataE, dataI, dataA], false, 4);

    },
    zoom: function () {
        this.svg.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
    }
};
