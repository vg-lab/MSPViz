/**
 * @brief
 * @author  Juan Pedro Brito Mendez <juanpebm@gmail.com>
 * @date
 * @remarks Do not distribute without further notice.
 */

MSP.MacroscopicViewGrid = function () {
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
    this.neuronsPosX = [];
    this.neuronsPosY = [];
    this.indx = [];
    this.numNeurons = _SimulationData.gNeurons.length;
    this.squareSideLength;
    this.horizontalPositionsNum;
    this.verticalPositionsNum;
    this.selecting = false;
    this.idx = 0;
    this.context;
    this.translateX = 0;
    this.translateY = 0;
    this.scale = 1;
    this.hiddenCanvasContext;
    this.scaleBandHeight;
    this.sizeRatio;
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

MSP.MacroscopicViewGrid.prototype =
    {
        constructor: MSP.MacroscopicViewGrid

        , resize: function () {
        this.generateMacroscopicViewGrid();
    },
        init: function () {
            _SimulationFilter.createDummy();
            this.recalcultePositions();
            _SigletonConfig.navBar = [];
            generateNav();
        }
        , generateMacroscopicViewGrid: function () {
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

        _SigletonConfig.svgH = d3.select("body")
            .append("canvas")
            .attr("id", "canvasHidden")
            .attr("width", _SigletonConfig.width)
            .attr("height", _SigletonConfig.height)
            .style("display", "none");


        this.hiddenCanvasContext = _SigletonConfig.svgH.node().getContext("2d");
        var context = _SigletonConfig.svg.node().getContext("2d");
        this.context = context;

        _SigletonConfig.svg.on('mousedown', mouseDown, false);
        _SigletonConfig.svg.on('mousemove', mouseMove, false);

        rect = {};
        self.drawHidden();


        function mouseDown(e) {

            if (parseInt(d3.mouse(this)[0]) <= 40 && parseInt(d3.mouse(this)[0]) <= 40) {
                self.zoombehavior.translate([0, 0]).scale(1);
                context.save();
                context.clearRect(0, 0, _SigletonConfig.width, _SigletonConfig.height);
                self.translateX = 0;
                self.translateY = 0;
                self.scale = 1;
                self.draw();
                context.restore();
            }

        }


        function mouseMove(e) {
            var color = rgbToHex(context.getImageData(parseInt(d3.mouse(this)[0]), parseInt(d3.mouse(this)[1]), 1, 1).data);
            if (color === _SigletonConfig.EEColor || color === _SigletonConfig.IIColor
                || color === _SigletonConfig.EIColor || color === _SigletonConfig.IEColor) {
                self.draw(parseInt(parseInt((d3.mouse(this)[0] - self.translateX) / self.scale, 10) / 7), parseInt(parseInt((d3.mouse(this)[1] - self.translateY) / self.scale, 10) / 7));
                var tooltipX = d3.mouse(d3.select('body').node())[0];
                var tooltipWidth = $("#tooltip").outerWidth();

                if ((tooltipX + tooltipWidth) > $(window).width())
                    tooltipX -= tooltipWidth;

                d3.select("#tooltip")
                    .style("left", tooltipX + "px")
                    .style("top", d3.mouse(this)[1] + 10 + "px")
                    .html(
                        "From: <b>" + _SimulationFilter.orderIndex[parseInt(parseInt((d3.mouse(this)[1] - self.translateY) / self.scale, 10) / 7)]
                        + "</b><br> To: <b>" + _SimulationFilter.orderIndex[parseInt(parseInt((d3.mouse(this)[0] - self.translateX) / self.scale, 10) / 7)] + "</b>"
                    );
                d3.select("#tooltip").classed("hidden", false);
            } else {
                self.draw();
                d3.select("#tooltip").classed("hidden", true);
            }
        }


        $('body').on('contextmenu', '#canvas', function (e) {
            return false;
        });


        this.draw();

        function zoom() {

            self.translateX = Math.max(Math.min(d3.event.translate[0], 40), ((-_SimulationData.gNeurons.length * 7 * d3.event.scale) + _SigletonConfig.width));
            self.translateY = Math.max(Math.min(d3.event.translate[1], 40), ((-_SimulationData.gNeurons.length * 7 * d3.event.scale) + _SigletonConfig.height));
            self.zoombehavior.translate([self.translateX, self.translateY]).scale(d3.event.scale);
            self.scale = d3.event.scale;
            self.draw();

        }


    }, toColor: function (num) {
        num >>>= 0;
        var b = num & 0xFF,
            g = (num & 0xFF00) >>> 8,
            r = (num & 0xFF0000) >>> 16;
        return "rgb(" + [r, g, b].join(",") + ")";
    }, draw: function (x, y) {
        var self = this;
        var context = this.context;
        context.setTransform(1, 0, 0, 1, 0, 0);
        context.clearRect(0, 0, _SigletonConfig.width, _SigletonConfig.height);
        context.translate(_SimulationController.view.translateX, _SimulationController.view.translateY);
        context.scale(_SimulationController.view.scale, _SimulationController.view.scale);

        var lIndex = _SimulationController.actSimStep % _SimulationData.numSimStepsPerFile;
        context.lineWidth = this.sizeRatio * 0.2;

        var data = [
            {
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

        context.fillStyle = "#ffffff";

        context.beginPath();
        context.rect(0, 0, _SimulationData.gNeurons.length * 8, _SimulationData.gNeurons.length * 8);
        context.fill();
        context.fillStyle = "#dfdfdf";
        context.beginPath();
        context.rect(-(_SimulationController.view.translateX / _SimulationController.view.scale), (y * 7) + 1, _SigletonConfig.width / _SimulationController.view.scale, 6);
        context.fill();
        context.beginPath();
        context.rect((x * 7) + 1, -(_SimulationController.view.translateY / _SimulationController.view.scale), 6, _SigletonConfig.height / _SimulationController.view.scale);
        context.fill();

        context.fillStyle = "#dfdfdf";
        for (var z = 0; z <= _SimulationData.gNeurons.length; z++) {

            context.beginPath();
            context.rect(0, (z * 7), _SimulationData.gNeurons.length * 7, 1);
            context.fill();

            context.beginPath();
            context.rect((z * 7), 0, 1, _SimulationData.gNeurons.length * 7);
            context.fill();
        }

        data.forEach(function (d, i) {
                var color = d.color;
                if (d.draw
                    && typeof (d.data) !== "undefined") {
                    d.data.forEach(function (d) {
                        context.fillStyle = "#777777";
                        if (_SimulationFilter.gNeuronsFilterB[d[0]] || _SimulationFilter.gNeuronsFilterB[d[1]])
                            context.fillStyle = color;
                        context.beginPath();
                        context.rect((_SimulationData.gNeurons[d[1]].index * 7) + 1, (_SimulationData.gNeurons[d[0]].index * 7) + 1, 6, 6);
                        context.fill();
                        context.globalAlpha = 1;

                    });
                }

            }
        );

        var figureSize = this.sizeRatio;


        context.fillStyle = "#ffffff";
        context.beginPath();
        context.rect(-(_SimulationController.view.translateX / _SimulationController.view.scale),
            -((_SimulationController.view.translateY) / _SimulationController.view.scale), _SigletonConfig.width / _SimulationController.view.scale, 40 / _SimulationController.view.scale);
        context.fill();


        context.beginPath();
        context.rect(-(_SimulationController.view.translateX / _SimulationController.view.scale),
            -((_SimulationController.view.translateY) / _SimulationController.view.scale), 40 / _SimulationController.view.scale, _SigletonConfig.height / _SimulationController.view.scale);

        context.fill();
        context.textBaseline = "middle";
        var fontsize = 16 / _SimulationController.view.scale;
        context.font = fontsize + "px normal normal normal sans-serif";
        context.fillStyle = "#000";
        for (var k = 0; k < _SimulationData.gNeurons.length; k += Math.min(Math.max(Math.round(4 / _SimulationController.view.scale), 1), _SimulationData.gNeurons.length / 4)) {
            context.rotate(-Math.PI / 2);
            context.fillText(_SimulationFilter.orderIndex[k], ((_SimulationController.view.translateY - 32) / _SimulationController.view.scale), ((k + 1) * 7) - 2.5);
            context.rotate(Math.PI / 2);
            context.fillText(_SimulationFilter.orderIndex[k], -(_SimulationController.view.translateX / _SimulationController.view.scale) + ((30 / (_SimulationFilter.orderIndex[k].toString().length * 2)) + 5) / _SimulationController.view.scale, ((k + 1) * 7) - 2.5);
            context.beginPath();
            context.rect(-((_SimulationController.view.translateX - 36) / _SimulationController.view.scale), ((k + 1) * 7) - 2.5, 4 / _SimulationController.view.scale, 1 / _SimulationController.view.scale);
            context.rect(((k + 1) * 7) - 2.5, -((_SimulationController.view.translateY - 36) / _SimulationController.view.scale), 1 / _SimulationController.view.scale, 4 / _SimulationController.view.scale);
            context.fill();
        }
        context.fillStyle = "#f5f5f5";
        context.beginPath();
        context.rect(-(_SimulationController.view.translateX / _SimulationController.view.scale),
            -((_SimulationController.view.translateY) / _SimulationController.view.scale), 40 / _SimulationController.view.scale, 40 / _SimulationController.view.scale);
        context.fill();

        context.fillStyle = "#000000";
        context.beginPath();
        context.moveTo(-((_SimulationController.view.translateX) / _SimulationController.view.scale),
            -((_SimulationController.view.translateY - 40) / _SimulationController.view.scale));
        context.lineTo(-((_SimulationController.view.translateX - 40 - _SigletonConfig.width) / _SimulationController.view.scale),
            -((_SimulationController.view.translateY - 40) / _SimulationController.view.scale));
        context.lineWidth = 1 / _SimulationController.view.scale;
        context.stroke();

        context.beginPath();
        context.moveTo(-((_SimulationController.view.translateX - 40) / _SimulationController.view.scale),
            -((_SimulationController.view.translateY) / _SimulationController.view.scale));
        context.lineTo(-((_SimulationController.view.translateX - 40) / _SimulationController.view.scale),
            -((_SimulationController.view.translateY - 40 - _SigletonConfig.height) / _SimulationController.view.scale));
        context.lineWidth = 1 / _SimulationController.view.scale;
        context.stroke();

        context.fillText("home", -((_SimulationController.view.translateX) / _SimulationController.view.scale), -((_SimulationController.view.translateY - 20) / _SimulationController.view.scale));

    }, drawHidden: function () {
        var contextHidden = this.hiddenCanvasContext;
        var self = this;
        var figureSize = this.sizeRatio;
        _SimulationFilter.gNeuronsFilter.forEach(function (z, i) {
            var d = _SimulationData.gNeurons[z];
            var colorHexString = self.toColor(i);
            contextHidden.fillStyle = colorHexString;
            contextHidden.fillRect(d.PosX - figureSize, d.PosY - figureSize, figureSize * 2, figureSize * 2);
        });


    }, recalcultePositions: function () {
        var self = this;
        var width = _SigletonConfig.width;
        this.sizeRatio = _SigletonConfig.height / 180;
        var height = _SigletonConfig.height;
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

    }, sortNeuronsByCa: function () {
        var lIndex = _SimulationController.actSimStep % _SimulationData.numSimStepsPerFile;
        var self = _SimulationController.view;
        self.idx = 0;
        var calcios = [];
        for (var i = 0; i < _SimulationData.gNeuronsDetails.length; i++)
            calcios.push(_SimulationData.gNeuronsDetails[i].Calcium[lIndex])
        var sorted = sortWithIndeces(calcios).sortIndices;
        var posXA2 = self.neuronsPosX.slice(0);
        var posYA2 = self.neuronsPosY.slice(0);
        for (i = 0; i < sorted.length; i++) {
            posXA2[sorted[i]] = self.neuronsPosX[i];
            posYA2[sorted[i]] = self.neuronsPosY[i];
        }
        _SimulationData.gNeuronsRep.attr("transform", function (d) {

                d.PosX = posXA2[self.idx];
                d.PosY = posYA2[self.idx];
                self.idx += 1;
                return "translate(" + d.PosX + "," + d.PosY + ")";
            }
        )
    }, unSortNeuronsByCa: function () {

        var self = _SimulationController.view;
        self.idx = 0;
        _SimulationData.gNeuronsRep.attr("transform", function (d) {

                d.PosX = self.neuronsPosX[self.idx];
                d.PosY = self.neuronsPosY[self.idx];
                self.idx += 1;
                return "translate(" + d.PosX + "," + d.PosY + ")";
            }
        )
    }, updateSynapticElements: function () {

        this.gConnectLoaded = true;
    }, updateCalcium: function () {

        this.draw();


    }, updateVisualization: function () {
        this.updateSynapticElements();
        this.updateCalcium();

        //Mover adelante el recuadro de seleccion
        _SigletonConfig.svg.select(".rect").moveToFront();
    }, zoom: function () {
        _SigletonConfig.svg.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");

    }

    };
