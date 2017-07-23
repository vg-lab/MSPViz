/**
 * @brief
 * @author  Juan Pedro Brito Mendez <juanpebm@gmail.com>
 * @date
 * @remarks Do not distribute without further notice.
 */

MSP.MacroscopicViewElipse = function () {
    this.gConnectLoaded = false;

    this.selecting = false;

    this.brush;
    this.zoombehavior;

    this.EEconnectGroup;
    this.EIconnectGroup;
    this.IEconnectGroup;
    this.IIconnectGroup;
    this.sizeRatio;
    this.MSPViewType = "MacroV";
    this.x = 0;
    this.posXA = [];
    this.posYA = [];
    this.indx = [];
    this.numNeurons = _SimulationData.gNeurons.length;
    this.idx = 0;
    this.centerNeurons;
};

function sortWithIndeces(arr) {
    var toSort = JSON.parse(JSON.stringify(arr));
    for (var i = 0; i < toSort.length; i++) {
        toSort[i] = [toSort[i], i];
    }
    toSort.sort(function (left, right) {
        return left[0] < right[0] ? -1 : 1;
    });
    toSort.sortIndices = [];
    for (var j = 0; j < toSort.length; j++) {
        toSort.sortIndices.push(toSort[j][1]);
        toSort[j] = toSort[j][0];
    }
    return toSort;
}

