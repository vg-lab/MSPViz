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

MSP.MicroscopicView = function () {
  //Subdivision of pies
  this.piesShapes = [1, 1, 1];
  this.data = [];

  //Standard sizes of pies
  this.outerRadius = 160;
  this.innerRadius = 10;
  this.minInnerRadius = 10;
  this.scale = null;
  this.trans = null;
  this.path;
  this.arc;
  this.selectedMicro = [];

  //Local Scales
  this.AxScale;
  this.DeInScale;
  this.DeExScale;

  this.GlScale;

  this.shapes;
  this.paths;
  this.pies;
  this.graph;
  this.zoombehavior = 0;

  this.semZoomActive = false;

  this.MSPViewType = "MicroV";
  this.tooltipMarginRatio = 0.005;
  this.shapeRatio = 0.2;
  this.shapeSize;
  this.innerRadiusRadio = 0.02;
  this.outerRadiusRatio = 0.08;
};

MSP.MicroscopicView.prototype = {
  constructor: MSP.MicroscopicView,

  resize: function () {
    this.generateMicroscopicView();
  },

  generateMicroscopicView: function () {

    _SingletonConfig.navBar = [];
    generateNav();
    //Generate the pies
    var lNumNeurons = _SingletonConfig.gSelectionIds.length;
    _SimulationData.gNeuronsRep = [];

    for (var i = 0; i < lNumNeurons; ++i) {
      _SimulationData.gNeuronsRep.push(this.piesShapes);
    }
    this.recalculatePos();
    this.reclculateSEScales();

    this.size = Math.min(_SingletonConfig.width, _SingletonConfig.height);
    this.shapeSize = this.size * this.shapeRatio;
    this.innerRadius = this.size * this.innerRadiusRadio;
    this.minInnerRadius = this.innerRadius;
    this.outerRadius = this.size * this.outerRadiusRatio;

    var lMinPosX = Infinity, lMinPosY = Infinity, lMaxPosX = -Infinity, lMaxPosY = -Infinity;

    for (var i = 0; i < _SingletonConfig.gSelectionIds.length; ++i) {
      if (lMinPosX > _SimulationData.gNeurons[_SingletonConfig.gSelectionIds[i]].PosX)
        lMinPosX = _SimulationData.gNeurons[_SingletonConfig.gSelectionIds[i]].PosX;
      if (lMaxPosX < _SimulationData.gNeurons[_SingletonConfig.gSelectionIds[i]].PosX)
        lMaxPosX = _SimulationData.gNeurons[_SingletonConfig.gSelectionIds[i]].PosX;

      if (lMinPosY > _SimulationData.gNeurons[_SingletonConfig.gSelectionIds[i]].PosY)
        lMinPosY = _SimulationData.gNeurons[_SingletonConfig.gSelectionIds[i]].PosY;
      if (lMaxPosY < _SimulationData.gNeurons[_SingletonConfig.gSelectionIds[i]].PosY)
        lMaxPosY = _SimulationData.gNeurons[_SingletonConfig.gSelectionIds[i]].PosY;
    }
    _SingletonConfig.recalculatePosScales(lMinPosX, lMaxPosX, lMinPosY, lMaxPosY, true);

    //Generate the arc
    this.arc = d3.svg
      .arc()
      .padRadius(this.outerRadius)
      .innerRadius(this.innerRadius);

    d3.selectAll("svg").filter(function () {
      return !this.classList.contains('color')
    }).remove();

    d3.selectAll("canvas").filter(function () {
      return !this.classList.contains('imgCanvas')
    }).remove();

    var self = this;

    this.zoombehavior = d3.behavior.zoom()
      .x(_SingletonConfig.xScale)
      .y(_SingletonConfig.yScale)
      .scaleExtent([-Infinity, Infinity])
      .on("zoom", self.zoomManager);

    this.graph = new MSP.GraphMicroscopicView();
    this.graph.generateGraph();

    _SingletonConfig.svg = d3.select("#renderArea")
      .append("svg")
      .attr("tabindex", 1)
      .on("keydown.brush", this.keyDown)
      .on("keyup.brush", this.keyUp)
      .style("outline", "none")
      .attr("width", _SingletonConfig.width * 0.50)
      .style("width", "50%")
      .attr("height", _SingletonConfig.height)
      .call(self.zoombehavior)
      .append("g");


    //For zooming
    _SingletonConfig.svg
      .append("rect")
      .attr("class", "overlay")
      .attr("x", -_SingletonConfig.width)
      .attr("y", -_SingletonConfig.height)
      .attr("width", _SingletonConfig.width * 3)
      .attr("height", _SingletonConfig.height * 3)
      .style("opacity", "0.0")
      .on("mousedown", function () {
          d3.selectAll("path").classed("selected", false);
          _SingletonConfig.neuronSelected = -1;
        }
      );

    this.brush = d3.svg.brush()
      .x(_SingletonConfig.noXScale)
      .y(_SingletonConfig.noYScale)
      .extent([[0, 0], [1000, 1000]])
      .on("brush", function (d) {
        if (_SimulationController.view.selecting) {

          var extent = d3.event.target.extent();
          _SingletonConfig.gSelectionIds.forEach(function (i) {
            var d = _SimulationData.gNeurons[i];
            var x = (_SingletonConfig.xScale(d.PosX) - self.zoombehavior.translate()[0]) / self.zoombehavior.scale();
            var y = (_SingletonConfig.yScale(d.PosY) - self.zoombehavior.translate()[1]) / self.zoombehavior.scale();
            d.selectedM = (d.previouslySelectedM ^
              (extent[0][0] <= x
                && x < extent[1][0]
                && extent[0][1] <= y
                && y < extent[1][1]));

          });
        }
      })
      .on("brushend", function (d) {
        self.selectedMicro = [];
        _SingletonConfig.gSelectionIds.forEach(function (i) {
          _SimulationData.gNeurons[i].previouslySelectedM = _SimulationData.gNeurons[i].selectedM;
          if (_SimulationData.gNeurons[i].selectedM)
            self.selectedMicro.push(i);
        });

        d3.event.target.clear();
        d3.select(this).call(d3.event.target);
        if (self.selectedMicro.length > 0)
          self.updateVisualization(true);
      });

    _SingletonConfig.svg
      .append("g")
      .datum(function () {
          return {selected: false, previouslySelected: false};
        }
      )
      .attr("class", "brush")
      .call(this.brush);

    d3.select("g.brush").style("opacity", 0.0);

    _SingletonConfig.svg
      .append("g")
      .attr("class", "shapes");

    _SingletonConfig.svg
      .append("g")
      .attr("class", "pies");

    this.shapes = _SingletonConfig.svg
      .select(".shapes")
      .selectAll("path")
      .data(_SingletonConfig.gSelectionIds);


    this.shapes.enter()
      .append("path")
      .attr("d", d3.svg.symbol()
        .type(function (d) {
            if (_SimulationData.gNeurons[d].NAct == "E") return "triangle-up";
            else return "circle";
          }
        ).size(this.shapeSize)
      )

      .style("fill", "rgb(255,255,255)")
      .style("stroke", "black")
      .on("mousedown", function (d) {
          if (_SimulationController.view.selecting) {
            d3.selectAll("path").classed("selected", false);
            d3.select(this).classed("selected", true);
            _SingletonConfig.neuronSelected = d;
          }
        }
      )
      .on("mousemove", function (d) {
        d3.selectAll(".graphLine").style("stroke", function (node) {
          if (parseInt(this.id) !== d) {
            return "#ababab";
          } else {
            d3.select(this).moveToFront();
            return d3.select(this).attr("color")
          }
        });

        var tooltipX = d3.mouse(d3.select('body').node())[0] + self.tooltipMarginRatio * _SingletonConfig.width;
        var tooltipY = d3.mouse(d3.select('body').node())[1] + self.tooltipMarginRatio * _SingletonConfig.height;
        var tooltipWidth = $("#tooltip").outerWidth();
        var tooltipHeight = $("#tooltip").outerHeight();

        if ((tooltipX + tooltipWidth) > $(window).width())
          tooltipX -= tooltipWidth;

        if ((tooltipY + tooltipHeight) > $("#renderArea").height())
          tooltipY -= tooltipHeight;


        var ENode = 0;
        var INode = 0;
        var ANode = 0;
        var lIndex = _SimulationController.actSimStep % _SimulationData.numSimStepsPerFile;

        switch (_SingletonConfig.SEViewSelector) {
          case 0:
            ENode = (_SimulationData.gNeuronsDetails[d].DeSeEA[lIndex]);
            INode = (_SimulationData.gNeuronsDetails[d].DeSeIA[lIndex]);
            ANode = (_SimulationData.gNeuronsDetails[d].AxSeA[lIndex]);
            break;
          case 1:
            ENode = (_SimulationData.gNeuronsDetails[d].DeSeEV[lIndex]);
            INode = (_SimulationData.gNeuronsDetails[d].DeSeIV[lIndex]);
            ANode = (_SimulationData.gNeuronsDetails[d].AxSeV[lIndex]);
            break;
          case 2:
            ENode = (_SimulationData.gNeuronsDetails[d].DeSeEC[lIndex]);
            INode = (_SimulationData.gNeuronsDetails[d].DeSeIC[lIndex]);
            ANode = (_SimulationData.gNeuronsDetails[d].AxSeC[lIndex]);
            break;
          default:
            break;
        }

        d3.select("#tooltip")
          .style("left", tooltipX + "px")
          .style("top", tooltipY + "px")
          .html(
            "Id: <b>" + _SimulationData.gNeurons[d].NId
            + "</b><br> CaC= <b>" + _SimulationData.gNeuronsDetails[d].Calcium[lIndex]
            + "</b><br>  SE_E: <b>" + ENode
            + "</b> SE_I: <b>" + INode
            + "</b> SE_A: <b>" + ANode + "</b>"
          );

        d3.select("#tooltip").classed("hidden", false);

      })
      .on("mouseout", function () {
          d3.selectAll(".graphLine").style("stroke", function () {
            return d3.select(this).attr("color")
          });
          d3.select("#tooltip").classed("hidden", true);
        }
      );

    this.pies = _SingletonConfig.svg
      .select(".pies")
      .selectAll("svg")
      .data(_SimulationData.gNeuronsRep)
    ;

    this.pies.enter()
      .append("g")
      .attr("transform", self.transform)
    ;

    var lId = -1;

    this.paths = this.pies
      .selectAll("path")
      .data(d3.layout
        .pie()
        .padAngle(0.05))
      .enter()
      .append("path")
      .each(function (d) {
          d.foo = d.outerRadius = this.minInnerRadius;
        }
      )
      .attr("d", this.arc)
      .attr("id", function (d) {
        return d.id = (++lId);
      })
      .style("fill", function (d, i) {
          var lIndirectNeuId = parseInt(d.id / 3);
          var lRealNeuId = _SingletonConfig.gSelectionIds[lIndirectNeuId];
          if ((self.selectedMicro.length === 0 && !_SimulationFilter.gNeuronsFilterB[lRealNeuId]) || (self.selectedMicro.length !== 0 && !_SimulationData.gNeurons[lRealNeuId].selectedM)) {
            return "#434343";
          }
          if (i == 0) return _SingletonConfig.EColor;
          if (i == 1) {


            var lTmpColor;
            if (_SimulationData.gNeurons[lRealNeuId].NAct == "E") lTmpColor = new KolorWheel(_SingletonConfig.EColor).getRgb();
            else lTmpColor = new KolorWheel(_SingletonConfig.IColor).getRgb();

            axonalColor = _SingletonConfig.AColor;
            delete lTmpColor;

            return axonalColor;
          }
          if (i == 2) return _SingletonConfig.IColor;
        }
      )
      .style("stroke", function (d, i) {
          var lIndirectNeuId = parseInt(d.id / 3);
          var lRealNeuId = _SingletonConfig.gSelectionIds[lIndirectNeuId];

          return "rgb(0,0,0)";
        }
      )
      .style("stroke-width", 0.2)
      .attr("stroke-opacity", 0.6)
      .on("mousemove", function (d, i) {
        var lIndirectNeuId = parseInt(this.id / 3);
        d = _SingletonConfig.gSelectionIds[lIndirectNeuId];
        d3.selectAll(".graphLine").style("stroke", function (node) {
          if (parseInt(this.id) !== d) {
            return "#ababab";
          } else {
            d3.select(this).moveToFront();
            return d3.select(this).attr("color")
          }
        });

        var tooltipX = d3.mouse(d3.select('body').node())[0] + self.tooltipMarginRatio * _SingletonConfig.width;
        var tooltipY = d3.mouse(d3.select('body').node())[1] + self.tooltipMarginRatio * _SingletonConfig.height;
        var tooltipWidth = $("#tooltip").outerWidth();
        var tooltipHeight = $("#tooltip").outerHeight();

        if ((tooltipX + tooltipWidth) > $(window).width())
          tooltipX -= tooltipWidth;

        if ((tooltipY + tooltipHeight) > $("#renderArea").height())
          tooltipY -= tooltipHeight;


        var ENode = 0;
        var INode = 0;
        var ANode = 0;
        var lIndex = _SimulationController.actSimStep % _SimulationData.numSimStepsPerFile;

        switch (_SingletonConfig.SEViewSelector) {
          case 0:
            ENode = (_SimulationData.gNeuronsDetails[d].DeSeEA[lIndex]);
            INode = (_SimulationData.gNeuronsDetails[d].DeSeIA[lIndex]);
            ANode = (_SimulationData.gNeuronsDetails[d].AxSeA[lIndex]);
            break;
          case 1:
            ENode = (_SimulationData.gNeuronsDetails[d].DeSeEV[lIndex]);
            INode = (_SimulationData.gNeuronsDetails[d].DeSeIV[lIndex]);
            ANode = (_SimulationData.gNeuronsDetails[d].AxSeV[lIndex]);
            break;
          case 2:
            ENode = (_SimulationData.gNeuronsDetails[d].DeSeEC[lIndex]);
            INode = (_SimulationData.gNeuronsDetails[d].DeSeIC[lIndex]);
            ANode = (_SimulationData.gNeuronsDetails[d].AxSeC[lIndex]);
            break;
          default:
            break;
        }

        d3.select("#tooltip")
          .style("left", tooltipX + "px")
          .style("top", tooltipY + "px")
          .html(
            "Id: <b>" + _SimulationData.gNeurons[d].NId
            + "</b><br> CaC= <b>" + _SimulationData.gNeuronsDetails[d].Calcium[lIndex]
            + "</b><br>  SE_E: <b>" + ENode
            + "</b> SE_I: <b>" + INode
            + "</b> SE_A: <b>" + ANode + "</b>"
          );

        d3.select("#tooltip").classed("hidden", false);

      })
      .on("mouseout", function () {
          d3.selectAll(".graphLine").style("stroke", function () {
            return d3.select(this).attr("color")
          });
          d3.select("#tooltip").classed("hidden", true);
        }
      );
    ;


  },

  recalculatePos: function () {

    var neurons = [];
    _SimulationData.gNeurons.forEach(function (d, i) {
      if (d.selected) {
        _SimulationData.gNeurons[d.NId].value = Math.max.apply(Math, [
          Math.max.apply(Math, _SimulationData.gNeuronsDetails[d.NId].DeSeEA),
          Math.max.apply(Math, _SimulationData.gNeuronsDetails[d.NId].DeSeIA),
          Math.max.apply(Math, _SimulationData.gNeuronsDetails[d.NId].AxSeA)
        ]);
        neurons.push(_SimulationData.gNeurons[d.NId]);
      }
    });
    var pack = d3.layout.pack()
      .size([_SingletonConfig.width, _SingletonConfig.height]).value(function (d) {
        return d.value + 1;
      }).padding(1).sort(function (a, b) {
        return a.index - b.index;
      });
    var noes = pack.nodes({name: "root", value: 30, children: neurons});
    noes.shift();

    noes.forEach(function (d, i) {
      _SimulationData.gNeurons[neurons[i].NId].PosX = d.x;
      _SimulationData.gNeurons[neurons[i].NId].PosY = d.y;
    });
  },

  updatePos: function () {
    var self = this;
    this.shapes
      .attr("transform", self.transformShapes);


    this.pies
      .attr("transform", self.transform);
  },

  showInformation: function () {
    console.log(d3.select(this));
  },

  updateCalcium: function () {
    var self = this;
    var lIndex = _SimulationController.actSimStep % _SimulationData.numSimStepsPerFile;
    this.shapes.style("fill", function (d) {
      if ((self.selectedMicro.length === 0 && !_SimulationFilter.gNeuronsFilterB[d]) || (self.selectedMicro.length !== 0 && !_SimulationData.gNeurons[d].selectedM)) {
        return "#434343";
      }

      if (_SimulationData.gNeurons[d].NAct == "E") {
        var lVal = _SimulationData.CaEScale(_SimulationData.gNeuronsDetails[d].Calcium[lIndex]);
        return lVal;
      }
      else {
        var lVal = _SimulationData.CaIScale(_SimulationData.gNeuronsDetails[d].Calcium[lIndex]);
        return lVal;
      }
    }).style("fill-opacity", function (d) {

        if (!_SimulationFilter.gNeuronsFilterB[d] || (!_SimulationData.gNeurons[d].selectedM && self.selectedMicro.length > 0)) {
          return 0.1
        }
        else return 1


      }
    );
  },

  updateVisualization: function (proc) {

    this.graph.updateGraph();
    if (typeof proc === "undefined") {
      this.recalculatePos();
      this.updatePos();
    }
    var lIndex = _SimulationController.actSimStep % _SimulationData.numSimStepsPerFile;
    var myThis = this;
    var self = this;


    this.paths = this.pies
      .selectAll("path")
      .style("fill", function (d, i) {
          var elm = d3.select(this);
          var lIndirectNeuId = parseInt(elm.attr('id') / 3);
          var lRealNeuId = _SingletonConfig.gSelectionIds[lIndirectNeuId];
          if ((self.selectedMicro.length === 0 && !_SimulationFilter.gNeuronsFilterB[lRealNeuId]) || (self.selectedMicro.length !== 0 && !_SimulationData.gNeurons[lRealNeuId].selectedM)) {
            return "#434343";
          }
          if (i == 0) return _SingletonConfig.EColor;
          if (i == 1) {


            var lTmpColor;
            if (_SimulationData.gNeurons[lRealNeuId].NAct == "E") lTmpColor = new KolorWheel(_SingletonConfig.EColor).getRgb();
            else lTmpColor = new KolorWheel(_SingletonConfig.IColor).getRgb();

            axonalColor = _SingletonConfig.AColor;
            delete lTmpColor;

            return axonalColor;
          }
          if (i == 2) return _SingletonConfig.IColor;
        }
      )
      .attr("fill-opacity", function (d, i) {
          var elm = d3.select(this);
          var lIndirectNeuId = parseInt(elm.attr('id') / 3);
          var lRealNeuId = _SingletonConfig.gSelectionIds[lIndirectNeuId];
          if (!_SimulationFilter.gNeuronsFilterB[lRealNeuId] || (!_SimulationData.gNeurons[lRealNeuId].selectedM && self.selectedMicro.length > 0)) {
            return 0.1
          }
          else return 1


        }
      )
    ;

    this.paths
      .data(d3.layout.pie())
      .each(function (d) {
          var elm = d3.select(this);

          var lIndirectNeuId = parseInt(elm.attr('id') / 3);
          var lArcId = parseInt(elm.attr('id') % 3);
          var lRealNeuId = _SingletonConfig.gSelectionIds[lIndirectNeuId];

          var lPrevInc = 1;
          if (_SimulationController.actSimStep == 0) lPrevInc = 0;

          switch (_SingletonConfig.SEViewSelector) {
            case 0:
              //Dendritic excitatory
              if (lArcId == 0) {
                d.outerRadius = myThis.GlScale(_SimulationData.gNeuronsDetails[lRealNeuId].DeSeEA[(lIndex - lPrevInc) % _SimulationData.steps.length]);
                d.foo = myThis.GlScale(_SimulationData.gNeuronsDetails[lRealNeuId].DeSeEA[lIndex % _SimulationData.steps.length]);
              }
              //Axon elements
              if (lArcId == 1) {
                d.outerRadius = myThis.GlScale(_SimulationData.gNeuronsDetails[lRealNeuId].AxSeA[(lIndex - lPrevInc) % _SimulationData.steps.length]);
                d.foo = myThis.GlScale(_SimulationData.gNeuronsDetails[lRealNeuId].AxSeA[lIndex % _SimulationData.steps.length]);
              }
              //Dendritic inhibitory
              if (lArcId == 2) {
                d.outerRadius = myThis.GlScale(_SimulationData.gNeuronsDetails[lRealNeuId].DeSeIA[(lIndex - lPrevInc) % _SimulationData.steps.length]);
                d.foo = myThis.GlScale(_SimulationData.gNeuronsDetails[lRealNeuId].DeSeIA[lIndex % _SimulationData.steps.length]);
              }
              break;

            case 1:
              //Dendritic excitatory
              if (lArcId == 0) {
                d.outerRadius = myThis.GlScale(_SimulationData.gNeuronsDetails[lRealNeuId].DeSeEV[(lIndex - lPrevInc) % _SimulationData.steps.length]);
                d.foo = myThis.GlScale(_SimulationData.gNeuronsDetails[lRealNeuId].DeSeEV[lIndex % _SimulationData.steps.length]);
              }
              //Axon elements
              if (lArcId == 1) {
                d.outerRadius = myThis.GlScale(_SimulationData.gNeuronsDetails[lRealNeuId].AxSeV[(lIndex - lPrevInc) % _SimulationData.steps.length]);
                d.foo = myThis.GlScale(_SimulationData.gNeuronsDetails[lRealNeuId].AxSeV[lIndex % _SimulationData.steps.length]);
              }
              //Dendritic inhibitory
              if (lArcId == 2) {
                d.outerRadius = myThis.GlScale(_SimulationData.gNeuronsDetails[lRealNeuId].DeSeIV[(lIndex - lPrevInc) % _SimulationData.steps.length]);
                d.foo = myThis.GlScale(_SimulationData.gNeuronsDetails[lRealNeuId].DeSeIV[lIndex % _SimulationData.steps.length]);
              }
              break;

            case 2:
              //Dendritic excitatory
              if (lArcId == 0) {
                d.outerRadius = myThis.GlScale(_SimulationData.gNeuronsDetails[lRealNeuId].DeSeEC[(lIndex - lPrevInc) % _SimulationData.steps.length]);
                d.foo = myThis.GlScale(_SimulationData.gNeuronsDetails[lRealNeuId].DeSeEC[lIndex % _SimulationData.steps.length]);
              }
              //Axon elements
              if (lArcId == 1) {
                d.outerRadius = myThis.GlScale(_SimulationData.gNeuronsDetails[lRealNeuId].AxSeC[(lIndex - lPrevInc) % _SimulationData.steps.length]);
                d.foo = myThis.GlScale(_SimulationData.gNeuronsDetails[lRealNeuId].AxSeC[lIndex % _SimulationData.steps.length]);
              }
              //Dendritic inhibitory
              if (lArcId == 2) {
                d.outerRadius = myThis.GlScale(_SimulationData.gNeuronsDetails[lRealNeuId].DeSeIC[(lIndex - lPrevInc) % _SimulationData.steps.length]);
                d.foo = myThis.GlScale(_SimulationData.gNeuronsDetails[lRealNeuId].DeSeIC[lIndex % _SimulationData.steps.length]);
              }
              break;

            default:
              break;
          }


        }
      );

    if (typeof proc === "undefined")
      this.paths.attr("d", this.arcTween(_SimulationController.UpdateVelocity))
      ;

    this.updateCalcium();
  },

  reclculateSEScales: function () {
    //Maximun and minimun local values of the selection
    var lMax, lMin;
    lMax = lMin = 0.0;

    switch (_SingletonConfig.SEViewSelector) {
      case 0:
        for (var i = 0; i < _SingletonConfig.gSelectionIds.length; ++i)
          for (var j = 0; j < _SimulationData.gNeuronsDetails[_SingletonConfig.gSelectionIds[i]].AxSeA.length; ++j) {
            if (lMax < _SimulationData.gNeuronsDetails[_SingletonConfig.gSelectionIds[i]].AxSeA[j])
              lMax = _SimulationData.gNeuronsDetails[_SingletonConfig.gSelectionIds[i]].AxSeA[j];

            if (lMax < _SimulationData.gNeuronsDetails[_SingletonConfig.gSelectionIds[i]].DeSeEA[j])
              lMax = _SimulationData.gNeuronsDetails[_SingletonConfig.gSelectionIds[i]].DeSeEA[j];

            if (lMax < _SimulationData.gNeuronsDetails[_SingletonConfig.gSelectionIds[i]].DeSeIA[j])
              lMax = _SimulationData.gNeuronsDetails[_SingletonConfig.gSelectionIds[i]].DeSeIA[j];
          }
        break;
      case 1:
        for (var i = 0; i < _SingletonConfig.gSelectionIds.length; ++i)
          for (var j = 0; j < _SimulationData.gNeuronsDetails[_SingletonConfig.gSelectionIds[i]].AxSeV.length; ++j) {
            if (lMax < _SimulationData.gNeuronsDetails[_SingletonConfig.gSelectionIds[i]].AxSeV[j])
              lMax = _SimulationData.gNeuronsDetails[_SingletonConfig.gSelectionIds[i]].AxSeV[j];

            if (lMax < _SimulationData.gNeuronsDetails[_SingletonConfig.gSelectionIds[i]].DeSeEV[j])
              lMax = _SimulationData.gNeuronsDetails[_SingletonConfig.gSelectionIds[i]].DeSeEV[j];

            if (lMax < _SimulationData.gNeuronsDetails[_SingletonConfig.gSelectionIds[i]].DeSeIV[j])
              lMax = _SimulationData.gNeuronsDetails[_SingletonConfig.gSelectionIds[i]].DeSeIV[j];
          }
        break;
      case 2:
        for (var i = 0; i < _SingletonConfig.gSelectionIds.length; ++i)
          for (var j = 0; j < _SimulationData.gNeuronsDetails[_SingletonConfig.gSelectionIds[i]].AxSeC.length; ++j) {
            if (lMax < _SimulationData.gNeuronsDetails[_SingletonConfig.gSelectionIds[i]].AxSeC[j])
              lMax = _SimulationData.gNeuronsDetails[_SingletonConfig.gSelectionIds[i]].AxSeC[j];

            if (lMax < _SimulationData.gNeuronsDetails[_SingletonConfig.gSelectionIds[i]].DeSeEC[j])
              lMax = _SimulationData.gNeuronsDetails[_SingletonConfig.gSelectionIds[i]].DeSeEC[j];

            if (lMax < _SimulationData.gNeuronsDetails[_SingletonConfig.gSelectionIds[i]].DeSeIC[j])
              lMax = _SimulationData.gNeuronsDetails[_SingletonConfig.gSelectionIds[i]].DeSeIC[j];
          }
        break;
      default:
        break;
    }

    this.GlScale = d3.scale
      .linear()
      .domain([lMin, lMax])
      .range([this.minInnerRadius, this.outerRadius]);
  },

  arcTween: function (delay) {
    var myThis = this;

    return function () {
      d3.select(this)
        .transition()
        .delay(0)
        .attrTween("d", function (d) {
            var i = d3.interpolate(d.outerRadius, d.foo);
            return function (t) {
              d.outerRadius = i(t);
              return myThis.arc(d);
            };
          }
        );
    };
  },

  keyDown: function () {
    var self = _SimulationController.view;
    _SingletonConfig.shiftKey = d3.event.shiftKey || d3.event.metaKey;
    if (_SingletonConfig.shiftKey) {
      if (!_SimulationController.view.selecting) {
        self.scale = self.zoombehavior.scale();
        self.trans = self.zoombehavior.translate();
        _SimulationController.view.selecting = true;
        d3.select("g.brush").style("opacity", 0.4);
        self.zoombehavior.on("zoom", null);
        d3.select("svg").call(self.zoombehavior);
      }
    }
  },

  keyUp: function () {
    var self = _SimulationController.view;
    _SingletonConfig.shiftKey = d3.event.shiftKey || d3.event.metaKey;

    _SimulationController.view.selecting = false;
    d3.select("g.brush").style("opacity", 0.0);
    self.zoombehavior.scale(self.scale);
    self.zoombehavior.translate(self.trans);
    self.zoombehavior.on("zoom", self.zoomManager);
    d3.select("svg").call(self.zoombehavior);
    var neuronUnselected = _SingletonConfig.neuronSelected !== -1;
    if (d3.event.keyCode === 27) {
      _SingletonConfig.neuronSelected = -1;
      d3.selectAll("path").classed("selected", false);
      self.selectedMicro.forEach(function (i) {
        _SimulationData.gNeurons[i].previouslySelectedM = false;
        _SimulationData.gNeurons[i].selectedM = false;

      });
      self.selectedMicro = [];
      self.updateVisualization(true);
    }
    if (self.selectedMicro.length > 0 || neuronUnselected)
      self.updateVisualization(true);


  },

  zoomManager: function () {
    if (_SimulationController.view.semZoomActive) _SimulationController.view.zoomSemantic();
    else _SimulationController.view.zoom();
  },

  zoom: function () {
    if (!_SingletonConfig.shiftKey) {
      _SingletonConfig.svg.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
    }
  },

  zoomSemantic: function () {
    _SimulationController.view.shapes.attr("transform", _SimulationController.view.transform);
    _SimulationController.view.pies.attr("transform", _SimulationController.view.transform);
  },

  transformShapes: function (d) {
    return "translate(" + _SingletonConfig.xScale(_SimulationData.gNeurons[d].PosX) + "," + _SingletonConfig.yScale(_SimulationData.gNeurons[d].PosY) + ")";
  },

  transform: function (d, i) {
    return "translate(" + _SingletonConfig.xScale(_SimulationData.gNeurons[_SingletonConfig.gSelectionIds[i]].PosX) + ","
      + _SingletonConfig.yScale(_SimulationData.gNeurons[_SingletonConfig.gSelectionIds[i]].PosY) + ")";
  }
};
