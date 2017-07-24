/**
 * @brief
 * @author  Juan Pedro Brito Mendez <juanpebm@gmail.com>
 * @date
 * @remarks Do not distribute without further notice.
 */

MSP.GraphMicroscopicView = function () {
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
    this.tooltipMarginRatio = 0.005;
};

MSP.GraphMicroscopicView.prototype =
    {
        constructor: MSP.GraphMicroscopicView

        , resize: function () {
        this.generateGraph();
    },
        generateGraph: function () {

            var self = this;
            var ratioHeight = _SigletonConfig.height;
            var ratioWidth = _SigletonConfig.width;
            var leftMargin = 60;
            var rightMargin = ratioWidth * 0.01;
            var width = _SigletonConfig.width * 0.49 - rightMargin - leftMargin;
            this.margin = {top: ratioWidth * 0.005, right: ratioWidth, left: leftMargin};
            this.width = width;
            this.height = ratioHeight * 0.30;

            this.margin2 = {
                top: this.height + this.margin.top + ratioHeight * 0.08,
                right: ratioWidth,
                bottom: 0,
                left: leftMargin
            };
            this.width2 = width;
            this.height2 = ratioHeight * 0.16;

            this.margin3 = {
                top: this.height2 + this.margin2.top + ratioHeight * 0.04,
                right: ratioWidth,
                bottom: 0,
                left: leftMargin
            };
            this.width3 = width;
            this.height3 = ratioHeight * 0.16;

            this.margin4 = {
                top: this.height3 + this.margin3.top + ratioHeight * 0.04,
                right: ratioWidth,
                bottom: 0,
                left: leftMargin
            };
            this.width4 = width;
            this.height4 = ratioHeight * 0.16;


            d3.select("#caGraph").remove();

            this.svg = d3.select("#renderArea")
                .append("svg")
                .style("width", "49%")
                .style("border-right", "1px solid #ebebeb")
                .attr("id", "caGraph")
                .attr("width", self.width)
                .attr("height", _SigletonConfig.height)
                .append("g")
                .call(d3.behavior.zoom().scaleExtent([1, 10]).on("zoom", self.zoom))
                .attr("transform", "translate(" + self.margin.left + "," + self.margin.top + ")")
                .append("g");

            this.updateGraph();


        }, updateGraph: function (selectedID) {
        var self = this;
        var lIndex = _SimulationController.actSimStep % _SimulationData.numSimStepsPerFile;


        var neurons = [];
        _SimulationData.gNeurons.forEach(function (d, i) {
            if (d.selected)
                neurons.push(d.NId);
        });

        var dataCalcium = [];
        neurons.forEach(function (d) {
            var color = "#ababab";
            if (typeof _SimulationController.view.selectedMicro !== "undefined" && _SimulationController.view.selectedMicro.length === 0) {
                if ((typeof selectedID !== "undefined" && d === selectedID) || (typeof selectedID === "undefined" && _SimulationFilter.gNeuronsFilterB[d]))
                    color = _SigletonConfig.EEColor;
            } else {
                if (_SimulationData.gNeurons[d].selectedM)
                    color = _SigletonConfig.EEColor;
            }


            var data = {
                text: "Calcium concentration",
                id: d,
                textShort: d,
                color: color,
                data: [],
                selected: d === selectedID
            };
            for (var i = 0; i < lIndex + 1; i++) {
                data.data.push({value: i, data: _SimulationData.gNeuronsDetails[d].Calcium[i]});
            }
            dataCalcium.push(data);
        });

        var dataE = [];
        neurons.forEach(function (d) {
            var color = "#ababab";
            if (typeof _SimulationController.view.selectedMicro !== "undefined" && _SimulationController.view.selectedMicro.length === 0) {
                if ((typeof selectedID !== "undefined" && d === selectedID) || (typeof selectedID === "undefined" && _SimulationFilter.gNeuronsFilterB[d]))
                    color = _SigletonConfig.EColor;
            } else {
                if (_SimulationData.gNeurons[d].selectedM)
                    color = _SigletonConfig.EColor;
            }
            var data = {text: "Excitatory", id: d, textShort: d, color: color, data: [], selected: d === selectedID};
            for (var i = 0; i < lIndex + 1; i++) {
                data.data.push({value: i, data: _SimulationData.gNeuronsDetails[d].DeSeEA[i]});
            }
            dataE.push(data);
        });

        var dataI = [];
        neurons.forEach(function (d) {
            var color = "#ababab";
            if (typeof _SimulationController.view.selectedMicro !== "undefined" && _SimulationController.view.selectedMicro.length === 0) {
                if ((typeof selectedID !== "undefined" && d === selectedID) || (typeof selectedID === "undefined" && _SimulationFilter.gNeuronsFilterB[d]))
                    color = _SigletonConfig.IColor;
            } else {
                if (_SimulationData.gNeurons[d].selectedM)
                    color = _SigletonConfig.IColor;
            }

            var data = {text: "Inhibitory", id: d, textShort: d, color: color, data: [], selected: d === selectedID};
            for (var i = 0; i < lIndex + 1; i++) {
                data.data.push({value: i, data: _SimulationData.gNeuronsDetails[d].DeSeIA[i]});
            }
            dataI.push(data);
        });

        var dataA = [];
        neurons.forEach(function (d) {
            var color = "#ababab";
            if (typeof _SimulationController.view.selectedMicro !== "undefined" && _SimulationController.view.selectedMicro.length === 0) {
                if ((typeof selectedID !== "undefined" && d === selectedID) || (typeof selectedID === "undefined" && _SimulationFilter.gNeuronsFilterB[d]))
                    color = _SigletonConfig.AColor;
            } else {
                if (_SimulationData.gNeurons[d].selectedM)
                    color = _SigletonConfig.AColor;
            }

            var data = {text: "Axonal", id: d, textShort: d, color: color, data: [], selected: d === selectedID};
            for (var i = 0; i < lIndex + 1; i++) {
                data.data.push({value: i, data: _SimulationData.gNeuronsDetails[d].AxSeA[i]});
            }
            dataA.push(data);
        });


        this.graph(1, this.svg, this.width, this.margin.left, this.margin.top, this.height, dataCalcium, false, 4, selectedID);
        this.graph(2, this.svg, this.width, this.margin2.left, this.margin2.top, this.height2, dataE, false, 4, selectedID);
        this.graph(3, this.svg, this.width, this.margin3.left, this.margin3.top, this.height3, dataI, false, 4, selectedID);
        this.graph(4, this.svg, this.width, this.margin4.left, this.margin4.top, this.height4, dataA, false, 4, selectedID);


    }, graph: function (i, svg, widthTotal, marginLeft, marginTop, height, data, hasLegend, steps, selectedID) {
        svg.selectAll(".graph" + i).remove();
        var gGraph = svg.append("g").attr("class", "graph" + i);
        var self = this;
        var width = widthTotal;
        var scales = [];
        var scalesX = [];
        var xx = d3.scale.linear().range([0, width]);

        gGraph
            .append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 0 - (marginLeft - 10))
            .attr("x", 0 - ((height / 2) + marginTop))
            .attr("dy", ".71em")
            .attr("class", "textoL")
            .style("text-anchor", "middle")
            .text(data[0].text); //TODO: fallo, no declarar el texto por elemento modificar

        gGraph.append("rect")
            .attr("class", "overlay_graph a" + i)
            .attr("width", width)
            .attr("y", marginTop)
            .attr("height", height);

        if (hasLegend) {

            var gLegend = gGraph.append("g").attr("class", "legend a" + i).attr("transform", "translate(0," + marginTop + ")");

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


        gGraph.append("line")
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
        x2.domain([0, _SimulationController.actSimStep]);
        var xAxis2 = d3.svg.axis().scale(x2).tickValues(x2.ticks().concat(x2.domain())).orient("bottom").innerTickSize(-height);

        var y = d3.scale.linear().range([height, 0]).domain([0, max]).nice(steps);
        y.domain([0, d3.max(y.ticks(steps)) + y.ticks(steps)[1]]);
        var yAxis = d3.svg.axis().scale(y).orient("left").ticks(steps).innerTickSize(-width);

        gGraph.append("g")
            .attr("class", "x axis p" + i)
            .attr("transform", "translate(0," + (marginTop + height) + ")")
            .call(xAxis2)
        ;


        gGraph.append("g")
            .attr("transform", "translate(0," + (marginTop) + ")")
            .attr("class", "y axis p" + i)
            .call(yAxis);


        xx.domain([0, _SimulationController.actSimStep]);
        var x = d3.scale.linear().range([0, _SimulationController.actSimStep]);
        x.domain([0, width]);
        var gBurbujas = gGraph.append("g").attr("class", "history c" + i).attr("transform", "translate(0," + marginTop + ")");
        var glineas = gGraph.append("g").attr("class", "history b" + i).attr("transform", "translate(0," + marginTop + ")");
        var g = gGraph.append("g").attr("class", "history a" + i).attr("transform", "translate(0," + marginTop + ")");

        g.append("rect")
            .attr("class", "rect_over")
            .attr("fill-opacity", "1")
            .attr("fill", "#ffffff")
            .attr("x", 0)
            .attr("rx", 5)
            .attr("ry", 5)
            .attr("height", 20 * data.length + 8)
            .attr("width", 80)
            .attr("y", 400)
            .attr("style", "display:none;");
        var selecD = undefined;
        //TODO: Limipar el codigo agrupar en funciones mejorar parametros
        data.forEach(function (d, z) {
            if (!_SimulationData.gNeurons[d.id].selectedM) {
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
                    .attr("id", d.id)
                    .attr("color", d.color)
                    .style("stroke", d.color)
                    .style("stroke-opacity", function () {
                        if (d.color === "#ababab")
                            return 0.4;
                        else
                            return 1;
                    })
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
            }
        });

        var colorRange = d4.schemeSet1;
        var numColors = _SigletonConfig.gSelectionIds.length;

        data.forEach(function (d, z) {
            if (_SimulationData.gNeurons[d.id].selectedM) {
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
                    .attr("id", d.id)
                    .attr("color", colorRange[z % numColors])
                    .style("stroke", colorRange[z % numColors])
                    .style("stroke-width", 2.5)
                    .style("stroke-opacity", 1)
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
                    .style("stroke", colorRange[z % numColors])
                    .style("fill", "none")
                    .attr("r", 6);
            }

        });


        d3.selectAll(".overlay.a" + i).remove();
        gGraph.append("rect")
            .attr("class", "overlay a" + i)

            .attr("width", width)
            .attr("fill", "")
            .attr("y", marginTop)
            .attr("height", height)
            .on("mousemove", function () {
                var mousePos = d3.mouse(this);
                var tooltipX = d3.mouse(d3.select('body').node())[0] + self.tooltipMarginRatio * _SigletonConfig.width;
                var tooltipY = d3.mouse(d3.select('body').node())[1] + self.tooltipMarginRatio * _SigletonConfig.height;
                var tooltipWidth = $("#tooltip").outerWidth();
                var tooltipHeight = $("#tooltip").outerHeight();
                var simulationStep = Math.round(x(mousePos[0]));

                if ((tooltipX + tooltipWidth) > $(window).width())
                    tooltipX -= tooltipWidth;

                if ((tooltipY + tooltipHeight) > $("#renderArea").height())
                    tooltipY -= tooltipHeight;

                var tooltipHTML = "<span class='stepTooltip'><b>" + simulationStep + "</b></span>";
                data.forEach(function (d, z) {
                    var color = "#ababab";
                    if(_SimulationController.view.selectedMicro.length===0) color = d.color;
                    else if (_SimulationData.gNeurons[d.id].selectedM) color = colorRange[z % numColors];
                    tooltipHTML += "<div class='circle' style='background-color:" + color + "'></div><b>" + d.textShort +
                        "</b> - " + d.data[Math.round(x(mousePos[0]))].data + "<br>";
                });

                d3.select("#tooltip")
                    .html(tooltipHTML)
                    .style("left", tooltipX + "px")
                    .style("top", tooltipY+ "px")
                    .classed("hidden", false);

                var coordinate = d3.mouse(this);
                var ys = [];
                g.selectAll('.circlePos')[0].forEach(function (d, i) {
                    ys.push(y(data[i].data[Math.round(x(coordinate[0]))].data));
                });
                var ini = 0;
                if ((data.length * 20) > height && i > 1) ini = height - (data.length * 20);
                d3.selectAll('.line_over' + i)
                    .style("display", "inline")
                    .style("z-index", 1000)
                    .attr("x1", parseInt(x(coordinate[0])) * (width / _SimulationController.actSimStep))
                    .attr("x2", parseInt(x(coordinate[0])) * (width / _SimulationController.actSimStep));

                g.selectAll('.circlePos')
                    .style("display", "inline")
                    .attr("cy", function (d, i) {
                        return y(data[i].data[Math.round(x(coordinate[0]))].data);
                    })
                    .attr("cx", parseInt(x(coordinate[0])) * (width / _SimulationController.actSimStep));

                gBurbujas.selectAll('.circleBck')
                    .style("display", "inline")
                    .attr("cy", function (d, i) {
                        return y(data[i].data[Math.round(x(coordinate[0]))].data);
                    })
                    .attr("cx", parseInt(x(coordinate[0])) * (width / _SimulationController.actSimStep));
            })
            .on("mouseout", function () {
                d3.selectAll('.line_over' + i).style("display", "none");
                d3.select("#tooltip").classed("hidden", true);
                d3.selectAll('.circlePos').style("display", "none");
                d3.selectAll('.circleBck').style("display", "none");
            });

        this.svg.selectAll(".y.axis.p" + i + " text").attr("transform", "translate(" + -4 + ",0)");
        this.svg.selectAll(".x.axis.p" + i + " text").attr("transform", "translate(0," + 4 + ")");


    }, zoom: function () {
        this.svg.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
    }
    };
