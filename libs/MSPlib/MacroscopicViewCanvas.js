/*
 * Copyright (c) 2017 CCS/GMRV/UPM/URJC.
 *
 * Authors: Juan P. Brito <juanpedro.brito@upm.es>
 * 			Nicusor Cosmin Toader <cosmin.toader@urjc.es>
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

MSP.MacroscopicViewCanvas = function () {
  this.selecting = false;
  this.zoombehavior;
  this.MSPViewType = "MacroV";
  this.neuronsPosX = [];
  this.neuronsPosY = [];
  this.squareSideLength;
  this.horizontalPositionsNum;
  this.idx = 0;
  this.context;
  this.translateX = 0;
  this.translateY = 0;
  this.scale = 1;
  this.hiddenCanvasContext;
  this.scaleBandHeight;
  this.sizeRatio;
  this.selectionRectangle = {x: 0, y: 0, x2: 0, y2: 0};
  this.mouseClickDown = false;
  this.connectionWidth = 0.2;
  this.strokeWidth = 0.1;
};

MSP.MacroscopicViewCanvas.prototype = {
  constructor: MSP.MacroscopicViewCanvas,

  resize: function () {
    this.generateMacroscopicViewCanvas();
  },

  init: function () {
    _SingletonConfig.shiftKey = false;
    _SimulationController.view.selecting = _SingletonConfig.gSelectionIds.length > 0;
    this.recalculatePositions();
    _SingletonConfig.navBar = [{label: "Grid Layout", viewID: 7, src: "gridView.png"},
      {label: "Elipse Layout", viewID: 4, src: "elipseView.png"},
      {label: "Force Layout", viewID: 6, src: "forceView.png"}];
    generateNav();
  },

  generateMacroscopicViewCanvas: function () {
    this.init();
    d3.selectAll("svg").filter(function () {
      return !this.classList.contains('color')
    }).remove();

    d3.selectAll("canvas").filter(function () {
      return !this.classList.contains('imgCanvas')
    }).remove();


    this.zoombehavior = d3.behavior.zoom()
      .scaleExtent([-Infinity, Infinity])
      .on("zoom", this.zoom);

    _SingletonConfig.svg = d3.select("#renderArea")
      .append("canvas")
      .attr("id", "canvas")
      .attr("width", _SingletonConfig.width)
      .attr("height", _SingletonConfig.height)
      .attr("tabindex", 1)
      .style("outline", "none")
      .style("cursor", "crosshair")
      .call(this.zoombehavior);

    $('body').on('contextmenu', '#canvas', function (e) {
      return false;
    });

    _SingletonConfig.svgH = d3.select("body")
      .append("canvas")
      .attr("id", "canvasHidden")
      .attr("width", _SingletonConfig.width)
      .attr("height", _SingletonConfig.height)
      .style("display", "none");

    this.hiddenCanvasContext = _SingletonConfig.svgH.node().getContext("2d");
    this.context = _SingletonConfig.svg.node().getContext("2d");

    _SingletonConfig.svg.on('keydown', this.keyDown, false);
    _SingletonConfig.svg.on('keyup', this.keyUp, false);
    _SingletonConfig.svg.on('mousedown', this.mouseDown, false);
    _SingletonConfig.svg.on('mousemove', this.mouseMove, false);
    _SingletonConfig.svg.on('mouseup', this.mouseUp, false);

    this.drawHidden();
    this.draw();

  },

  mouseUp: function (e) {
    var self = _SimulationController.view;
    _SingletonConfig.gSelectionIds = [];
    _SimulationData.gNeurons.forEach(function (d) {
      if (d.selected)
        _SingletonConfig.gSelectionIds.push(d.NId);
    });
    self.selecting = (_SingletonConfig.gSelectionIds.length > 0);
    self.draw();
    self.mouseClickDown = false;
  },

  mouseDown: function (e) {
    var self = _SimulationController.view;
    if (_SingletonConfig.shiftKey) {
      self.selectionRectangle.x = d3.mouse(this)[0];
      self.selectionRectangle.y = d3.mouse(this)[1];
      self.mouseClickDown = true;
      var color = self.hiddenCanvasContext.getImageData(parseInt((d3.mouse(this)[0] - self.translateX) / self.scale, 10), parseInt((d3.mouse(this)[1] - self.translateY) / self.scale, 10), 1, 1).data;
      if (color[3] === 255) {
        var idx = _SimulationFilter.orderIndex[color[0] * 255 * 256 + color[1] * 256 + color[2]];
        _SimulationData.gNeurons[idx].selected = !_SimulationData.gNeurons[idx].selected;
        self.draw();
      }
    }
    _SimulationData.gNeurons.forEach(function (d) {
        d.previouslySelected = _SingletonConfig.shiftKey && d.selected;
      }
    );


  },

  mouseMove: function (e) {
    var self = _SimulationController.view;
    var lIndex = _SimulationController.actSimStep % _SimulationData.numSimStepsPerFile;
    var selectionRectangle = self.selectionRectangle;
    var context = self.context;

    if (self.mouseClickDown && _SingletonConfig.shiftKey) {

      selectionRectangle.x2 = d3.mouse(this)[0];
      selectionRectangle.y2 = d3.mouse(this)[1];

      var scaledSelectionRect = {xStart: 0, yStart: 0, xEnd: 0, yEnd: 0, width: 0, height: 0};
      scaledSelectionRect.xStart = Math.min((selectionRectangle.x - self.translateX) / self.scale,
        (selectionRectangle.x2 - self.translateX) / self.scale);
      scaledSelectionRect.xEnd = Math.max((selectionRectangle.x - self.translateX) / self.scale,
        (selectionRectangle.x2 - self.translateX) / self.scale);
      scaledSelectionRect.yStart = Math.min((selectionRectangle.y - self.translateY) / self.scale,
        (selectionRectangle.y2 - self.translateY) / self.scale);
      scaledSelectionRect.yEnd = Math.max((selectionRectangle.y - self.translateY) / self.scale,
        (selectionRectangle.y2 - self.translateY) / self.scale);
      scaledSelectionRect.width = scaledSelectionRect.xEnd - scaledSelectionRect.xStart;
      scaledSelectionRect.height = scaledSelectionRect.yEnd - scaledSelectionRect.yStart;

      _SimulationData.gNeurons.forEach(function (d) {
        var posX = self.neuronsPosX[d.index];
        var posY = self.neuronsPosY[d.index];
        d.selected = d.previouslySelected ^ (scaledSelectionRect.xStart <= posX
          && posX < scaledSelectionRect.xEnd && scaledSelectionRect.yStart <= posY
          && posY < scaledSelectionRect.yEnd);
      });

      self.draw();
      context.fillStyle = "rgb(0,0,0)";
      context.rect(scaledSelectionRect.xStart, scaledSelectionRect.yStart, scaledSelectionRect.width,
        scaledSelectionRect.height);
      context.stroke();
      context.globalAlpha = 0.1;
      context.fill();
      context.globalAlpha = 1;
    }

    var color = self.hiddenCanvasContext.getImageData(parseInt((d3.mouse(this)[0] - self.translateX) / self.scale, 10),
      parseInt((d3.mouse(this)[1] - self.translateY) / self.scale, 10), 1, 1).data;

    if (color[3] === 255) {
      var neuronIndex = _SimulationFilter.orderIndex[color[0] * 255 * 256 + color[1] * 256 + color[2]];
      var d = _SimulationData.gNeurons[neuronIndex];
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

  draw: function () {

    var self = this;
    var context = this.context;
    context.setTransform(1, 0, 0, 1, 0, 0);
    context.clearRect(0, 0, _SingletonConfig.width, _SingletonConfig.height);
    context.translate(_SimulationController.view.translateX, _SimulationController.view.translateY);
    context.scale(_SimulationController.view.scale, _SimulationController.view.scale);

    var lIndex = _SimulationController.actSimStep % _SimulationData.numSimStepsPerFile;
    context.lineWidth = this.sizeRatio * this.connectionWidth;

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
      color: _SingletonConfig.EEColor
    },
      {
        draw: _SimulationData.drawEIConn,
        data: _SimulationData.gConnectivity.EI[_SimulationData.steps[_SimulationController.actSimStep]],
        color: _SingletonConfig.EIColor
      },
      {
        draw: _SimulationData.drawIEConn,
        data: _SimulationData.gConnectivity.IE[_SimulationData.steps[_SimulationController.actSimStep]],
        color: _SingletonConfig.IEColor
      },
      {
        draw: _SimulationData.drawIIConn,
        data: _SimulationData.gConnectivity.II[_SimulationData.steps[_SimulationController.actSimStep]],
        color: _SingletonConfig.IIColor
      }];

    data.forEach(function (d, i) {
        var color = d.color;
        if (d.draw
          && typeof (d.data) !== "undefined") {
          d.data.forEach(function (d, i) {

            context.beginPath();
            context.strokeStyle = "#777777";
            context.globalAlpha = 0.1;
            if ((self.selecting && (_SimulationData.gNeurons[d[0]].selected && _SingletonConfig.outgoingConn) || (_SimulationData.gNeurons[d[1]].selected && _SingletonConfig.incomingConn))
              || (!self.selecting && (_SimulationFilter.gNeuronsFilterB[d[0]] || _SimulationFilter.gNeuronsFilterB[d[1]]))) {
              context.globalAlpha = _SingletonConfig.macroVAlpha;
              context.strokeStyle = color;
            }
            context.moveTo(self.neuronsPosX[_SimulationData.gNeurons[d[0]].index], self.neuronsPosY[_SimulationData.gNeurons[d[0]].index]);
            context.lineTo(self.neuronsPosX[_SimulationData.gNeurons[d[1]].index], self.neuronsPosY[_SimulationData.gNeurons[d[1]].index]);
            context.stroke();
            canvas_arrow(context, self.neuronsPosX[_SimulationData.gNeurons[d[0]].index], self.neuronsPosY[_SimulationData.gNeurons[d[0]].index],
              self.neuronsPosX[_SimulationData.gNeurons[d[1]].index], self.neuronsPosY[_SimulationData.gNeurons[d[1]].index]);
            context.globalAlpha = 1;


          });
        }

      }
    );

    var sizeRatio = this.sizeRatio;
    _SimulationData.gNeurons.forEach(function (d, i) {

      var posX = self.neuronsPosX[d.index];
      var posY = self.neuronsPosY[d.index];
      context.lineWidth = sizeRatio * self.strokeWidth;
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
        context.moveTo(posX - sizeRatio, posY + sizeRatio);
        context.lineTo(posX, posY - sizeRatio);
        context.lineTo(posX + sizeRatio, posY + sizeRatio);
        context.fill();
        context.lineTo(posX - sizeRatio, posY + sizeRatio);
        context.lineTo(posX, posY - sizeRatio);
        context.stroke();
      } else {
        context.beginPath();
        context.arc(posX, posY, sizeRatio, 0, 2 * Math.PI);
        context.fill();
        context.beginPath();
        context.arc(posX, posY, sizeRatio, 0, 2 * Math.PI);
        context.stroke();
      }

    });
  },

  drawHidden: function () {
    var hiddenCanvasContext = this.hiddenCanvasContext;
    var self = this;
    var sizeRatio = this.sizeRatio;
    _SimulationData.gNeurons.forEach(function (d, i) {
      hiddenCanvasContext.fillStyle = toColor(i);
      hiddenCanvasContext.fillRect(d.PosX - sizeRatio, d.PosY - sizeRatio, sizeRatio * 2, sizeRatio * 2);
    });

  },

  recalculatePositions: function () {
    var self = this;
    this.sizeRatio = _SingletonConfig.height / 180;
    var width = _SingletonConfig.width;
    var height = _SingletonConfig.height;
    this.squareSideLength = Math.sqrt((width * height) / _SimulationData.gNeurons.length);
    this.horizontalPositionsNum = Math.floor(width / this.squareSideLength);
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

  updateVisualization: function () {
    this.draw();
  },

  keyDown: function () {
    var self = _SimulationController.view;
    _SingletonConfig.shiftKey = d3.event.shiftKey || d3.event.metaKey;
    if (_SingletonConfig.shiftKey) {
      _SingletonConfig.svg.call(d3.behavior.zoom());
      _SingletonConfig.svg.style("cursor", "crosshair");
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
    _SingletonConfig.shiftKey = d3.event.shiftKey || d3.event.metaKey;
    _SingletonConfig.svg.call(self.zoombehavior);
    _SingletonConfig.svg.style("cursor", "crosshair");
  },

  zoom: function () {
    var self = _SimulationController.view;
    self.translateX = d3.event.translate[0];
    self.translateY = d3.event.translate[1];
    self.scale = d3.event.scale;
    self.draw();
  }
};
