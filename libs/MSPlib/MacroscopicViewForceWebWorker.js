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

MSP.MacroscopicViewForce = function () {
    this.selecting = false;
    this.zoombehavior;
    this.MSPViewType = "MacroV";
    this.selecting = false;
    this.context;
    this.translateX = 0;
    this.translateY = 0;
    this.scale = 1;
    this.sizeRatio;
    this.neuronsPosX = [];
    this.neuronsPosY = [];
    this.squareSideLength = Math.sqrt((_SigletonConfig.width * _SigletonConfig.height) / this.numNeurons);
    this.horizontalPositionsNum = Math.floor(_SigletonConfig.width / this.squareSideLength);
    this.verticalPositionsNum = Math.floor(_SigletonConfig.height / this.squareSideLength);
    this.lastNeuronPositions = [];
    this.force = null;
    this.links = null;
    this.linksPrev = {};
    this.linksPrevActual = {};
    this.t = 1;
    this.worker;
    this.MSPViewType = "MacroV";
    this.neuronsPosX = [];
    this.neuronsPosY = [];
    this.sizeRatio;
    this.selectionRectangle = {x: 0, y: 0, x2: 0, y2: 0};
    this.mouseClickDown = false;
    this.connectionWidth = 0.2;
    this.strokeWidth = 0.1;
    this.animationTime = 2000;
};

