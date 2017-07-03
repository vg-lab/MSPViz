/**
 * @brief
 * @author  Juan Pedro Brito Mendez <juanpebm@gmail.com>
 * @date
 * @remarks Do not distribute without further notice.
 */

MSP.MacroscopicViewCanvas = function () {
    this.gConnectLoaded = false;

    this.selecting = false;

    this.brush;
    this.zoombehavior;

    this.EEconnectGroup;
    this.EIconnectGroup;
    this.IEconnectGroup;
    this.IIconnectGroup;
    this.actSim = 0;
    this.indX = 0;
    this.MSPViewType = "MacroV";
    this.x = 0;
    this.posXA = [];
    this.posYA = [];
    this.indx = [];
    this.numNeurons = _SimulationData.gNeurons.length;
    this.lado;
    this.enX;
    this.enY;
    this.selecting = false;
    this.idx = 0;
    this.context;
    this.translate0 = 0;
    this.translate1 = 0;
    this.scale = 1;
    this.contextHidden;
    this.scaleBandHeight;
    this.figSize;
    this.recti = {x: 0, y: 0, x2: 0, y2: 0};
    this.down = false;
};

MSP.MacroscopicViewCanvas.prototype = {

    constructor: MSP.MacroscopicViewCanvas

    , resize: function () {
        this.generateMacroscopicViewCanvas();
    },
    init: function () {
        _SigletonConfig.shiftKey = false;

        _SimulationController.view.selecting = false;
        _SimulationFilter.createDummy();
        this.recalcultePositions();
        _SigletonConfig.navBar = [{label: "Grid Layout", viewID: 7, src: "gridView.png"}, {
            label: "Elipse Layout",
            viewID: 4,
            src: "elipseView.png"
        }, {label: "Force Layout", viewID: 6, src: "forceView.png"}];
        generateNav();
    }
    , generateMacroscopicViewCanvas: function () {
        this.init();
        _SigletonConfig.gSelectionIds = [];

        d3.selectAll("svg").filter(function () {
            return !this.classList.contains('color')
        }).remove();

        d3.selectAll("canvas")
            .remove();

        this.createSampleBandColor(_SigletonConfig.calciumScheme);

        var self = this;
        self.idx = 0;


        this.zoombehavior = d3.behavior.zoom().scaleExtent([0.9, Infinity]).on("zoom", this.zoom());
        _SigletonConfig.svg = d3.select("#renderArea")
            .append("canvas")
            .attr("id", "canvas")
            .attr("width", _SigletonConfig.width)
            .attr("height", _SigletonConfig.height - _SigletonConfig.scaleBandHeight)
            .attr("tabindex", 1)
            .style("outline", "none")
            .style("cursor", "crosshair")
            .call(this.zoombehavior);

        _SigletonConfig.svgH = d3.select("body")
            .append("canvas")
            .attr("id", "canvasHidden")
            .attr("width", _SigletonConfig.width)
            .attr("height", _SigletonConfig.height)
            .style("display", "none");


        this.contextHidden = _SigletonConfig.svgH.node().getContext("2d");
        this.context  = _SigletonConfig.svg.node().getContext("2d");
        _SigletonConfig.svg.on('keydown', this.keyDown(), false);
        _SigletonConfig.svg.on('keyup', this.keyUp(), false);
        _SigletonConfig.svg.on('mousedown', this.mouseDown(), false);
        _SigletonConfig.svg.on('mousemove', this.mouseMove(), false);
        _SigletonConfig.svg.on('mouseup', this.mouseUp(), false);

        self.drawHidden();

        $('body').on('contextmenu', '#canvas', function (e) {
            return false;
        });

        this.draw();

    },
    mouseUp: function (e) {
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
    mouseDown: function (e) {

        if (_SigletonConfig.shiftKey) {
            self.recti.x = d3.mouse(this)[0];
            self.recti.y = d3.mouse(this)[1];
            self.down = true;
            var color = self.contextHidden.getImageData(parseInt((d3.mouse(this)[0] - self.translate0) / self.scale, 10), parseInt((d3.mouse(this)[1] - self.translate1) / self.scale, 10), 1, 1).data;
            if (color[3] === 255) {
                var idx = _SimulationFilter.orderIndex[color[0] * 255 * 256 + color[1] * 256 + color[2]];
                _SimulationData.gNeurons[idx].selected = !_SimulationData.gNeurons[idx].selected;
                self.draw();
            }
        }
        _SimulationData.gNeurons.forEach(function (d) {
                d.previouslySelected = _SigletonConfig.shiftKey && d.selected;
            }
        );


    },
    mouseMove: function (e) {
        var lIndex = _SimulationController.actSimStep % _SimulationData.numSimStepsPerFile;
        var recti = self.recti;
        var context = self.context;
        if (this.down && _SigletonConfig.shiftKey) {
            recti.x2 = d3.mouse(this)[0];
            recti.y2 = d3.mouse(this)[1];
            var x = (recti.x - self.translate0) / self.scale;
            var y = (recti.y - self.translate1) / self.scale;
            var x2 = (recti.x2 - self.translate0) / self.scale;
            var y2 = (recti.y2 - self.translate1) / self.scale;

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

            context.rect((recti.x - self.translate0) / self.scale, (recti.y - self.translate1) / self.scale, (recti.x2 - self.translate0) / self.scale - (recti.x - self.translate0) / self.scale, (recti.y2 - self.translate1) / self.scale - (recti.y - self.translate1) / self.scale);
            context.stroke();
            context.globalAlpha = 0.1;
            context.fill();
            context.globalAlpha = 1;

        }
        var color = self.contextHidden.getImageData(parseInt((d3.mouse(this)[0] - self.translate0) / self.scale, 10), parseInt((d3.mouse(this)[1] - self.translate1) / self.scale, 10), 1, 1).data;
        if (color[3] === 255) {
            var idx = _SimulationFilter.orderIndex[color[0] * 255 * 256 + color[1] * 256 + color[2]];
            var d = _SimulationData.gNeurons[idx];
            var posX = d3.mouse(this)[0] + 50;
            var width = $("#tooltip").width();
            if ((posX + width + 50) > $(window).width()) posX -= width + 20;

            d3.select("#tooltip")
                .html(
                    "Id: <b>" + d.NId
                    + "</b><br> CaC= <b>" + _SimulationData.gNeuronsDetails[d.NId].Calcium[lIndex] + "</b>"
                )
                .style("left", posX + "px")
                .style("top", d3.mouse(this)[1] + 10 + "px");
            d3.select("#tooltip").classed("hidden", false);
        } else {
            d3.select("#tooltip").classed("hidden", true);
        }
    },
    toColor: function (num) {

        num >>>= 0;
        var b = num & 0xFF,
            g = (num & 0xFF00) >>> 8,
            r = (num & 0xFF0000) >>> 16;
        return "rgb(" + [r, g, b].join(",") + ")";

    },
    draw: function () {

        var self = this;
        var context = this.context;
        context.setTransform(1, 0, 0, 1, 0, 0);
        context.clearRect(0, 0, _SigletonConfig.width, _SigletonConfig.height);
        context.translate(_SimulationController.view.translate0, _SimulationController.view.translate1);
        context.scale(_SimulationController.view.scale, _SimulationController.view.scale);

        var lIndex = _SimulationController.actSimStep % _SimulationData.numSimStepsPerFile;
        context.lineWidth = this.figSize * 0.2;

        function canvas_arrow(context, fromx, fromy, tox, toy) {

            var figureSize = self.figSize;
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

        var figureSize = this.figSize;
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
    drawHidden: function () {
        var contextHidden = this.contextHidden;
        var self = this;
        var figureSize = this.figSize;
        _SimulationData.gNeurons.forEach(function (d, i) {
            contextHidden.fillStyle = self.toColor(i);
            contextHidden.fillRect(d.PosX - figureSize, d.PosY - figureSize, figureSize * 2, figureSize * 2);
        });

    },
    recalcultePositions: function () {
        var self = this;
        var width = _SigletonConfig.width;
        this.figSize = _SigletonConfig.height / 180;
        var height = _SigletonConfig.height - _SigletonConfig.scaleBandHeight;
        this.lado = Math.sqrt((width * height) / _SimulationData.gNeurons.length);
        this.enX = Math.floor(width / this.lado);
        this.enY = Math.floor(height / this.lado);
        this.posXA = [];
        this.posYA = [];
        for (var i = 0; i <= _SimulationData.gNeurons.length; i++) {
            this.posXA.push((i % this.enX) * (this.lado) + 9);
        }

        var j = 1;
        var val = 10;
        while (j <= _SimulationData.gNeurons.length) {
            this.posYA.push(val);
            if (j % this.enX === 0) {
                val += (this.lado);
            }
            j++;
        }

        _SimulationData.gNeurons.forEach(function (d, i) {
            d.PosX = self.posXA[i];
            d.PosY = self.posYA[i];
        });

    },
    updateSynapticElements: function () {

        this.gConnectLoaded = true;
    },
    updateVisualization: function () {
        this.updateSynapticElements();
    },
    keyDown: function (e) {
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
    },
    keyUp: function (e) {
        _SigletonConfig.shiftKey = d3.event.shiftKey || d3.event.metaKey;
        d3.select("#canvas").call(self.zoombehavior);
        _SigletonConfig.svg.style("cursor", "crosshair");

    },
    zoom: function (e) {
        if(typeof self.context !== "undefined") {
            self.context.save();
            self.context.clearRect(0, 0, _SigletonConfig.width, _SigletonConfig.height);
            self.translate0 = d3.event.translate[0];
            self.translate1 = d3.event.translate[1];
            self.scale = d3.event.scale;
            self.draw();
            self.context.restore();
        }
    },
    createSampleBandColor: function (interpolator) {

        var self = this;

        var svgContainer = d4.select("#colorSampleBand").append("svg")
            .attr("x", 0).attr("y", 20)
            .attr("width", _SigletonConfig.width)
            .attr("height", 60);
        var z = d4.scaleSequential(d4["interpolate" + interpolator]);
        var lg = svgContainer.append("defs").append("linearGradient")
            .attr("id", "mygrad2")
            .attr("x1", "0%")
            .attr("x2", "100%")
            .attr("y1", "0%")
            .attr("y2", "0%")
        ;
        for (var i = 0; i <= 20; i++) {
            lg.append("stop")
                .attr("offset", (i * 5) + "%")
                .style("stop-color", z(i / 20))
                .style("stop-opacity", 1);
        }

        var rectangle = svgContainer.append("rect")
            .attr("id", "boix2")
            .attr("height", 20)
            .attr("y", 22)
            .attr("x", 10)
            .attr("width", _SigletonConfig.width - 20)
            .attr("fill", "url(#mygrad2)");

        var x = d3.scale.linear().range([0, _SigletonConfig.width - 20]).domain([_SimulationData.minICalciumValue, _SimulationData.maxICalciumValue]);
        var xE = d3.scale.linear().range([0, _SigletonConfig.width - 20]).domain([_SimulationData.minECalciumValue, _SimulationData.maxECalciumValue]);
        var xInverted = d3.scale.linear().range([_SimulationData.minICalciumValue, _SimulationData.maxICalciumValue]).domain([10, _SigletonConfig.width - 10]);
        var xAxis = d3.svg.axis().scale(x).orient("bottom").tickValues(x.ticks().concat(x.domain())).tickSize(-10);
        var xAxisE = d3.svg.axis().scale(xE).orient("top").tickValues(xE.ticks().concat(xE.domain())).tickSize(-10);

        svgContainer.append("g")
            .attr("class", "x axis E")
            .attr("transform", "translate(10,45)")
            .call(xAxis);

        svgContainer.append("g")
            .attr("class", "x axis I")
            .attr("transform", "translate(10,18)")
            .call(xAxisE);

        $(".x.axis.I text").first().css("text-anchor", "start");
        $(".x.axis.E text").first().css("text-anchor", "start");
        $(".x.axis.I text").last().css("text-anchor", "end");
        $(".x.axis.E text").last().css("text-anchor", "end");

    }
}
;
