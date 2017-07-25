/**
 * @brief
 * @author  Juan Pedro Brito Mendez <juanpebm@gmail.com>
 * @date
 * @remarks Do not distribute without further notice.
 */

MSP.GraphDetailMicroscopicView = function () {
    this.margin;
    this.margin2;
    this.x;
    this.y;
    this.x3;
    this.y3;
    this.x4;
    this.y4;
    this.x5;
    this.y5;
    this.xAxis;
    this.yAxis;

    this.xAxis3;
    this.yAxis35;


    this.xAxis4;
    this.yAxis4;


    this.xAxis5;
    this.yAxis5;


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
};

MSP.GraphDetailMicroscopicView.prototype =
    {
        constructor: MSP.GraphDetailMicroscopicView

        , resize: function () {
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

            var width = _SigletonConfig.width * 0.49;
            var ratioHeight = (_SigletonConfig.height);
            this.margin = {top: ratioHeight * 0.03, right: 15, left: Math.max(50, width * 0.1)};
            this.width = width - this.margin.right - this.margin.left;
            this.height = (_SigletonConfig.height) * 0.21;

            this.margin2 = {
                top: this.height + this.margin.top + ratioHeight * 0.02,
                right: 15,
                bottom: 0,
                left: Math.max(50, width * 0.1)
            };
            this.width2 = width - this.margin2.right - this.margin2.left;
            this.height2 = (_SigletonConfig.height) * 0.08;

            this.margin3 = {
                top: this.height2 + this.margin2.top + ratioHeight * 0.06,
                right: 15,
                bottom: 0,
                left: Math.max(50, width * 0.1)
            };
            this.width3 = width - this.margin3.right - this.margin3.left;
            this.height3 = (_SigletonConfig.height) * 0.07;

            this.margin4 = {
                top: this.height3 + this.margin3.top + ratioHeight * 0.03,
                right: 15,
                bottom: 0,
                left: Math.max(50, width * 0.1)
            };
            this.width4 = width - this.margin4.right - this.margin4.left;
            this.height4 = (_SigletonConfig.height) * 0.07;

            this.margin5 = {
                top: this.height4 + this.margin4.top + ratioHeight * 0.03,
                right: 15,
                bottom: 0,
                left: Math.max(50, width * 0.1)
            };
            this.width5 = width - this.margin5.right - this.margin5.left;
            this.height5 = (_SigletonConfig.height) * 0.07;

            this.margin6 = {
                top: this.height5 + this.margin5.top + ratioHeight * 0.04,
                right: 15,
                bottom: 0,
                left: Math.max(50, width * 0.1)
            };
            this.width6 = width - this.margin6.right - this.margin6.left;
            this.height6 = (_SigletonConfig.height) * 0.23;

            this.numYTicks = 10;

            this.y = d3.scale.linear().range([this.height, 0]).nice();
            this.yAxis = d3.svg.axis().scale(this.y).orient("left").innerTickSize(-this.width).outerTickSize(3);
            self.y.domain([0, d3.max([0, this.maxCalciumValue])]);

            this.y3 = d3.scale.linear().range([this.height3, 0]);
            this.yAxis3 = d3.svg.axis().scale(this.y3).orient("left").ticks(4).innerTickSize(-this.width).outerTickSize(3);
            self.y3.domain([0, d3.max([0, this.maxEConn])]);

            this.y4 = d3.scale.linear().range([this.height4, 0]);
            this.yAxis4 = d3.svg.axis().scale(this.y4).orient("left").ticks(4).innerTickSize(-this.width).outerTickSize(3);
            self.y4.domain([0, d3.max([0, this.maxIConn])]);

            this.y5 = d3.scale.linear().range([this.height5, 0]);
            this.yAxis5 = d3.svg.axis().scale(this.y5).orient("left").ticks(4).innerTickSize(-this.width).outerTickSize(3);
            self.y5.domain([0, d3.max([0, this.maxAConn])]);

            d3.select("#caGraph").remove();

            this.svg = d3.select("#renderArea")
                .append("svg")
                .style("width", "49%")
                .style("border-right", "1px solid #ebebeb")
                .attr("id", "caGraph")
                .attr("width", self.width)
                .attr("height", _SigletonConfig.height)
                .append("g")
                .call(d3.behavior.zoom().scaleExtent([1, 10])
                    .on("zoom", self.zoom))
                .attr("transform", "translate(" + self.margin.left + "," + self.margin.top + ")")
                .append("g");

            this.svg.append("line").attr("x1", -200)
                .attr("y1", this.height2 + this.margin2.top + 25)
                .attr("x2", _SigletonConfig.width)
                .attr("y2", this.height2 + this.margin2.top + 25)
                .style("stroke-width", "1px")
                .style("stroke", "#aeaeae");

            this.svg.append("g")
                .attr("class", "y axis")
                .call(self.yAxis);

            this.svg
                .append("text")
                .attr("class", "textoA")
                .attr("transform", "rotate(-90)")
                .attr("y", 0 - (this.margin.left / 2) - 15)
                .attr("x", 0 - (this.height / 2) - this.margin.top)
                .attr("dy", ".71em")
                .style("text-anchor", "middle")
                .text("Calcium concentration");


            this.svg.append("line")
                .attr("class", "line_over")
                .attr("stroke-width", 2)
                .attr("stroke-linecap", "square")
                .attr("stroke-dasharray", "4, 6")
                .attr("stroke", "#000")
                .attr("x1", 0)
                .attr("x2", this.width)
                .attr("y1", 0)
                .attr("y2", 0)
                .attr("style", "display:none;")
                .style("opacity", "0.5")
                .attr("shape-rendering", "crispEdges");


            this.svg.append("g")
                .attr("transform", "translate(0," + this.margin3.top + ")")
                .attr("class", "y axis")
                .call(self.yAxis3);

            this.svg
                .append("text")
                .attr("transform", "rotate(-90)")
                .attr("class", "textoA")
                .attr("y", 0 - (this.margin.left / 2) - 15)
                .attr("x", 0 - (this.height3 / 2) - this.margin3.top)
                .attr("dy", ".71em")
                .style("text-anchor", "middle")
                .text("Excitatory");


            this.svg.append("g")
                .attr("transform", "translate(0," + this.margin4.top + ")")
                .attr("class", "y axis")
                .call(self.yAxis4);

            this.svg
                .append("text")
                .attr("transform", "rotate(-90)")
                .attr("class", "textoA")
                .attr("y", 0 - (this.margin.left / 2) - 15)
                .attr("x", 0 - (this.height4 / 2) - this.margin4.top)
                .attr("dy", ".71em")
                .style("text-anchor", "middle")
                .text("Inhibitory");

            this.svg.append("g")
                .attr("transform", "translate(0," + this.margin5.top + ")")
                .attr("class", "y axis")
                .call(self.yAxis5);

            this.svg
                .append("text")
                .attr("transform", "rotate(-90)")
                .attr("class", "textoA")
                .attr("y", 0 - (this.margin.left / 2) - 15)
                .attr("x", 0 - (this.height5 / 2) - this.margin5.top)
                .attr("dy", ".71em")
                .style("text-anchor", "middle")
                .text("Axonal");

            this.updateGraph();


        }, updateGraph: function () {
        var self = this;
        this.lConnectionTypes = [];
        var numBars = this.numBars;
        // Generate the data for this timestep
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

        this.y = d3.scale.linear().range([this.height, 0]).nice();
        this.yAxis = d3.svg.axis().scale(this.y).orient("left").innerTickSize(-this.width).outerTickSize(3);
        self.y.domain([0, d3.max([0, this.maxCalciumValue])]);

        this.y3 = d3.scale.linear().range([this.height3, 0]);
        this.yAxis3 = d3.svg.axis().scale(this.y3).orient("left").ticks(4).innerTickSize(-this.width).outerTickSize(3);
        self.y3.domain([0, d3.max([0, this.maxEConn])]);

        this.y4 = d3.scale.linear().range([this.height4, 0]);
        this.yAxis4 = d3.svg.axis().scale(this.y4).orient("left").ticks(4).innerTickSize(-this.width).outerTickSize(3);
        self.y4.domain([0, d3.max([0, this.maxIConn])]);

        this.y5 = d3.scale.linear().range([this.height5, 0]);
        this.yAxis5 = d3.svg.axis().scale(this.y5).orient("left").ticks(4).innerTickSize(-this.width).outerTickSize(3);
        self.y5.domain([0, d3.max([0, this.maxAConn])]);

        this.svg.selectAll(".axis").remove();

        this.svg.append("g")
            .attr("transform", "translate(0," + this.margin5.top + ")")
            .attr("class", "y axis")
            .call(self.yAxis5);

        this.svg.append("g")
            .attr("transform", "translate(0," + this.margin4.top + ")")
            .attr("class", "y axis")
            .call(self.yAxis4);

        this.svg.append("g")
            .attr("class", "y axis")
            .call(self.yAxis);

        this.svg.append("g")
            .attr("transform", "translate(0," + this.margin3.top + ")")
            .attr("class", "y axis")
            .call(self.yAxis3);

        var startStep = _SimulationData.actFile * _SimulationData.numSimStepsPerFile;
        for (var i = length; i < lIndex + 1; i++) {

            this.ActData.push({
                id: i - length,
                connType: startStep,
                value: _SimulationData.gNeuronsDetails[_SigletonConfig.neuronSelected].Calcium[i],
                color: this.colorScale(_SimulationData.gNeuronsDetails[_SigletonConfig.neuronSelected].Calcium[i])
            });

            this.EData.push({
                id: i - length,
                connType: startStep,
                value: _SimulationData.gNeuronsDetails[_SigletonConfig.neuronSelected].DeSeEA[i]
            });

            this.IData.push({
                id: i - length,
                connType: startStep,
                value: _SimulationData.gNeuronsDetails[_SigletonConfig.neuronSelected].DeSeIA[i]
            });

            this.AData.push({
                id: i - length,
                connType: startStep,
                value: _SimulationData.gNeuronsDetails[_SigletonConfig.neuronSelected].AxSeA[i]
            });


            this.lConnectionTypes.push(startStep);
            startStep++;
        }

        this.x = d3.scale.ordinal().rangeRoundBands([0, this.width], .1);
        this.xAxis = d3.svg.axis().scale(this.x).orient("bottom");
        self.x.domain(this.lConnectionTypes);

        // Add the object for the x axis
        d3.selectAll(".x.axis.g").remove();
        this.svg.append("g")
            .attr("class", "x axis g")
            .attr("transform", "translate(0," + self.height + ")")
            .call(self.xAxis);

        //
        // this.svg.append("g")
        //     .attr("class", "x axis g")
        //     .attr("transform", "translate(0," + (this.margin3.top + self.height3) + ")")
        //     .call(self.xAxis);
        //
        // this.svg.append("g")
        //     .attr("class", "x axis g")
        //     .attr("transform", "translate(0," + (this.margin4.top +self.height4) + ")")
        //     .call(self.xAxis);

        this.svg.append("g")
            .attr("class", "x axis g")
            .attr("transform", "translate(0," + (this.margin5.top + self.height5) + ")")
            .call(self.xAxis);


        d3.selectAll(".bar").remove();
        d3.selectAll(".bar3").remove();
        d3.selectAll(".bar4").remove();
        d3.selectAll(".bar5").remove();
        var dat = this.svg
            .selectAll(".bar")
            .data(this.ActData, function (d) {
                return d.id
            });


        dat.enter()
            .append("rect")
            .attr("class", "bar")
            .style("fill", function (d) {
                return d.color;
            })
            .style("stroke", "black")
            .attr("x", function (d) {
                return self.x(d.connType);
            })
            .attr("width", self.x.rangeBand())
            .attr("y", function (d) {
                return self.y(d.value);
            })
            .attr("height", function (d) {
                return self.height - self.y(d.value);
            })
            .on("mouseover", function (d) {
                d3.selectAll('.line_over')
                    .style("display", "inline")
                    .attr("y1", self.y(d.value))
                    .attr("y2", self.y(d.value))
            })
            .on("mouseout", function (d) {
                d3.selectAll('.line_over').style("display", "none");
            });

        this.svg
            .selectAll(".bar3")
            .data(this.EData, function (d) {
                return d.id
            })
            .enter()
            .append("rect")
            .attr("class", "bar3")
            .style("fill", function (d) {
                return _SigletonConfig.EColor;
            })
            .style("stroke", "black")
            .attr("x", function (d) {
                return self.x(d.connType);
            })
            .attr("width", self.x.rangeBand())
            .attr("y", function (d) {
                return self.y3(d.value) + self.margin3.top;
            })
            .attr("height", function (d) {
                return self.height3 - self.y3(d.value);
            })
            .on("mouseover", function (d) {
                d3.selectAll('.line_over')
                    .style("display", "inline")
                    .attr("y1", self.y3(d.value) + self.margin3.top)
                    .attr("y2", self.y3(d.value) + self.margin3.top)
            })
            .on("mouseout", function (d) {
                d3.selectAll('.line_over').style("display", "none");
            });


        this.svg
            .selectAll(".bar4")
            .data(this.IData, function (d) {
                return d.id
            })
            .enter()
            .append("rect")
            .attr("class", "bar4")
            .style("fill", function (d) {
                return _SigletonConfig.IColor;
            })
            .style("stroke", "black")
            .attr("x", function (d) {
                return self.x(d.connType);
            })
            .attr("width", self.x.rangeBand())
            .attr("y", function (d) {
                return self.y4(d.value) + self.margin4.top;
            })
            .attr("height", function (d) {
                return self.height4 - self.y4(d.value);
            })
            .on("mouseover", function (d) {
                d3.selectAll('.line_over')
                    .style("display", "inline")
                    .attr("y1", self.y4(d.value) + self.margin4.top)
                    .attr("y2", self.y4(d.value) + self.margin4.top)
            })
            .on("mouseout", function (d) {
                d3.selectAll('.line_over').style("display", "none");
            });

        this.svg
            .selectAll(".bar5")
            .data(this.AData, function (d) {
                return d.id
            })
            .enter()
            .append("rect")
            .attr("class", "bar5")
            .style("fill", function (d) {
                return _SigletonConfig.AColor;
            })
            .style("stroke", "black")
            .attr("x", function (d) {
                return self.x(d.connType);
            })
            .attr("width", self.x.rangeBand())
            .attr("y", function (d) {
                return self.y5(d.value) + self.margin5.top;
            })
            .attr("height", function (d) {
                return self.height5 - self.y5(d.value);
            })
            .on("mouseover", function (d) {
                d3.selectAll('.line_over')
                    .style("display", "inline")
                    .attr("y1", self.y5(d.value) + self.margin5.top)
                    .attr("y2", self.y5(d.value) + self.margin5.top)
            })
            .on("mouseout", function (d) {
                d3.selectAll('.line_over').style("display", "none");
            });


        d3.selectAll(".textoBar").remove();
        var gDat = this.svg
            .selectAll(".textoBar")
            .data(this.ActData, function (d) {
                return d.id
            });


        gDat.enter()
            .append("text")
            .style("text-anchor", "middle")
            .style("font", "1.4vh sans-serif")
            .style("font-weight", "bold")
            .attr("class", "textoBar")
            .text(function (d) {
                return d.value.toString().match(/^-?\d+(?:\.\d{0,4})?/)[0];
            })
            .attr("y", function (d) {

                return self.y(d.value) - 10;
            })
            .attr("x", function (d) {
                return self.x(d.connType) + self.x.rangeBand() / 2.0;
            });


        d3.selectAll(".textoBar2").remove();
        var gDat3 = this.svg
            .selectAll(".textoBar2")
            .data(this.EData, function (d) {
                return d.id
            });


        gDat3.enter()
            .append("text")
            .style("text-anchor", "middle")
            .style("font", "1.4vh sans-serif")
            .style("font-weight", "bold")
            .attr("class", "textoBar2")
            .attr("fill", function (d) {
                    if ((self.height3 - self.y3(d.value)) > 30)
                        return "#fff";
                    else
                        return "#000";
                }
            )
            .text(function (d) {
                return d.value;
            })
            .attr("y", function (d) {
                if ((self.height3 - self.y3(d.value)) > 30)
                    return self.y3(d.value) + 15 + self.margin3.top;
                else
                    return self.y3(d.value) - 10 + self.margin3.top;
            })
            .attr("x", function (d) {
                return self.x(d.connType) + self.x.rangeBand() / 2.0;
            });

        d3.selectAll(".textoBar3").remove();
        var gDat4 = this.svg
            .selectAll(".textoBar3")
            .data(this.IData, function (d) {
                return d.id
            });


        gDat4.enter()
            .append("text")
            .style("text-anchor", "middle")
            .style("font", "1.4vh  sans-serif")
            .style("font-weight", "bold")
            .attr("fill", function (d) {
                    if ((self.height4 - self.y4(d.value)) > 30)
                        return "#fff";
                    else
                        return "#000";
                }
            )
            .attr("class", "textoBar3")
            .text(function (d) {
                return d.value;
            })
            .attr("y", function (d) {
                if ((self.height4 - self.y4(d.value)) > 30)
                    return self.y4(d.value) + 15 + self.margin4.top;
                else
                    return self.y4(d.value) - 10 + self.margin4.top;
            })
            .attr("x", function (d) {
                return self.x(d.connType) + self.x.rangeBand() / 2.0;
            });

        d3.selectAll(".textoBar4").remove();
        var gDat5 = this.svg
            .selectAll(".textoBar4")
            .data(this.AData, function (d) {
                return d.id
            });


        gDat5.enter()
            .append("text")
            .style("text-anchor", "middle")
            .style("font", "1.4vh  sans-serif")
            .style("font-weight", "bold")
            .attr("class", "textoBar4")
            .attr("fill", function (d) {
                    if ((self.height5 - self.y5(d.value)) > 30)
                        return "#fff";
                    else
                        return "#000";
                }
            )
            .text(function (d) {
                return d.value;
            })
            .attr("y", function (d) {
                if ((self.height5 - self.y5(d.value)) > 30)
                    return self.y5(d.value) + 15 + self.margin5.top;
                else
                    return self.y5(d.value) - 10 + self.margin5.top;
            })
            .attr("x", function (d) {
                return self.x(d.connType) + self.x.rangeBand() / 2.0;
            });


        var data = {text: "Calcium", textShort: "", color: _SigletonConfig.EEColor, data: []};
        var dataE = {text: "Excitatory", textShort: "", color: _SigletonConfig.EColor, data: []};
        var dataI = {text: "Inhibitory", textShort: "", color: _SigletonConfig.IColor, data: []};
        var dataA = {text: "Axonal", textShort: "", color: _SigletonConfig.AColor, data: []};
        var startStep = _SimulationData.actFile * _SimulationData.numSimStepsPerFile;
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

        this.graph(1, this.svg, this.width2, this.margin2.left, this.margin2.top, this.height2, [data], false, 4);
        this.graph(2, this.svg, this.width2, this.margin6.left, this.margin6.top, this.height6, [dataE, dataI, dataA], false, 4);


    }, graph: function (i, svg, widthTotal, marginLeft, marginTop, height, data, hasLegend, steps) {
        var self = this;
        var width = widthTotal;
        var scales = [];
        var scalesX = [];
        var xx = d3.scale.linear().range([0, width]);
        d3.select(".history.a" + i).remove();
        d3.select(".history.b" + i).remove();

        if (hasLegend) {
            svg.selectAll(".legend.a" + i).remove();
            var gLegend = svg.append("g").attr("class", "legend a" + i).attr("transform", "translate(0," + marginTop + ")");

            data.forEach(function (d, z) {
                gLegend.append("circle")
                    .attr("class", "circleL")
                    .attr("cx", width + marginLeft - 20)
                    .attr("cy", ((height / 2) - ((22 * data.length) / 2)) + 10 + (z * 20))
                    .style("stroke", d.color)
                    .style("fill", d.color)
                    .attr("r", 4);

                gLegend.append("text")
                    .attr("x", width + marginLeft - 10)
                    .attr("y", ((height / 2) - ((22 * data.length) / 2)) + 16 + (z * 20))
                    .attr("class", "textoL")
                    .text(d.text);
            });
        }


        svg.append("line")
            .attr("class", "line_over" + i)
            .attr("stroke-width", 1)
            .attr("stroke", "#000")
            .attr("x1", 0)
            .attr("x2", 0)
            .attr("y1", marginTop)
            .attr("y2", height + marginTop)
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

        var x2 = d3.scale.linear().range([0, width], 1);
        x2.domain([_SimulationData.actFile * _SimulationData.numSimStepsPerFile, _SimulationController.actSimStep]);
        var xAxis2 = d3.svg.axis().scale(x2).tickValues(x2.ticks().concat(x2.domain())).orient("bottom").innerTickSize(-height).outerTickSize(3);

        var y = d3.scale.linear().range([height, 0]).domain([0, max]).nice(steps);
        y.domain([0, d3.max(y.ticks(steps)) + y.ticks(steps)[1]]);
        var yAxis = d3.svg.axis().scale(y).orient("left").ticks(steps).innerTickSize(-width).outerTickSize(3);

        d3.select(".x.axis.p" + i).remove();
        d3.select(".y.axis.p" + i).remove();
        svg.append("g")
            .attr("class", "x axis p" + i)
            .attr("transform", "translate(0," + (marginTop + height) + ")")
            .call(xAxis2)
        ;


        svg.append("g")
            .attr("transform", "translate(0," + (marginTop) + ")")
            .attr("class", "y axis p" + i)
            .call(yAxis);


        xx.domain([_SimulationData.actFile * _SimulationData.numSimStepsPerFile, _SimulationController.actSimStep]);
        var x = d3.scale.linear().range([_SimulationData.actFile * _SimulationData.numSimStepsPerFile, _SimulationController.actSimStep]);
        x.domain([0, width]);
        var gBurbujas = svg.append("g").attr("class", "history c" + i).attr("transform", "translate(0," + marginTop + ")");
        var glineas = svg.append("g").attr("class", "history b" + i).attr("transform", "translate(0," + marginTop + ")");
        var g = svg.append("g").attr("class", "history a" + i).attr("transform", "translate(0," + marginTop + ")");


        data.forEach(function (d, z) {
            area.y0(y(0));
            scales.push(y);
            scalesX.push(xx);
            if (data.length === 1) {
                glineas.append("path")
                    .datum(d.data)
                    .attr("class", "graphArea a" + i)
                    .attr("d", area);
            }


            glineas.append("path")
                .attr("class", "graphLine")
                .style("stroke", d.color)
                .style("stroke-width", 2)
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


        d3.selectAll(".overlay.a" + i).remove();
        svg.append("rect")
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
                var dataIndex = Math.round(x(mousePos[0])) % _SimulationData.numSimStepsPerFile;
                var simulationStep = Math.round(x(mousePos[0]));
                var linePosX = (parseInt(x(mousePos[0])) - _SimulationData.numSimStepsPerFile * _SimulationData.actFile)
                    * (width / (_SimulationController.actSimStep - _SimulationData.numSimStepsPerFile
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
                d3.selectAll('.line_over' + i)
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
                d3.selectAll('.line_over' + i).style("display", "none");
                d3.selectAll('.circlePos').style("display", "none");
                d3.selectAll('.circleBck').style("display", "none");
                d3.select("#tooltip").classed("hidden", true);
            });


        this.svg.selectAll(".y.axis.p" + i + " text").attr("transform", "translate(" + -4 + ",0)");
        this.svg.selectAll(".x.axis.p" + i + " text").attr("transform", "translate(0," + 4 + ")");

    }, zoom: function () {
        this.svg.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
    }
    };
