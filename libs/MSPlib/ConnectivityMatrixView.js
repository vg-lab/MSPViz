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

MSP.ConnectivityMatrixView = function () {

  this.MSPViewType = "MacroV";
  this.zoombehavior;
  this.context;
  this.translateX = 0;
  this.translateY = 0;
  this.scale = 1;
  this.hiddenCanvasContext;
  this.sizeRatio;
  this.resetZoom = false;
  this.axisSize = 40;
  this.axisMargin = 10;
  this.axisLineHeight = 6;
  this.axisLineWidth = 2;
  this.squareMargin = 1;
  this.squareSize = 6;
  this.minAxisNumbers = 4;
  this.fontSize = 14;
};

MSP.ConnectivityMatrixView.prototype = {
  constructor: MSP.ConnectivityMatrixView,

  resize: function () {
    _SingletonConfig.svg = d3.select("#renderArea")
      .select("#canvas")
      .attr("width", _SingletonConfig.width)
      .attr("height", _SingletonConfig.height);
  },

  init: function () {
    _SingletonConfig.navBar = [];
    generateNav();
  },

  generateConnectivityMatrixView: function () {
    this.init();

    cleanRenderArea();

    this.zoombehavior = d3.behavior.zoom()
      .scaleExtent([-Infinity, Infinity])
      .on("zoom", this.zoom.bind(this, this));

    _SingletonConfig.svg = d3.select("#renderArea")
      .append("canvas")
      .attr("id", "canvas")
      .attr("width", _SingletonConfig.width)
      .attr("height", _SingletonConfig.height)
      .attr("tabindex", 1)
      .style("cursor", "crosshair")
      .call(this.zoombehavior);

    _SingletonConfig.svgH = d3.select("body")
      .append("canvas")
      .attr("id", "canvasHidden")
      .attr("width", _SingletonConfig.width)
      .attr("height", _SingletonConfig.height)
      .style("display", "none");

    this.hiddenCanvasContext = _SingletonConfig.svgH.node().getContext("2d");
    this.context = _SingletonConfig.svg.node().getContext("2d");

    _SingletonConfig.svg.on('mousedown', this.mouseDown.bind(this, this), false);
    _SingletonConfig.svg.on('mousemove', this.mouseMove.bind(this, this), false);

    $('body').on('contextmenu', '#canvas', function (e) {
      return false;
    });

    this.draw();
  },

  draw: function (x, y) {
    var context = this.context;
    context.setTransform(1, 0, 0, 1, 0, 0);
    context.clearRect(0, 0, _SingletonConfig.width, _SingletonConfig.height);
    context.translate(this.translateX, this.translateY);
    context.scale(this.scale, this.scale);

    var data = [{
      draw: _SimulationData.drawEEConn,
      data: _SimulationData.gConnectivity.EE[_SimulationData.steps[_SimulationController.actSimStep]],
      color: _SingletonConfig.EEColor
    }, {
      draw: _SimulationData.drawEIConn,
      data: _SimulationData.gConnectivity.EI[_SimulationData.steps[_SimulationController.actSimStep]],
      color: _SingletonConfig.EIColor
    }, {
      draw: _SimulationData.drawIEConn,
      data: _SimulationData.gConnectivity.IE[_SimulationData.steps[_SimulationController.actSimStep]],
      color: _SingletonConfig.IEColor
    }, {
      draw: _SimulationData.drawIIConn,
      data: _SimulationData.gConnectivity.II[_SimulationData.steps[_SimulationController.actSimStep]],
      color: _SingletonConfig.IIColor
    }];

    context.fillStyle = "#ffffff";

    context.beginPath();
    context.rect(0, 0, _SimulationData.gNeurons.length * (this.squareSize + this.squareMargin),
      _SimulationData.gNeurons.length * (this.squareSize + this.squareMargin));
    context.fill();

    if (typeof x !== "undefined" && typeof y !== "undefined") {
      context.fillStyle = "#dfdfdf";
      context.beginPath();
      context.rect(-(this.translateX / this.scale),
        (y * (this.squareSize + this.squareMargin)) + this.squareMargin, _SingletonConfig.width / this.scale,
        this.squareSize);
      context.fill();
      context.beginPath();
      context.rect((x * (this.squareSize + this.squareMargin)) + this.squareMargin,
        -(this.translateY / this.scale), this.squareSize, _SingletonConfig.height / this.scale);
      context.fill();
    }

    context.fillStyle = "#dfdfdf";
    for (var z = 0; z <= _SimulationData.gNeurons.length; z++) {

      context.beginPath();
      context.rect(0, (z * (this.squareSize + this.squareMargin)),
        _SimulationData.gNeurons.length * (this.squareSize + this.squareMargin), this.squareMargin);
      context.fill();

      context.beginPath();
      context.rect((z * (this.squareSize + this.squareMargin)), 0, this.squareMargin,
        _SimulationData.gNeurons.length * (this.squareSize + this.squareMargin));
      context.fill();
    }

    var self = this;
    data.forEach(function (d) {

        var color = d.color;
        if (d.draw && typeof (d.data) !== "undefined") {

          d.data.forEach(function (d) {
            context.fillStyle = "#777777";
            if (_SimulationFilter.gNeuronsFilterB[d[0]] || _SimulationFilter.gNeuronsFilterB[d[1]])
              context.fillStyle = color;
            context.beginPath();
            context.rect(
              (_SimulationData.gNeurons[d[1]].index * (self.squareSize + self.squareMargin)) + self.squareMargin,
              (_SimulationData.gNeurons[d[0]].index * (self.squareSize + self.squareMargin)) + self.squareMargin,
              self.squareSize, self.squareSize);
            context.fill();
            context.globalAlpha = 1;

          });
        }

      }
    );


    context.fillStyle = "#ffffff";
    context.beginPath();
    context.rect(-(this.translateX / this.scale),
      -((this.translateY) / this.scale), _SingletonConfig.width / this.scale, this.axisSize / this.scale);
    context.fill();


    context.beginPath();
    context.rect(-(this.translateX / this.scale),
      -((this.translateY) / this.scale), this.axisSize / this.scale, _SingletonConfig.height / this.scale);

    context.fill();
    context.textBaseline = "middle";
    var fontsize = this.fontSize / this.scale;
    context.font = "normal normal bold " + fontsize + "px sans-serif";
    context.fillStyle = "#353535";

    for (var k = 0; k < _SimulationData.gNeurons.length; k += Math.min(Math.max(Math.round(this.minAxisNumbers / this.scale), 1), _SimulationData.gNeurons.length / this.minAxisNumbers)) {
      var midPosX = (k * (this.squareSize + this.squareMargin)) + (this.squareSize * 0.5) + this.squareMargin;

      context.rotate(-Math.PI * 0.5);
      context.textAlign = "start";
      context.textBaseline = "middle";
      context.fillText(_SimulationFilter.orderIndex[k],
        (this.translateY - this.axisSize + this.axisMargin) / this.scale, midPosX);
      context.rotate(Math.PI * 0.5);

      context.textAlign = "end";
      context.textBaseline = "middle";
      context.fillText(_SimulationFilter.orderIndex[k],
        -(this.translateX - this.axisSize + this.axisMargin) / this.scale, midPosX);

      context.beginPath();
      context.rect(-((this.translateX - this.axisSize) / this.scale), midPosX - (this.axisLineWidth * 0.5) / this.scale, -this.axisLineHeight / this.scale,
        this.axisLineWidth / this.scale);
      context.rect(midPosX - (this.axisLineWidth * 0.5) / this.scale, -((this.translateY - this.axisSize) / this.scale), this.axisLineWidth / this.scale,
        -this.axisLineHeight / this.scale);
      context.fill();
    }

    context.fillStyle = "#f5f5f5";
    context.beginPath();
    context.rect(-(this.translateX / this.scale),
      -((this.translateY) / this.scale), this.axisSize / this.scale, this.axisSize / this.scale);
    context.fill();

    context.fillStyle = "#000000";
    context.strokeStyle = "#ababab";
    context.beginPath();
    context.moveTo(-((this.translateX) / this.scale),
      -((this.translateY - this.axisSize) / this.scale));
    context.lineTo(-((this.translateX - this.axisSize - _SingletonConfig.width) / this.scale),
      -((this.translateY - this.axisSize) / this.scale));
    context.lineWidth = 1 / this.scale;
    context.stroke();

    context.beginPath();
    context.moveTo(-((this.translateX - this.axisSize) / this.scale),
      -((this.translateY) / this.scale));
    context.lineTo(-((this.translateX - this.axisSize) / this.scale),
      -((this.translateY - this.axisSize - _SingletonConfig.height) / this.scale));
    context.lineWidth = 1 / this.scale;
    context.stroke();
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillText("0,0", -((this.translateX - this.axisSize * 0.5) / this.scale), -((this.translateY - this.axisSize * 0.5) / this.scale));

  },

  updateVisualization: function () {
    this.draw();
  },

  mouseDown: function (self) {
    if (parseInt(d3.mouse(_SingletonConfig.svg.node())[0]) <= self.axisSize && parseInt(d3.mouse(_SingletonConfig.svg.node())[0]) <= self.axisSize) {
      self.zoombehavior.translate([0, 0]).scale(1);
      self.translateX = self.axisSize;
      self.translateY = self.axisSize;
      self.scale = 1;
      self.draw();
      self.resetZoom = true;
    }
  },

  mouseMove: function (self) {
    var color = rgbToHex(self.context.getImageData(parseInt(d3.mouse(_SingletonConfig.svg.node())[0]), parseInt(d3.mouse(_SingletonConfig.svg.node())[1]), 1, 1).data);
    if (color === _SingletonConfig.EEColor || color === _SingletonConfig.IIColor
      || color === _SingletonConfig.EIColor || color === _SingletonConfig.IEColor) {
      self.draw(parseInt(parseInt((d3.mouse(_SingletonConfig.svg.node())[0] - self.translateX) / self.scale, 10) / (self.squareSize + self.squareMargin)), parseInt(parseInt((d3.mouse(_SingletonConfig.svg.node())[1] - self.translateY) / self.scale, 10) / (self.squareSize + self.squareMargin)));
      var tooltipX = d3.mouse(d3.select('body').node())[0];
      var tooltipWidth = $("#tooltip").outerWidth();

      if ((tooltipX + tooltipWidth) > $(window).width())
        tooltipX -= tooltipWidth;

      d3.select("#tooltip")
        .style("left", tooltipX + "px")
        .style("top", d3.mouse(_SingletonConfig.svg.node())[1] + 10 + "px")
        .html(
          "From: <b>" + _SimulationFilter.orderIndex[parseInt(parseInt((d3.mouse(_SingletonConfig.svg.node())[1] - self.translateY) / self.scale, 10) / (self.squareSize + self.squareMargin))]
          + "</b><br> To: <b>" + _SimulationFilter.orderIndex[parseInt(parseInt((d3.mouse(_SingletonConfig.svg.node())[0] - self.translateX) / self.scale, 10) / (self.squareSize + self.squareMargin))] + "</b>"
        );
      d3.select("#tooltip").classed("hidden", false);
    } else {
      self.draw();
      d3.select("#tooltip").classed("hidden", true);
    }
  },

  zoom: function (self) {
    if (!self.resetZoom) {
      self.translateX = Math.max(Math.min(d3.event.translate[0], self.axisSize), ((-_SimulationData.gNeurons.length * (self.squareSize + self.squareMargin) * d3.event.scale) + _SingletonConfig.width));
      self.translateY = Math.max(Math.min(d3.event.translate[1], self.axisSize), ((-_SimulationData.gNeurons.length * (self.squareSize + self.squareMargin) * d3.event.scale) + _SingletonConfig.height));
      self.scale = d3.event.scale;
    }
    self.resetZoom = false;

    self.zoombehavior.translate([self.translateX, self.translateY]).scale(self.scale);
    self.draw();

  }
};