MSP.MacroscopicViewElipse.prototype = {
    constructor: MSP.MacroscopicViewElipse,
    resize: function () {
        this.generateMacroscopicViewElipse();
    },
    init: function () {
        _SigletonConfig.shiftKey = false;
        _SimulationController.view.selecting = _SigletonConfig.gSelectionIds.length > 0;
        this.recalculatePositions();
    },
    update: function () {
        this.recalculatePositions();
        this.draw();
    },
    generateMacroscopicViewElipse: function () {
        this.init();
        _SigletonConfig.gSelectionIds = [];

        d3.selectAll("svg").filter(function () {
            return !this.classList.contains('color')
        }).remove();

        d3.selectAll("canvas")
            .remove();

        var self = this;
        self.idx = 0;

        this.zoombehavior = d3.behavior.zoom().scaleExtent([-Infinity, Infinity]).on("zoom", zoom);

        _SigletonConfig.svg = d3.select("#renderArea")
            .append("canvas")
            .attr("id", "canvas")
            .attr("width", _SigletonConfig.width)
            .attr("height", _SigletonConfig.height)
            .attr("tabindex", 1)
            .style("cursor", "crosshair")
            .call(this.zoombehavior);


        var context = _SigletonConfig.svg.node().getContext("2d");
        this.context = context;
        var scale = d3.scale.linear()
            .range([0, 1200])
            .domain([0, 1200]);


        _SigletonConfig.svg.on('keydown', keyDown, false);
        _SigletonConfig.svg.on('keyup', keyUp, false);
        _SigletonConfig.svg.on('mousedown', mouseDown, false);
        _SigletonConfig.svg.on('mousemove', mouseMove, false);
        _SigletonConfig.svg.on('mouseup', mouseUp, false);

        rect = {};
        var drag = false;

        function keyDown(e) {
            _SigletonConfig.shiftKey = d3.event.shiftKey || d3.event.metaKey;
            if (_SigletonConfig.shiftKey) {
                d3.select("#canvas").call(d3.behavior.zoom());
                _SigletonConfig.svg.style("cursor", "crosshair");
            }
            else if (d3.event.which === 27) {
                self.selecting = false;
                _SimulationData.gNeurons.forEach(function (d) {
                    d.previouslySelected = false;
                    d.selected = false;
                });
                self.draw();
            }
        }

        function keyUp(e) {
            _SigletonConfig.shiftKey = d3.event.shiftKey || d3.event.metaKey;
            d3.select("#canvas").call(self.zoombehavior);
            _SigletonConfig.svg.style("cursor", "crosshair");

        }

        var recti = {x: 0, y: 0, x2: 0, y2: 0};
        var down = false;

        function mouseDown(e) {
            if (_SigletonConfig.shiftKey) {
                recti.x = d3.mouse(this)[0];
                recti.y = d3.mouse(this)[1];
                down = true;
                var sizeRatio = self.sizeRatio;

                var x = (d3.mouse(this)[0] - self.translateX) / self.scale;
                var y = (d3.mouse(this)[1] - self.translateY) / self.scale;
                
                var minX = x - sizeRatio;
                var maxX = x + sizeRatio;
                var minY = y - sizeRatio;
                var maxY = y + sizeRatio;
                var found = false;
                var idx = -1;
                var length = _SimulationData.gNeurons.length;

                for (var i = 0; i < length; i++) {
                    var d = _SimulationData.gNeurons[i];
                    var posX = self.posXA[d.index];
                    var posY = self.posYA[d.index];
                    if (posX >= minX && posX <= maxX && posY >= minY && posY <= maxY) {
                        found = true;
                        idx = i;
                        break;
                    }
                }

                if (found) {
                    _SimulationData.gNeurons[idx].selected = !_SimulationData.gNeurons[idx].selected;
                    self.draw();
                }
            }
            _SimulationData.gNeurons.forEach(function (d) {
                    d.previouslySelected = _SigletonConfig.shiftKey && d.selected;
                }
            );
        }

        function mouseMove(e) {
            var lIndex = _SimulationController.actSimStep % _SimulationData.numSimStepsPerFile;
            if (down && _SigletonConfig.shiftKey) {
                recti.x2 = d3.mouse(this)[0];
                recti.y2 = d3.mouse(this)[1];
                var x = (recti.x - self.translateX) / self.scale;
                var y = (recti.y - self.translateY) / self.scale;
                var x2 = (recti.x2 - self.translateX) / self.scale;
                var y2 = (recti.y2 - self.translateY) / self.scale;

                _SimulationData.gNeurons.forEach(function (d, i) {
                    var posX = self.posXA[d.index];
                    var posY = self.posYA[d.index];
                    //TODO: seleccionar solo selecionados
                    d.selected = d.previouslySelected ^
                        (Math.min(x, x2) <= posX
                        && posX < Math.max(x, x2)
                        && Math.min(y, y2) <= posY
                        && posY < Math.max(y, y2));
                });

                self.draw();
                context.fillStyle = "rgb(0,0,0)";

                context.rect((recti.x - self.translateX) / self.scale, (recti.y - self.translateY) / self.scale, (recti.x2 - self.translateX) / self.scale - (recti.x - self.translateX) / self.scale, (recti.y2 - self.translateY) / self.scale - (recti.y - self.translateY) / self.scale);
                context.stroke();
                context.globalAlpha = 0.1;
                context.fill();
                context.globalAlpha = 1;

            }
            var sizeRatio = self.sizeRatio;

            var x = (d3.mouse(this)[0] - self.translateX) / self.scale;
            var y = (d3.mouse(this)[1] - self.translateY) / self.scale;


            var minX = x - sizeRatio;
            var maxX = x + sizeRatio;
            var minY = y - sizeRatio;
            var maxY = y + sizeRatio;
            var found = false;
            var idx = -1;
            var length = _SimulationData.gNeurons.length;

            for (var i = 0; i < length; i++) {
                var d = _SimulationData.gNeurons[i];
                var posX = self.posXA[d.index];
                var posY = self.posYA[d.index];
                if (posX >= minX && posX <= maxX && posY >= minY && posY <= maxY) {
                    found = true;
                    idx = i;
                    break;
                }
            }
            if (found) {
                var d = _SimulationData.gNeurons[idx];
                var tooltipX = d3.mouse(d3.select('body').node())[0];
                var tooltipWidth = $("#tooltip").outerWidth();

                if ((tooltipX + tooltipWidth) > $(window).width())
                    tooltipX -= tooltipWidth;

                d3.select("#tooltip")
                    .html(
                        "Id: <b>" + d.NId
                        + "</b><br> CaC= <b>" + _SimulationData.gNeuronsDetails[d.NId].Calcium[lIndex] + "</b>"
                    )
                    .style("left", tooltipX + "px")
                    .style("top", d3.mouse(this)[1] + 10 + "px")
                    .classed("hidden", false);
            } else {
                d3.select("#tooltip").classed("hidden", true);
            }
        }

        function mouseUp(e) {
            _SimulationData.gNeurons.forEach(function (d, i) {
                if (d.selected) {
                    _SigletonConfig.gSelectionIds.push(d.NId);
                }
                else {
                    removeA(_SigletonConfig.gSelectionIds, d.NId);
                }
            });
            self.selecting = (_SigletonConfig.gSelectionIds.length > 0);
            self.draw();
            down = false;
        }

        $('body').on('contextmenu', '#canvas', function (e) {
            return false;
        });


        this.draw();
        var self = this;

        function zoom() {

            context.save();
            context.clearRect(0, 0, _SigletonConfig.width, _SigletonConfig.height);
            self.translateX = d3.event.translate[0];
            self.translateY = d3.event.translate[1];
            self.scale = d3.event.scale;

            self.draw();
            context.restore();

        }


    },
    draw: function () {

        var self = this;
        var context = this.context;
        context.setTransform(1, 0, 0, 1, 0, 0);
        context.clearRect(0, 0, _SigletonConfig.width, _SigletonConfig.height);
        context.translate(_SimulationController.view.translateX, _SimulationController.view.translateY);
        context.scale(_SimulationController.view.scale, _SimulationController.view.scale);

        var lIndex = _SimulationController.actSimStep % _SimulationData.numSimStepsPerFile;
        context.lineWidth = this.sizeRatio * 0.2;

        function canvas_arrow(context, fromx, fromy, tox, toy) {

            var figureSize = self.sizeRatio;
            var headlen = figureSize;
            var distFig = figureSize * 2.5;
            var angle = Math.atan2(toy - fromy, tox - fromx);
            var dist = Math.sqrt(Math.pow(tox - fromx, 2) + (Math.pow(toy - fromy, 2)));
            var x1 = fromx + ((-distFig / dist) * (fromx - tox));
            var y1 = fromy + ((-distFig / dist) * (fromy - toy));
            var x2 = tox + ((distFig / dist) * (fromx - tox));
            var y2 = toy + ((distFig / dist) * (fromy - toy));
            context.beginPath();

            context.fillStyle = "#000";
            context.moveTo(x1, y1);
            context.lineTo(x1 - headlen * Math.cos(angle - Math.PI / 14), y1 - headlen * Math.sin(angle - Math.PI / 14));
            context.lineTo(x1 - headlen * Math.cos(angle + Math.PI / 14), y1 - headlen * Math.sin(angle + Math.PI / 14));
            context.lineTo(x1, y1);
            context.fill();

            context.beginPath();
            context.moveTo(x2, y2);
            context.lineTo(x2 - headlen * Math.cos(angle - Math.PI / 14), y2 - headlen * Math.sin(angle - Math.PI / 14));
            context.lineTo(x2 - headlen * Math.cos(angle + Math.PI / 14), y2 - headlen * Math.sin(angle + Math.PI / 14));
            context.lineTo(x2, y2);
            context.fill();
        }

        var data = [{
            draw: _SimulationData.drawEEConn,
            data: _SimulationData.gConnectivity.EE[_SimulationData.steps[_SimulationController.actSimStep]],
            color: _SigletonConfig.EEColor
        },
            {
                draw: _SimulationData.drawEIConn,
                data: _SimulationData.gConnectivity.EI[_SimulationData.steps[_SimulationController.actSimStep]],
                color: _SigletonConfig.EIColor
            },
            {
                draw: _SimulationData.drawIEConn,
                data: _SimulationData.gConnectivity.IE[_SimulationData.steps[_SimulationController.actSimStep]],
                color: _SigletonConfig.IEColor
            },
            {
                draw: _SimulationData.drawIIConn,
                data: _SimulationData.gConnectivity.II[_SimulationData.steps[_SimulationController.actSimStep]],
                color: _SigletonConfig.IIColor
            }];

        data.forEach(function (d, i) {
                var color = d.color;
                if (d.draw
                    && typeof (d.data) !== "undefined") {
                    d.data.forEach(function (d, i) {

                        context.beginPath();
                        context.strokeStyle = "#777777";
                        context.globalAlpha = 0.1;
                        if ((self.selecting && (_SimulationData.gNeurons[d[0]].selected && _SigletonConfig.outgoingConn) || (_SimulationData.gNeurons[d[1]].selected && _SigletonConfig.incomingConn))
                            || (!self.selecting && (_SimulationFilter.gNeuronsFilterB[d[0]] || _SimulationFilter.gNeuronsFilterB[d[1]]))) {
                            context.globalAlpha = _SigletonConfig.macroVAlpha;
                            context.strokeStyle = color;
                        }
                        context.moveTo(self.posXA[_SimulationData.gNeurons[d[0]].index], self.posYA[_SimulationData.gNeurons[d[0]].index]);
                        context.lineTo(self.posXA[_SimulationData.gNeurons[d[1]].index], self.posYA[_SimulationData.gNeurons[d[1]].index]);
                        context.stroke();
                        canvas_arrow(context, self.posXA[_SimulationData.gNeurons[d[0]].index], self.posYA[_SimulationData.gNeurons[d[0]].index],
                            self.posXA[_SimulationData.gNeurons[d[1]].index], self.posYA[_SimulationData.gNeurons[d[1]].index]);
                        context.globalAlpha = 1;


                    });
                }

            }
        );

        var figureSize = this.sizeRatio;
        _SimulationData.gNeurons.forEach(function (d, i) {

            var posX = self.posXA[d.index];
            var posY = self.posYA[d.index];
            context.lineWidth = figureSize * 10 / 100;
            context.globalAlpha = 1;
            if (d.NAct === "E")
                context.fillStyle = _SimulationData.CaEScale(_SimulationData.gNeuronsDetails[d.NId].Calcium[lIndex]);
            else
                context.fillStyle = _SimulationData.CaIScale(_SimulationData.gNeuronsDetails[d.NId].Calcium[lIndex]);

            if ((!d.selected && self.selecting) || (!_SimulationFilter.gNeuronsFilterB[d.NId])) {
                context.fillStyle = "#434343";
                context.globalAlpha = 0.1;
            }

            context.strokeStyle = "#000";

            if (d.NAct === "E") {
                context.beginPath();
                context.moveTo(posX - figureSize, posY + figureSize);
                context.lineTo(posX, posY - figureSize);
                context.lineTo(posX + figureSize, posY + figureSize);
                context.fill();
                context.lineTo(posX - figureSize, posY + figureSize);
                context.lineTo(posX, posY - figureSize);
                context.stroke();
            } else {
                context.beginPath();
                context.arc(posX, posY, figureSize, 0, 2 * Math.PI);
                context.fill();
                context.beginPath();
                context.arc(posX, posY, figureSize, 0, 2 * Math.PI);
                context.stroke();
            }

        });
    },
    recalculatePositions: function () {
        var self = this;
        this.sizeRatio = _SigletonConfig.height / 1000;
        var radius = _SigletonConfig.height - 50;

        var selected = [];
        var nonSelected = [];

        _SimulationData.gNeurons.forEach(function (d) {
            if (d.centerElipse) selected.push(d.NId);
            else  nonSelected.push(d.NId);
        });

        var step = 2 * Math.PI / selected.length;
        var h = _SigletonConfig.width / 2;
        var k = (_SigletonConfig.height - 50) / 2;
        var r = radius / 4;
        this.posXA = [];
        this.posYA = [];
        for (var theta = 0; theta < 2 * Math.PI && selected.length > 0; theta += step) {
            var x = h + r * Math.cos(theta);
            var y = k - 0.47 * r * Math.sin(theta);
            this.posXA.push(x);
            this.posYA.push(y);
        }

        var step = 2 * Math.PI / nonSelected.length;
        var r = radius;

        for (var theta = 0; theta < 2 * Math.PI; theta += step) {
            var x = h + r * Math.cos(theta);
            var y = k - 0.47 * r * Math.sin(theta);
            this.posXA.push(x);
            this.posYA.push(y);
        }

        selected.forEach(function (d, i) {
            _SimulationData.gNeurons[d].PosX = self.posXA[i];
            _SimulationData.gNeurons[d].PosY = self.posYA[i];
        });

        nonSelected.forEach(function (d, i) {
            _SimulationData.gNeurons[d].PosX = self.posXA[i + selected.length];
            _SimulationData.gNeurons[d].PosY = self.posYA[i + selected.length];
        });

    },
    updateSynapticElements: function () {

        this.gConnectLoaded = true;
    },
    updateCalcium: function () {

        this.draw();


    },
    updateVisualization: function () {
        this.updateSynapticElements();
        this.updateCalcium();

        //Mover adelante el recuadro de seleccion
        _SigletonConfig.svg.select(".rect").moveToFront();
    },
    keyDown: function () {
        _SigletonConfig.shiftKey = d3.event.shiftKey || d3.event.metaKey;
        if (_SigletonConfig.shiftKey) {
            if (!_SimulationController.view.selecting) {
                _SimulationController.view.selecting = true;
                d3.select("g.brush").style("opacity", 0.4);

                d3.select("svg").call(d3.behavior.zoom());
            }
        }
    },
    keyUp: function () {
        _SigletonConfig.shiftKey = d3.event.shiftKey || d3.event.metaKey;

        _SimulationController.view.selecting = false;
        d3.select("g.brush").style("opacity", 0.0);

        d3.select("svg").call(_SimulationController.view.zoombehavior);

    },
    zoom: function () {
        if (!_SigletonConfig.shiftKey) {
            _SigletonConfig.svg.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
        }
    }
};