MSP.MacroscopicViewForce.prototype = {
    constructor: MSP.MacroscopicViewForce,
    resize: function () {
        _SigletonConfig.svg = d3.select("#renderArea")
            .select("#canvas")
            .attr("width", _SigletonConfig.width)
            .attr("height", _SigletonConfig.height);
    },
    init: function () {
        _SigletonConfig.shiftKey = false;
        _SimulationController.view.selecting = _SigletonConfig.gSelectionIds.length > 0;
        this.recalculatePositions();
    },
    generateMacroscopicViewForce: function () {
        this.init();

        d3.selectAll("svg").filter(function () {
            return !this.classList.contains('color')
        }).remove();

        d3.selectAll("canvas").filter(function() {
            return !this.classList.contains('imgCanvas')
        }).remove();

        var self = this;

        this.zoombehavior = d3.behavior.zoom().scaleExtent([-Infinity, Infinity]).on("zoom", this.zoom);

        _SigletonConfig.svg = d3.select("#renderArea")
            .append("canvas")
            .attr("id", "canvas")
            .attr("width", _SigletonConfig.width)
            .attr("height", _SigletonConfig.height)
            .attr("tabindex", 1)
            .style("outline", "none")
            .style("cursor", "crosshair")
            .call(this.zoombehavior);

        this.context = _SigletonConfig.svg.node().getContext("2d");

        _SigletonConfig.svg.on('keydown', this.keyDown, false);
        _SigletonConfig.svg.on('keyup', this.keyUp, false);
        _SigletonConfig.svg.on('mousedown', this.mouseDown, false);
        _SigletonConfig.svg.on('mousemove', this.mouseMove, false);
        _SigletonConfig.svg.on('mouseup', this.mouseUp, false);

        $('body').on('contextmenu', '#canvas', function (e) {
            return false;
        });

        _SimulationData.gNeurons.forEach(function (d) {
            d.PosX = _SigletonConfig.width * 0.5;
            d.PosY = _SigletonConfig.height * 0.5;
        });

        this.lastNeuronPositions = [];
        _SimulationData.gNeurons.forEach(function (d) {
            self.lastNeuronPositions.push({PosX: d.PosX, PosY: d.PosY})
        });

        this.worker = new Worker('./libs/MSPlib/forceWorker.js');
        this.worker.postMessage({
            type: "init",
            width: _SigletonConfig.width,
            height: _SigletonConfig.height,
            nodes: _SimulationData.gNeurons,
            links: this.getConnections(),
            step: _SimulationController.actSimStep
        });

        this.worker.onmessage = function (event) {
            event.data.nodes.forEach(function (d, i) {
                _SimulationData.gNeurons[i].x = d.x;
                _SimulationData.gNeurons[i].y = d.y;
                _SimulationData.gNeurons[i].px = d.px;
                _SimulationData.gNeurons[i].py = d.py;
            });

            d3.timer(function (elapsed) {
                if (elapsed > self.animationTime) {
                    elapsed -= self.animationTime;
                    const t = Math.min(1, d3.easeCubic(elapsed / self.animationTime));
                    self.t = t;
                    _SimulationData.gNeurons.forEach(function (d, i) {
                        d.PosX = self.lastNeuronPositions[i].PosX * (1 - t) + d.x * t;
                        d.PosY = self.lastNeuronPositions[i].PosY * (1 - t) + d.y * t;
                    });

                    self.draw(t);

                    if (t === 1) {
                        self.lastNeuronPositions = [];
                        _SimulationData.gNeurons.forEach(function (d) {
                            self.lastNeuronPositions.push({PosX: d.PosX, PosY: d.PosY})
                        });
                        self.linksPrev = self.linksPrevActual;
                        return true;
                    }
                }
            }, 50);
        };

        this.draw();
    },
    draw: function (timer) {

        var self = this;
        var context = this.context;
        context.setTransform(1, 0, 0, 1, 0, 0);
        context.clearRect(0, 0, _SigletonConfig.width, _SigletonConfig.height);
        context.translate(_SimulationController.view.translateX, _SimulationController.view.translateY);
        context.scale(_SimulationController.view.scale, _SimulationController.view.scale);

        var lIndex = _SimulationController.actSimStep % _SimulationData.numSimStepsPerFile;
        context.lineWidth = this.sizeRatio * 0.6;

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
                        if ((self.selecting && ((_SimulationData.gNeurons[d[0]].selected && _SigletonConfig.outgoingConn)
                                || (_SimulationData.gNeurons[d[1]].selected && _SigletonConfig.incomingConn)))
                            || (!self.selecting && (_SimulationFilter.gNeuronsFilterB[d[0]] || _SimulationFilter.gNeuronsFilterB[d[1]]))) {
                            context.strokeStyle = color;
                            context.globalAlpha = (1 - self.t) + _SigletonConfig.macroVAlpha * self.t;
                        }
                        if (!self.linksPrev["i" + d[0] + " " + d[1]]) {
                            context.lineWidth = (self.sizeRatio * 4 * (1 - self.t)) + (self.sizeRatio * 0.6 * self.t);
                        }
                        context.moveTo(_SimulationData.gNeurons[d[0]].PosX, _SimulationData.gNeurons[d[0]].PosY);
                        context.lineTo(_SimulationData.gNeurons[d[1]].PosX, _SimulationData.gNeurons[d[1]].PosY);
                        context.stroke();
                        context.lineWidth = self.sizeRatio * 0.6;
                        canvas_arrow(context, _SimulationData.gNeurons[d[0]].PosX, _SimulationData.gNeurons[d[0]].PosY,
                            _SimulationData.gNeurons[d[1]].PosX, _SimulationData.gNeurons[d[1]].PosY);
                        context.globalAlpha = 1;
                    });
                }

            }
        );

        var figureSize = this.sizeRatio;
        _SimulationData.gNeurons.forEach(function (d, i) {

            var posX = d.PosX;
            var posY = d.PosY;

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
        var width = _SigletonConfig.width;
        this.sizeRatio = _SigletonConfig.height / 100;
        var height = _SigletonConfig.height - _SigletonConfig.scaleBandHeight;
        this.squareSideLength = Math.sqrt((width * height) / _SimulationData.gNeurons.length);
        this.horizontalPositionsNum = Math.floor(width / this.squareSideLength);
        this.verticalPositionsNum = Math.floor(height / this.squareSideLength);
        this.neuronsPosX = [];
        this.neuronsPosY = [];
        for (var i = 0; i <= _SimulationData.gNeurons.length; i++) {
            this.neuronsPosX.push((i % this.horizontalPositionsNum) * (this.squareSideLength) + 9);
        }

        var j = 1;
        var val = 10;
        while (j <= _SimulationData.gNeurons.length) {
            this.neuronsPosY.push(val);
            if (j % this.horizontalPositionsNum === 0) {
                val += (this.squareSideLength);
            }
            j++;
        }

        _SimulationData.gNeurons.forEach(function (d, i) {
            d.PosX = self.neuronsPosX[i];
            d.PosY = self.neuronsPosY[i];
        });

    },
    updateSynapticElements: function () {
        var links = this.getConnections();
        this.worker.postMessage({
            type: "step",
            links: links,
            step: _SimulationController.actSimStep
        });
        this.t = 0;
        this.draw();
    },
    updateVisualization: function () {
        this.updateSynapticElements();
    },
    mouseDown: function () {
        var self = _SimulationController.view;
        if (_SigletonConfig.shiftKey) {
            self.selectionRectangle.x = d3.mouse(this)[0];
            self.selectionRectangle.y = d3.mouse(this)[1];
            self.down = true;
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
                if (d.PosX >= minX && d.PosX <= maxX && d.PosY >= minY && d.PosY <= maxY) {
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


    },
    mouseMove: function () {
        var self = _SimulationController.view;
        var lIndex = _SimulationController.actSimStep % _SimulationData.numSimStepsPerFile;
        var context = self.context;
        if (self.down && _SigletonConfig.shiftKey) {
            self.selectionRectangle.x2 = d3.mouse(this)[0];
            self.selectionRectangle.y2 = d3.mouse(this)[1];
            var x = (self.selectionRectangle.x - self.translateX) / self.scale;
            var y = (self.selectionRectangle.y - self.translateY) / self.scale;
            var x2 = (self.selectionRectangle.x2 - self.translateX) / self.scale;
            var y2 = (self.selectionRectangle.y2 - self.translateY) / self.scale;

            _SimulationData.gNeurons.forEach(function (d) {
                var posX = d.PosX;
                var posY = d.PosY;
                d.selected = d.previouslySelected ^ (Math.min(x, x2) <= posX && posX < Math.max(x, x2)
                    && Math.min(y, y2) <= posY && posY < Math.max(y, y2));
            });

            self.draw();
            context.fillStyle = "rgb(0,0,0)";

            context.rect((self.selectionRectangle.x - self.translateX) / self.scale, (self.selectionRectangle.y - self.translateY) / self.scale, (self.selectionRectangle.x2 - self.translateX) / self.scale - (self.selectionRectangle.x - self.translateX) / self.scale, (self.selectionRectangle.y2 - self.translateY) / self.scale - (self.selectionRectangle.y - self.translateY) / self.scale);
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
            if (d.PosX >= minX && d.PosX <= maxX && d.PosY >= minY && d.PosY <= maxY) {
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
    },
    mouseUp: function () {
        var self = _SimulationController.view;
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
        self.down = false;
    },
    keyDown: function () {
        var self = _SimulationController.view;
        _SigletonConfig.shiftKey = d3.event.shiftKey || d3.event.metaKey;
        if (_SigletonConfig.shiftKey) {
            _SigletonConfig.svg.call(d3.behavior.zoom());
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
    },
    keyUp: function () {
        var self = _SimulationController.view;
        _SigletonConfig.shiftKey = d3.event.shiftKey || d3.event.metaKey;
        _SigletonConfig.svg.call(self.zoombehavior);
        _SigletonConfig.svg.style("cursor", "crosshair");
    },
    zoom: function () {
        var self = _SimulationController.view;
        self.translateX = d3.event.translate[0];
        self.translateY = d3.event.translate[1];
        self.scale = d3.event.scale;
        self.draw();
    },
    getConnections: function () {
        var self = this;
        var connRAWEE = _SimulationData.gConnectivity.EE[_SimulationData.steps[_SimulationController.actSimStep]];
        var connRAWEI = _SimulationData.gConnectivity.EI[_SimulationData.steps[_SimulationController.actSimStep]];
        var connRAWIE = _SimulationData.gConnectivity.IE[_SimulationData.steps[_SimulationController.actSimStep]];
        var connRAWII = _SimulationData.gConnectivity.II[_SimulationData.steps[_SimulationController.actSimStep]];
        var connections = [];
        for (var i = 0; _SimulationData.drawEEConn && typeof connRAWEE !== 'undefined' && i < connRAWEE.length; i++) {
            connections.push({
                source: connRAWEE[i][0],
                target: connRAWEE[i][1],
                id: "i" + connRAWEE[i][0] + " " + connRAWEE[i][1],
                color: _SigletonConfig.EEColor
            });
        }

        for (i = 0; _SimulationData.drawIEConn && typeof connRAWIE !== 'undefined' && i < connRAWIE.length; i++) {
            connections.push({
                source: connRAWIE[i][0],
                target: connRAWIE[i][1],
                id: "i" + connRAWIE[i][0] + " " + connRAWIE[i][1],
                color: _SigletonConfig.IEColor
            });
        }

        for (i = 0; _SimulationData.drawEIConn && typeof connRAWEI !== 'undefined' && i < connRAWEI.length; i++) {
            connections.push({
                source: connRAWEI[i][0],
                target: connRAWEI[i][1],
                id: "i" + connRAWEI[i][0] + " " + connRAWEI[i][1],
                color: _SigletonConfig.EIColor
            });
        }
        for (i = 0; _SimulationData.drawIIConn && typeof connRAWII !== 'undefined' && i < connRAWII.length; i++) {
            connections.push({
                source: connRAWII[i][0],
                target: connRAWII[i][1],
                id: "i" + connRAWII[i][0] + " " + connRAWII[i][1],
                color: _SigletonConfig.IIColor
            });
        }
        this.linksPrevActual = {};
        connections.forEach(function (d) {
            self.linksPrevActual[d.id] = true;
        });
        return connections;
    }
};
