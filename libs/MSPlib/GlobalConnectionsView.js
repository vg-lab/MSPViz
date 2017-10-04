/**
 * @brief
 * @author  Juan Pedro Brito Mendez <juanpebm@gmail.com>
 * @date
 * @remarks Do not distribute without further notice.
 */

MSP.GlobalConnectionsView = function () {
    this.firstGraphBarTypes;
    this.scndGraphBarTypes;

    this.marginRatios;
    this.firstGraphMargin;
    this.scndGraphMargin;
    this.minLeftMargin;
    this.minRightMargin;

    this.firstGraphWidthRatio;
    this.scndGraphWidthRatio;

    this.firstGraphDim;
    this.scndGraphDim;

    this.fontSizeRatio;
    this.minFontSize;
    this.graphTitleFontSizeRatio;
    this.axisTitleFontSizeRatio;
    this.defaultFontSize;
    this.axisFontSize;
    this.titleFontSize;

    this.strokeWidthRatio;
    this.textBarMarginRatio;

    this.maxConnNum;
    this.maxSENum;

    this.MSPViewType = "GlobalCV";
};

MSP.GlobalConnectionsView.prototype = {
    constructor: MSP.GlobalConnectionsView,

    resize: function () {
        this.generateGlobalConnectionsView();
    },
    generateGlobalConnectionsView: function () {

        _SigletonConfig.navBar = [{label: "Bar", viewID: 0, src: "bargraph.png"},
            {label: "Graph", viewID: 5, src: "linegraph.png"}];
        generateNav();

        var renderWidth = _SigletonConfig.width;
        var renderHeight = _SigletonConfig.height;
        var self = this;

        this.firstGraphBarTypes = ["EE Conn.", "EI Conn.", "IE Conn.", "II Conn."];
        this.scndGraphBarTypes = ["All E SE.", "All I SE."];

        this.marginRatios = {
            top: 0.08,
            bottom: 0.04,
            left: 0.02,
            right: 0.02
        };
        this.firstGraphMargin = {
            top: renderHeight * this.marginRatios.top,
            right: Math.max(this.minRightMargin, renderWidth * this.marginRatios.right),
            bottom: renderHeight * this.marginRatios.bottom,
            left: Math.max(this.minLeftMargin, renderWidth * this.marginRatios.left),
            cumulativeLeft: 0
        };
        this.scndGraphMargin = {
            top: renderHeight * this.marginRatios.top,
            right: Math.max(this.minRightMargin, renderWidth * this.marginRatios.right),
            bottom: renderHeight * this.marginRatios.bottom,
            left: Math.max(this.minLeftMargin, renderWidth * this.marginRatios.left),
            cumulativeLeft: 0
        };
        this.minLeftMargin = 50;
        this.minRightMargin = 50;

        this.firstGraphWidthRatio = 0.665;
        this.scndGraphWidthRatio = 1 - this.firstGraphWidthRatio;

        this.firstGraphDim = {
            width: (_SigletonConfig.width * this.firstGraphWidthRatio) - this.firstGraphMargin.right
            - this.firstGraphMargin.left,
            height: _SigletonConfig.height - this.firstGraphMargin.top - this.firstGraphMargin.bottom
        };
        this.scndGraphDim = {
            width: (_SigletonConfig.width * this.scndGraphWidthRatio) - this.scndGraphMargin.right
            - this.scndGraphMargin.left,
            height: _SigletonConfig.height - this.scndGraphMargin.top - this.scndGraphMargin.bottom
        };

        this.firstGraphMargin.cumulativeLeft = this.firstGraphMargin.left;
        this.scndGraphMargin.cumulativeLeft = this.firstGraphMargin.left + this.firstGraphDim.width
            + this.firstGraphMargin.right + this.scndGraphMargin.left;

        this.fontSizeRatio = 0.012;
        this.minFontSize = 10;
        this.graphTitleFontSizeRatio = 1.4;
        this.axisTitleFontSizeRatio = 1;

        this.defaultFontSize = Math.max(Math.min(renderHeight, renderWidth) * this.fontSizeRatio, this.minFontSize);
        this.axisFontSize = this.defaultFontSize + "px";
        this.titleFontSize = this.defaultFontSize * this.graphTitleFontSizeRatio + "px";

        this.strokeWidthRatio = 0.002;
        this.textBarMarginRatio = 0.01;

        d3.selectAll("svg").filter(function () {
            return !this.classList.contains('color')
        }).remove();
        d3.selectAll("canvas").filter(function () {
            return !this.classList.contains('imgCanvas')
        }).remove();

        _SigletonConfig.svg = d3.select("#renderArea")
            .append("svg")
            .attr("width", _SigletonConfig.width)
            .attr("height", _SigletonConfig.height)
            .append("g")
            .call(d3.behavior.zoom().scaleExtent([1, 10]).on("zoom", self.zoom))
            .append("g");

        _SigletonConfig.svg
            .append("rect")
            .attr("class", "overlay")
            .attr("x", -_SigletonConfig.width)
            .attr("y", -_SigletonConfig.height)
            .attr("width", _SigletonConfig.width * 3)
            .attr("height", _SigletonConfig.height * 3)
            .style("opacity", "0.0");

        var dataIndex = _SimulationController.actSimStep % _SimulationData.numSimStepsPerFile;

        var connectionsData = [{
            connType: this.firstGraphBarTypes[0],
            value: _SimulationData.EEConn[dataIndex],
            color: _SigletonConfig.EEColor
        }, {
            connType: this.firstGraphBarTypes[1],
            value: _SimulationData.EIConn[dataIndex],
            color: _SigletonConfig.EIColor
        }, {
            connType: this.firstGraphBarTypes[2],
            value: _SimulationData.IEConn[dataIndex],
            color: _SigletonConfig.IEColor
        }, {
            connType: this.firstGraphBarTypes[3],
            value: _SimulationData.IIConn[dataIndex],
            color: _SigletonConfig.IIColor
        }];

        var synapticEData = [{
            connType: this.scndGraphBarTypes[0],
            value: _SimulationData.AESe[dataIndex],
            color: _SigletonConfig.EColor
        }, {
            connType: this.scndGraphBarTypes[1],
            value: _SimulationData.AISe[dataIndex],
            color: _SigletonConfig.IColor
        }];

        this.maxConnNum = d3.max([_SimulationData.maxEEConn, _SimulationData.maxEIConn, _SimulationData.maxIEConn,
            _SimulationData.maxIIConn]);
        this.maxSENum = d3.max([_SimulationData.maxAESe, _SimulationData.maxAISe]);

        this.graph(1, "Global connections", this.firstGraphMargin, this.firstGraphDim, this.firstGraphBarTypes,
            connectionsData, this.maxConnNum);
        this.graph(2, "Synaptic elements", this.scndGraphMargin, this.scndGraphDim, this.scndGraphBarTypes,
            synapticEData, this.maxSENum);
    },
    updateVisualization: function () {

        var dataIndex = _SimulationController.actSimStep % _SimulationData.numSimStepsPerFile;
        var connectionsData = [{
            connType: this.firstGraphBarTypes[0],
            value: _SimulationData.EEConn[dataIndex],
            color: _SigletonConfig.EEColor
        }, {
            connType: this.firstGraphBarTypes[1],
            value: _SimulationData.EIConn[dataIndex],
            color: _SigletonConfig.EIColor
        }, {
            connType: this.firstGraphBarTypes[2],
            value: _SimulationData.IEConn[dataIndex],
            color: _SigletonConfig.IEColor
        }, {
            connType: this.firstGraphBarTypes[3],
            value: _SimulationData.IIConn[dataIndex],
            color: _SigletonConfig.IIColor
        }];

        var synapticEData = [{
            connType: this.scndGraphBarTypes[0],
            value: _SimulationData.AESe[dataIndex],
            color: _SigletonConfig.EColor
        }, {
            connType: this.scndGraphBarTypes[1],
            value: _SimulationData.AISe[dataIndex],
            color: _SigletonConfig.IColor
        }];


        this.updateGraph(1, this.firstGraphMargin, this.firstGraphDim, this.firstGraphBarTypes, connectionsData,
            this.maxConnNum);
        this.updateGraph(2, this.scndGraphMargin, this.scndGraphDim, this.scndGraphBarTypes, synapticEData,
            this.maxSENum);
    },
    updateGraph: function (graphID, margins, dimensions, dataTypes, histogramData, maxDataValue) {

        var self = this;

        var xScale = d3.scale.ordinal().rangeRoundBands([0, dimensions.width], .1).domain(dataTypes);
        var yScale = d3.scale.linear().range([dimensions.height, 0]).domain([0, maxDataValue]).nice();

        var renderHeight = _SigletonConfig.height;

        var graphElements = d3.select("#graph" + graphID);

        graphElements.selectAll('.line_over').style("display", "none");

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
                return d.value;
            })
            .attr("y", function (d) {
                return yScale(d.value) - self.textBarMarginRatio * renderHeight;
            })
            .attr("x", function (d) {
                return xScale(d.connType) + xScale.rangeBand() * 0.5
            });
    },
    graph: function (graphID, graphTitle, margins, dimensions, dataTypes, histogramData, maxDataValue) {

        var self = this;

        var renderHeight = _SigletonConfig.height;

        var xScale = d3.scale.ordinal().rangeRoundBands([0, dimensions.width], .1).domain(dataTypes);
        var yScale = d3.scale.linear().range([dimensions.height, 0]).domain([0, maxDataValue]).nice();

        var xAxis = d3.svg.axis().scale(xScale).orient("bottom");
        var yAxis = d3.svg.axis().scale(yScale).orient("left").innerTickSize(-dimensions.width).outerTickSize(2);

        var graphElements = _SigletonConfig.svg.append("g")
            .attr("id", "graph" + graphID)
            .attr("transform", "translate(" + margins.cumulativeLeft + "," + margins.top + ")");

        graphElements.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + dimensions.height + ")")
            .call(xAxis);

        graphElements.append("g")
            .attr("class", "y axis")
            .call(yAxis);

        graphElements.append("text")
            .attr("text-anchor", "middle")
            .attr("font-weight", "bold")
            .attr("font-family", "sans-serif")
            .attr("font-size", self.titleFontSize)
            .attr("x", dimensions.width * 0.5)
            .attr("y", -margins.top * 0.5)
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
            .attr("class", "barText")
            .text(function (d) {
                return d.value;
            })
            .attr("y", function (d) {
                return yScale(d.value) - self.textBarMarginRatio * renderHeight;
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
    zoom: function () {
        _SigletonConfig.svg.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
    }
};
