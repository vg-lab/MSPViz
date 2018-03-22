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

MSP.ColorPicker = function () {
  this.colorScaleTypes = ['Categorical', 'Diverging', 'Sequential'];
  this.colorScales = [
    [
      {labelInternal: "schemeAccent", label: "schemeAccent", group: "Categorical"},
      {labelInternal: "schemeDark2", label: "Dark2", group: "Categorical"},
      {labelInternal: "schemePaired", label: "Paired", group: "Categorical"},
      {labelInternal: "schemePastel1", label: "Pastel1", group: "Categorical"},
      {labelInternal: "schemePastel2", label: "Pastel2", group: "Categorical"},
      {labelInternal: "schemeSet1", label: "Set1", group: "Categorical"},
      {labelInternal: "schemeSet2", label: "Set2", group: "Categorical"},
      {labelInternal: "schemeSet3", label: "Set3", group: "Categorical"}
    ],
    [
      {labelInternal: "Viridis", label: "Viridis", group: "Diverging"},
      {labelInternal: "Inferno", label: "Inferno", group: "Diverging"},
      {labelInternal: "Magma", label: "Magma", group: "Diverging"},
      {labelInternal: "Plasma", label: "Plasma", group: "Diverging"},
      {labelInternal: "Warm", label: "Warm", group: "Diverging"},
      {labelInternal: "Cool", label: "Cool", group: "Diverging"},
      {labelInternal: "CubehelixDefault", label: "CubehelixDefault", group: "Diverging"},
      {labelInternal: "BrBG", label: "BrBG", group: "Diverging"},
      {labelInternal: "PRGn", label: "PRGn", group: "Diverging"},
      {labelInternal: "PiYG", label: "PiYG", group: "Diverging"},
      {labelInternal: "PuOr", label: "PuOr", group: "Diverging"},
      {labelInternal: "RdBu", label: "RdBu", group: "Diverging"},
      {labelInternal: "RdGy", label: "RdGy", group: "Diverging"},
      {labelInternal: "RdYlBu", label: "RdYlBu", group: "Diverging"},
      {labelInternal: "RdYlGn", label: "RdYlGn", group: "Diverging"},
      {labelInternal: "Spectral", label: "Spectral", group: "Diverging"}
    ],
    [
      {labelInternal: "Greens", label: "Greens", group: "Sequential"},
      {labelInternal: "Greys", label: "Greys", group: "Sequential"},
      {labelInternal: "Oranges", label: "Oranges", group: "Sequential"},
      {labelInternal: "Purples", label: "Purples", group: "Sequential"},
      {labelInternal: "Reds", label: "Reds", group: "Sequential"},
      {labelInternal: "BuGn", label: "BuGn", group: "Sequential"},
      {labelInternal: "BuPu", label: "BuPu", group: "Sequential"},
      {labelInternal: "GnBu", label: "GnBu", group: "Sequential"},
      {labelInternal: "OrRd", label: "OrRd", group: "Sequential"},
      {labelInternal: "PuBuGn", label: "PuBuGn", group: "Sequential"},
      {labelInternal: "PuBu", label: "PuBu", group: "Sequential"},
      {labelInternal: "PuRd", label: "PuRd", group: "Sequential"},
      {labelInternal: "RdPu", label: "RdPu", group: "Sequential"},
      {labelInternal: "YlGnBu", label: "YlGnBu", group: "Sequential"},
      {labelInternal: "YlGn", label: "YlGn", group: "Sequential"},
      {labelInternal: "YlOrBr", label: "YlOrBr", group: "Sequential"},
      {labelInternal: "YlOrRd", label: "YlOrRd", group: "Sequential"}
    ]
  ];
  this.colorPickerWidth = null;
  this.colorSelec = "";
  this.colorRange = null;
  this.colorSelecGlobal = "";
  this.lineIndicator = null;
  this.squareAnchor = null;
  this.svgContainer = null;
  this.numSteps = 10;
  this.callback = null;
  this.configPropID = null;
  this.originDOMElement = null;
};

MSP.ColorPicker.prototype = {
  constructor: MSP.ColorPicker,

  generateColorPicker: function () {
    var self = this;
    var height = $("#colorPicker").height();
    var width = $("#colorPicker").width();

    $("#colorRender").empty();

    this.colorPickerWidth = width;

    $("#genericColorPicker").jqxColorPicker({color: "0000FF", colorMode: 'hue', width: width, height: "50%"});

    $("#genericColorPicker").find("input").each(function () {
      $(this).attr('style', "");
    });

    this.colorRange = d4.scaleSequential(d4.interpolateViridis);

    var svgContainer = d4.select("#colorRender").append("svg")
                         .attr("width", "100%")
                         .attr("height", height * 0.2)
                         .attr("class", "color");
    this.svgContainer = svgContainer;

    var lg = svgContainer.append("defs").append("linearGradient")
                         .attr("id", "gradient")
                         .attr("x1", "0%")
                         .attr("x2", "100%")
                         .attr("y1", "0%")
                         .attr("y2", "0%");

    for (var i = 0; i <= 20; i++) {
      lg.append("stop")
        .attr("offset", (i * 5) + "%")
        .style("stop-color", this.colorRange(i / 20))
        .style("stop-opacity", 1);
    }

    $("#btnColorPickerCancel").on('click', function () {
      self.hide();
    });

    $("#btnColorPickerAccept").on('click', function () {
      self.accept();
    });

    this.colorScaleTypes.forEach(function (elem, i) {
      $('#comboScaleType').append($('<option>', {
        value: i,
        text: elem
      }));
    });

    this.colorScales[0].forEach(function (elem, i) {
      $('#comboScale').append($('<option>', {
        value: i,
        text: elem.label
      }));
    });

    this.generateColorSquares();

    this.generateScale();

    $('#comboScale').on('change', function () {
      var idxScaleType = $("#comboScaleType").prop('selectedIndex');
      var idxColorScale = $("#comboScale").prop('selectedIndex');
      var colorScale = self.colorScales[idxScaleType][idxColorScale].labelInternal;
      if ($("#comboScaleType").prop('selectedIndex') === 0)
        _ColorPicker.categorical(colorScale);
      else
        _ColorPicker.update(colorScale);
      _ColorPicker.updatePick();
    });

    $('#comboScaleType').on('change', function () {
      $("#comboScale").empty();
      self.colorScales[$("#comboScaleType").prop('selectedIndex')].forEach(function (elem, i) {
        $('#comboScale').append($('<option>', {
          value: i,
          text: elem.label
        }));
      });
      $('#comboScale').trigger("change");
    });

    $('#colorBandScale').hide();
  },

  resize: function () {
    var height = $("#colorPicker").height();
    var width = $("#colorPicker").width();
    var colorScaleType = $("#comboScaleType option:selected").text();
    var isCategorical = colorScaleType === "Categorical";

    this.colorPickerWidth = width;
    _ColorPicker.svgContainer.attr("height", height * 0.2);

    $("#genericColorPicker").jqxColorPicker({width: width, height: "50%"});

    this.generateColorSquares();

    if (!isCategorical)
      this.generateScale();
  },

  generateScale: function () {
    var height = $("#colorPicker").height() * 0.2;
    var width = $("#colorPicker").width();
    var figSize = width * 0.03;
    var self = _ColorPicker;
    var draag = d4.drag().on('drag', self.moveBarColor);

    d4.select('#colorBandScale').remove();
    var scaleComponents = self.svgContainer.append("g").attr("id", "colorBandScale");

    var colorScale = scaleComponents.append("rect")
                                    .attr("id", "colorGradientScale")
                                    .attr("height", height * 0.5)
                                    .attr("y", height * 0.5)
                                    .attr("cursor", "pointer")
                                    .attr("width", this.colorPickerWidth)
                                    .attr("fill", "url(#gradient)");

    colorScale.on("click", self.moveBarColor).on("drag", self.moveBarColor).on("dragend", self.moveBarColor);

    self.lineIndicator = scaleComponents.append("rect")
                                        .attr("x", this.colorPickerWidth - figSize / 2)
                                        .attr("id", "lineIndicator")
                                        .attr("y", (height * 0.5) - figSize)
                                        .attr('fill', '#fff')
                                        .attr("height", (height * 0.5) + figSize)
                                        .attr("width", 1)
                                        .attr("cursor", "move")
                                        .call(draag);

    self.squareAnchor = scaleComponents.append("rect")
                                       .attr("x", this.colorPickerWidth - figSize)
                                       .attr("id", "indicador")
                                       .attr("y", (height * 0.5) - figSize)
                                       .attr("width", figSize)
                                       .attr("height", figSize)
                                       .attr("cursor", "move")
                                       .attr("fill", "black")
                                       .call(draag);

    self.squareAnchor.append("g");
  },

  generateColorSquares: function () {
    var height = $("#colorPicker").height() * 0.2;
    var width = $("#colorPicker").width();
    var squareHeight = height * 0.3;
    var self = _ColorPicker;
    var idxSaleType = $("#comboScaleType").prop('selectedIndex');
    var idxColorSale = $("#comboScale").prop('selectedIndex');
    var colorScale = self.colorScales[idxSaleType][idxColorSale].labelInternal;
    var colorScaleType = $("#comboScaleType option:selected").text();
    var isCategorical = colorScaleType === "Categorical";

    if (colorScale === "" || colorScale === null) colorScale = "Viridis";

    if (isCategorical) {
      self.colorRange = d4[colorScale];
      squareHeight = height;
    }
    else {
      self.colorRange = d4["interpolate" + colorScale];
      squareHeight = height * 0.3;
    }

    if (self.colorRange.length < self.numSteps && isCategorical) self.numSteps = self.colorRange.length;
    var numSquares = self.numSteps;

    d4.select('#rectanglesPick').remove();
    var colorSquares = self.svgContainer.append("g").attr("id", "rectanglesPick");

    var colorSquareWidth = ((self.colorPickerWidth - 4 - width * 0.16) - ((numSquares - 1) * 2)) / numSquares;

    colorSquares.append("rect")
                .attr("class", "colorSquare")
                .attr("x", 0)
                .attr("width", width * 0.08)
                .attr("height", squareHeight)
                .attr("i", 0)
                .attr("fill", "#262943")
                .attr("cursor", "pointer")
                .on("click", function () {
                  if (self.numSteps > 0)
                    self.numSteps -= 1;
                  self.generateColorSquares();
                });
    colorSquares.append("text")
                .text("-")
                .attr("x", (width * 0.04))
                .attr("y", squareHeight * 0.5)
                .attr("fill", "#fff")
                .style("font-size", "1vw")
                .style("font-weight", "700")
                .attr("text-anchor", "middle")
                .attr("pointer-events", "none")
                .attr("user-select", "none")
                .attr("alignment-baseline", "central");

    colorSquares.append("rect")
                .attr("class", "colorSquare")
                .attr("x", (width * 0.08) + 2 + (numSquares * (colorSquareWidth + 2)))
                .attr("width", width * 0.08)
                .attr("height", squareHeight)
                .attr("i", (numSquares - 1))
                .attr("fill", "#262943")
                .attr("cursor", "pointer")
                .on("click", function () {
                  if ((self.numSteps < 20 && !isCategorical) ||
                      (self.numSteps < self.colorRange.length && isCategorical))
                    self.numSteps += 1;
                  self.generateColorSquares();
                });

    colorSquares.append("text")
                .text("+")
                .attr("x", (width * 0.08) + 2 + (numSquares * (colorSquareWidth + 2)) + (width * 0.04))
                .attr("y", squareHeight * 0.5)
                .attr("fill", "#fff")
                .style("font-size", "1vw")
                .style("font-weight", "700")
                .attr("text-anchor", "middle")
                .attr("pointer-events", "none")
                .attr("user-select", "none")
                .attr("alignment-baseline", "central");

    for (var i = 0; i <= (numSquares - 1); i++) {
      var color;
      if (isCategorical)
        color = self.colorRange[i];
      else
        color = self.colorRange(i / (numSquares - 1));

      colorSquares.append("rect")
                  .attr("class", "colorSquare")
                  .attr("x", (width * 0.08) + 2 + (i * (colorSquareWidth + 2)))
                  .attr("width", colorSquareWidth)
                  .attr("height", squareHeight)
                  .attr("i", i)
                  .attr("fill", color)
                  .attr("cursor", "pointer")
                  .on("click", self.colorchange);
    }
  },

  categorical: function () {
    $('#colorBandScale').hide();
    var self = _ColorPicker;
    self.generateColorSquares();
  },

  update: function (color) {
    $('#colorBandScale').show();
    var self = _ColorPicker;

    self.colorRange = d4.scaleSequential(d4["interpolate" + color]);
    d4.select("#gradient")
      .selectAll("stop")
      .each(function (d, i) {
        d4.select(this).style("stop-color", self.colorRange(i / 20));

      });
    self.generateColorSquares();
    d4.select("#colorGradientScale").attr("fill", "url(#gradient)");
  },

  updatePick: function () {
    if (!d4.select("#lineIndicator").empty()) {
      var color = d4.color(_ColorPicker.colorRange(d4.select("#lineIndicator").attr('x') /
                                                   _ColorPicker.colorPickerWidth));
      $("#genericColorPicker").jqxColorPicker('setColor', _ColorPicker.rgbToHex(color));
      var a = 1 - (0.299 * color.r + 0.587 * color.g + 0.114 * color.b) / 255;
      var colorText = "white";
      if (a < 0.5) colorText = "black";
      _ColorPicker.lineIndicator.attr('fill', colorText);
    }
  },

  colorchange: function () {
    var self = _ColorPicker;
    var numCuad = self.numSteps;
    var color = d4.color(d4.select(this).attr("fill"));
    var x = d4.select(this).attr("i");
    var a = 1 - (0.299 * color.r + 0.587 * color.g + 0.114 * color.b) / 255;
    var colorText = "white";
    if (a < 0.5) colorText = "black";
    self.lineIndicator.attr('fill', colorText);
    self.lineIndicator.attr('x', x * (self.colorPickerWidth / (numCuad - 1)));
    self.squareAnchor.attr('x', x * (self.colorPickerWidth / (numCuad - 1)) - 4);
    colorSelec = color;
    $("#genericColorPicker").jqxColorPicker('setColor', self.rgbToHex(color));
  },

  hide: function () {
    $("#popup").css({"visibility": "hidden"});
  },

  accept: function () {
    var self = _ColorPicker;
    var color = "#" + $("#genericColorPicker").jqxColorPicker('getColor').hex;
    $("#popup").css({"visibility": "hidden"});
    self.callback(self.originDOMElement, color, self.configPropID);
  },

  moveBarColor: function () {
    var self = _ColorPicker;
    var coordinate = d4.mouse(this);
    var x = coordinate[0];
    if (x >= 0 && x <= self.colorPickerWidth) {
      var color = d4.color(self.colorRange(x / self.colorPickerWidth));
      if ((1 - (0.299 * color.r + 0.587 * color.g + 0.114 * color.b) / 255) < 0.5)
        self.lineIndicator.attr('fill', "black");
      else
        self.lineIndicator.attr('fill', "white");

      self.lineIndicator.attr('x', x);
      self.squareAnchor.attr('x', x - 5);

      $("#genericColorPicker").jqxColorPicker('setColor', self.rgbToHex(color));
    }
  },

  componentToHex: function (c) {
    var hex = c.toString(16);
    return hex.length === 1 ? "0" + hex : hex;
  },

  rgbToHex: function (color) {
    return "#" + this.componentToHex(color.r) + this.componentToHex(color.g) + this.componentToHex(color.b);
  },

  generateColors: function (scale, colorDOMObject, colorConfig, isCategorical) {
    var z = null;
    if (isCategorical)
      z = d4[scale];
    else
      z = d4["interpolate" + scale];

    for (var i = 0; i < colorDOMObject.length; i++) {
      var color;
      if (isCategorical)
        color = d4.color(z[i]);
      else
        color = d4.color(z(i / (colorDOMObject.length - 1)));

      $(colorDOMObject[i]).children("div").css('background', color);
      $(colorDOMObject[i]).children("span").text(this.rgbToHex(color));
      colorConfig[i] = _ColorPicker.rgbToHex(color);
    }

    return colorConfig;
  }
};
