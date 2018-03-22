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

MSP.DetailMicroscopicView = function () {
  this.zoombehavior = 0;

  this.tree;
  this.diagonal;
  this.root;

  this.nodes;
  this.nodesRep;
  this.links;
  this.transition;

  this.usedIds = 0;
  this.soma = 0;

  this.MSPViewType = "DMicroV";
  this.graph;

  this.radialLayoutWidth;
  this.minDimension;
  this.radialLayoutMarginRatio = 0.02;
  this.figureSizeRatio = 0.18;
  this.figureSize;
  this.triangleRatio = 1; // 2:1 ratio between circle:triangle, to ensure same visual size
  this.circleRatio = 2;
  this.somaSizeRatio = 8;
  this.connParentSizeRatio = 5;
};


MSP.DetailMicroscopicView.prototype = {
  constructor: MSP.DetailMicroscopicView,

  resize: function () {
    this.generateDetailMicroscopicView();
  },

  generateDetailMicroscopicView: function (rootID) {
    _SingletonConfig.navBar = [];
    generateNav();

    d3.selectAll("svg").filter(function () {
      return !this.classList.contains('color')
    }).remove();

    d3.selectAll("canvas").filter(function () {
      return !this.classList.contains('imgCanvas')
    }).remove();

    var self = this;
    this.radialLayoutWidth = _SingletonConfig.width * 0.5;
    this.minDimension = Math.min(_SingletonConfig.height, this.radialLayoutWidth);
    this.figureSize = this.minDimension * this.figureSizeRatio;
    var radialLayoutDegree = 360;
    var radialLayoutRadius = (this.minDimension * 0.5) - this.minDimension * this.radialLayoutMarginRatio;


    this.zoombehavior = d3.behavior.zoom()
      .x(_SingletonConfig.xScale)
      .y(_SingletonConfig.yScale)
      .scaleExtent([-Infinity, Infinity])
      .on("zoom", self.zoom);


    this.graph = new MSP.GraphDetailMicroscopicView();
    this.graph.generateGraph();
    var svg = d3.select("#renderArea")
      .append("svg")
      .style("width", "50%")
      .attr("height", _SingletonConfig.height)
      .append("g")
      .attr("transform", "translate(" + this.radialLayoutWidth * 0.5 + "," + _SingletonConfig.height * 0.5 + ")"
      )
      .call(self.zoombehavior);


    //For zooming
    svg
      .append("rect")
      .attr("class", "overlay")
      .attr("width", this.radialLayoutWidth)
      .attr("height", _SingletonConfig.height)
      .attr("transform", "translate(" + -this.radialLayoutWidth * 0.5 + "," + (-_SingletonConfig.height * 0.5) + ")")
      .style("opacity", "0.0");

    _SingletonConfig.svg = svg.append("g")
      .attr("id", "contentViz");


    //Soma
    var lVect = [];
    lVect.push(_SimulationData.gNeurons[_SingletonConfig.neuronSelected]);

    this.soma = _SingletonConfig.svg
      .selectAll("soma")
      .data(lVect)
      .enter()
      .append("path")
      .attr("d", d3.svg.symbol()
        .type(function (d) {
            if (d.NAct == "E") return "triangle-up";
            else return "circle";
          }
        ).size(function (d) {
          if (d.NAct == "E") return self.figureSize * self.somaSizeRatio;
          else return self.figureSize * self.somaSizeRatio;
        })
      )
      .style("fill", "rgb(255,255,255)")
      .style("stroke-width", 2)
      .attr("stroke", "#000000")
      .on("mouseover", function () {
        var xPos = (_SingletonConfig.width * 0.5) + 50;
        var yPos = 50;

        var ENode = 0;
        var INode = 0;
        var ANode = 0;
        var lIndex = _SimulationController.actSimStep % _SimulationData.numSimStepsPerFile;

        switch (_SingletonConfig.SEViewSelector) {
          case 0:
            ENode = (_SimulationData.gNeuronsDetails[_SingletonConfig.neuronSelected].DeSeEA[lIndex]);
            INode = (_SimulationData.gNeuronsDetails[_SingletonConfig.neuronSelected].DeSeIA[lIndex]);
            ANode = (_SimulationData.gNeuronsDetails[_SingletonConfig.neuronSelected].AxSeA[lIndex]);
            break;
          case 1:
            ENode = (_SimulationData.gNeuronsDetails[_SingletonConfig.neuronSelected].DeSeEV[lIndex]);
            INode = (_SimulationData.gNeuronsDetails[_SingletonConfig.neuronSelected].DeSeIV[lIndex]);
            ANode = (_SimulationData.gNeuronsDetails[_SingletonConfig.neuronSelected].AxSeV[lIndex]);

            break;
          case 2:
            ENode = (_SimulationData.gNeuronsDetails[_SingletonConfig.neuronSelected].DeSeEC[lIndex]);
            INode = (_SimulationData.gNeuronsDetails[_SingletonConfig.neuronSelected].DeSeIC[lIndex]);
            ANode = (_SimulationData.gNeuronsDetails[_SingletonConfig.neuronSelected].AxSeC[lIndex]);
            break;
          default:
            break;
        }

        d3.select("#tooltip")
          .style("left", xPos + "px")
          .style("top", yPos + "px")
          .html(
            "Id: <b>" + _SingletonConfig.neuronSelected
            + "</b><br> CaC= <b>" + _SimulationData.gNeuronsDetails[_SingletonConfig.neuronSelected].Calcium[lIndex]
            + "</b><br>  SE_E: <b>" + ENode
            + "</b> SE_I: <b>" + INode
            + "</b> SE_A: <b>" + ANode + "</b>"
          );


        d3.select("#tooltip").classed("hidden", false);

      })
      .on("mouseout", function () {
          d3.select("#tooltip").classed("hidden", true);
        }
      );

    this.tree = d3.layout.cluster()
      .size([radialLayoutDegree, radialLayoutRadius]);

    this.diagonal = d3.svg.diagonal
      .radial()
      .projection(function (d) {
        return [d.y, d.x / 180 * Math.PI];
      });

    this.root = {};
    this.root.parent = this.root;
    this.root.px = this.root.x;
    this.root.py = this.root.y;

    //Configure the fixed nodes E, I, Axonal
    var ENode = {id: "Excitatory"};
    var INode = {id: "Inhibitory"};
    var AxNode = {id: "Axonal"};

    this.root.children = [ENode];
    this.root.children.push(AxNode);
    this.root.children.push(INode);

    this.usedIds = 4;

    this.nodes = this.tree(self.root);

    this.nodes.forEach(function (d) {
        d.x0 = d.x;
        d.y0 = d.y;
      }
    );


    this.updateVisualization();
  },

  updateTree: function (source) {
    var self = this;
    var duration = _SimulationController.UpdateVelocity;

    this.nodes = this.tree(self.root);

    this.nodesRep = _SingletonConfig.svg
      .selectAll("g.node")
      .data(self.nodes, function (d) {
          return d.uniqueID;
        }
      );

    this.nodesRep.enter()
      .append("g")
      .filter(function (d, i) {
        return i !== 0 && d.id !== "vacantNode"
      })
      .attr("class", "node")
      .attr("id", function (d) {
          return d.id;
        }
      )
      .attr("transform", function (d) {
          return "rotate(" + (source.x0 - 90) + ") translate(" + source.y0 + ")";
        }
      )
      .append("path")
      .attr("stroke", "#000000")
      .attr("stroke-width", 1)
      .attr("d", d3.svg.symbol()
        .type(function (d) {
            if (d.id === "Excitatory" || d.id === "Inhibitory" || d.id === "Axonal")
              return "circle";
            else if (_SimulationData.gNeurons[d.id].NAct == "E")
              return "triangle-up";
            else
              return "circle";
          }
        ).size(function (d) {
          if (d.id === "Excitatory" || d.id === "Inhibitory" || d.id === "Axonal")
            return self.figureSize * self.connParentSizeRatio;
          else if (_SimulationData.gNeurons[d.id].NAct == "E")
            return self.figureSize * self.triangleRatio;
          else
            return self.figureSize * self.circleRatio;
        })
      )
      .style("fill-opacity", function (d) {
        if (!isNaN(parseInt(d.id)))
          if (!_SimulationFilter.gNeuronsFilterB[d.id]) {
            return 0.1
          } else {
            return 1
          }
      })
      .style("fill", function (d) {
        var lColor = "#000000";
        var lIndex = _SimulationController.actSimStep % _SimulationData.numSimStepsPerFile;
        if (!isNaN(parseInt(d.id))) {

          if (!_SimulationFilter.gNeuronsFilterB[d.id]) {
            lColor = "#434343";
          } else if (_SimulationData.gNeurons[d.id].NAct === "E") {
            lColor = _SimulationData.CaEScale(_SimulationData.gNeuronsDetails[d.id].Calcium[lIndex]);

          } else {
            lColor = _SimulationData.CaIScale(_SimulationData.gNeuronsDetails[d.id].Calcium[lIndex]);

          }
        }
        else if (d.id == "Excitatory") //Excitatory
        {
          lColor = _SingletonConfig.EColor;
        }
        else if (d.id == "Axonal") //Axon
        {
          var lTmpColor;
          if (_SimulationData.gNeurons[_SingletonConfig.neuronSelected].NAct == "E") lTmpColor = new KolorWheel(_SingletonConfig.EColor).getRgb();
          else lTmpColor = new KolorWheel(_SingletonConfig.IColor).getRgb();

          axonalColor = _SingletonConfig.AColor;
          delete lTmpColor;

          lColor = axonalColor;
        }
        else if (d.id == "Inhibitory") //Inhibitory
        {
          lColor = _SingletonConfig.IColor;
        }
        else lColor = "rgb(0,0,0,0.5)";

        return lColor;
      })
      .on("mouseover", function (d) {
        var xPos = (_SingletonConfig.width * 0.5) + 50;
        var yPos = 50;

        if (d.id === "Excitatory" || d.id === "Inhibitory" || d.id === "Axonal") {
          d3.select("#tooltip")
            .style("left", xPos + "px")
            .style("top", yPos + "px")
            .html(function () {
                if (typeof d.children === "undefined")
                  return d.id + " <b>" + 0 + "</b> ";
                else
                  return d.id + "  <b>" + d.children.length + "</b> ";
              }
            );
        } else {

          var ENode = 0;
          var INode = 0;
          var ANode = 0;
          var lIndex = _SimulationController.actSimStep % _SimulationData.numSimStepsPerFile;

          switch (_SingletonConfig.SEViewSelector) {
            case 0:
              ENode = (_SimulationData.gNeuronsDetails[d.id].DeSeEA[lIndex]);
              INode = (_SimulationData.gNeuronsDetails[d.id].DeSeIA[lIndex]);
              ANode = (_SimulationData.gNeuronsDetails[d.id].AxSeA[lIndex]);
              break;
            case 1:
              ENode = (_SimulationData.gNeuronsDetails[d.id].DeSeEV[lIndex]);
              INode = (_SimulationData.gNeuronsDetails[d.id].DeSeIV[lIndex]);
              ANode = (_SimulationData.gNeuronsDetails[d.id].AxSeV[lIndex]);

              break;
            case 2:
              ENode = (_SimulationData.gNeuronsDetails[d.id].DeSeEC[lIndex]);
              INode = (_SimulationData.gNeuronsDetails[d.id].DeSeIC[lIndex]);
              ANode = (_SimulationData.gNeuronsDetails[d.id].AxSeC[lIndex]);
              break;
            default:
              break;
          }

          d3.select("#tooltip")
            .style("left", xPos + "px")
            .style("top", yPos + "px")
            .html(
              "Id: <b>" + d.id
              + "</b><br> CaC= <b>" + _SimulationData.gNeuronsDetails[d.id].Calcium[lIndex]
              + "</b><br>  SE_E: <b>" + ENode
              + "</b> SE_I: <b>" + INode
              + "</b> SE_A: <b>" + ANode + "</b>"
            );


        }
        d3.select("#tooltip").classed("hidden", false);
      })
      .on("mouseout", function () {
          d3.select("#tooltip").classed("hidden", true);
        }
      )
      .on("mousedown", function (d) {
        if (d.id !== "Excitatory" && d.id !== "Inhibitory" && d.id !== "Axonal")
          self.updateID(d.id)
      });

    var nodeUpdate = this.nodesRep
      .transition()
      .duration(duration - 40)
      .attr("transform", function (d) {
          return "rotate(" + (d.x - 90) + ") translate(" + d.y + ")";
        }
      )
    ;

    this.nodesRep.selectAll("path").style("fill-opacity", function (d) {
      if (!isNaN(parseInt(d.id)))
        if (!_SimulationFilter.gNeuronsFilterB[d.id]) {
          return 0.1
        } else {
          return 1
        }
    })
      .attr("stroke", "#000000")
      .attr("stroke-width", 1)
      .style("fill", function (d) {
        var lColor = "#000000";
        var lIndex = _SimulationController.actSimStep % _SimulationData.numSimStepsPerFile;
        if (!isNaN(parseInt(d.id))) {

          if (!_SimulationFilter.gNeuronsFilterB[d.id]) {
            lColor = "#434343";
          } else if (_SimulationData.gNeurons[d.id].NAct === "E") {
            lColor = _SimulationData.CaEScale(_SimulationData.gNeuronsDetails[d.id].Calcium[lIndex]);

          } else {
            lColor = _SimulationData.CaIScale(_SimulationData.gNeuronsDetails[d.id].Calcium[lIndex]);

          }

        }
        else if (d.id == "Excitatory") //Excitatory
        {
          lColor = _SingletonConfig.EColor;
        }
        else if (d.id == "Axonal") //Axon
        {
          var lTmpColor;
          if (_SimulationData.gNeurons[_SingletonConfig.neuronSelected].NAct == "E") lTmpColor = new KolorWheel(_SingletonConfig.EColor).getRgb();
          else lTmpColor = new KolorWheel(_SingletonConfig.IColor).getRgb();

          axonalColor = _SingletonConfig.AColor;
          delete lTmpColor;

          lColor = axonalColor;
        }
        else if (d.id == "Inhibitory") //Inhibitory
        {
          lColor = _SingletonConfig.IColor;
        }
        else lColor = "rgb(0,0,0,0.5)";

        return lColor;
      });


    var nodeExit = this.nodesRep
      .exit()
      .transition()
      .duration(duration - 40)
      .attr("transform", function (d) {
          return "translate(" + source.x + "," + source.y + ")";
        }
      )
      .remove();

    nodeExit.select("circle")
      .attr("r", 1e-6);

    this.link = _SingletonConfig.svg
      .selectAll("path.link")
      .data(self.tree.links(self.nodes), function (d) {
          return d.target.uniqueID;
        }
      )
      .attr("fill", "none")
      .attr("stroke", "#CCC")
      .attr("stroke-width", 2)
      .style("stroke-opacity", function (d) {
        if (!isNaN(parseInt(d.target.id)))
          if (!_SimulationFilter.gNeuronsFilterB[d.target.id]) {
            return 0.2
          } else {
            return 1
          }
      });

    this.link.enter().insert("path", "g")
      .attr("class", "link")
      .attr("d", function (d) {
          var o = {x: source.x0, y: source.y0};
          return self.diagonal({source: o, target: o});
        }
      )
      .attr("fill", "none")
      .attr("stroke", "#CCC")
      .attr("stroke-width", 2)
      .style("stroke-opacity", function (d) {
        if (!isNaN(parseInt(d.target.id)))
          if (!_SimulationFilter.gNeuronsFilterB[d.target.id]) {
            return 0.2
          } else {
            return 1
          }
      });

    this.link.transition()
      .duration(duration - 40)
      .attr("d", self.diagonal);

    this.link.exit().transition()
      .duration(duration - 40)
      .attr("d", function (d) {
          var o = {x: source.x, y: source.y};
          return self.diagonal({source: o, target: o});
        }
      )
      .remove();


    this.nodes.forEach(function (d) {
        d.x0 = d.x;
        d.y0 = d.y;
      }
    );
  },

  updateVisualization: function () {

    var lId = _SingletonConfig.neuronSelected;

    var ENode = 0;
    var INode = 0;
    var ANode = 0;
    var lIndex = _SimulationController.actSimStep % _SimulationData.numSimStepsPerFile;

    switch (_SingletonConfig.SEViewSelector) {
      case 0:
        ENode = Math.round(_SimulationData.gNeuronsDetails[lId].DeSeEA[lIndex]);
        INode = Math.round(_SimulationData.gNeuronsDetails[lId].DeSeIA[lIndex]);
        ANode = Math.round(_SimulationData.gNeuronsDetails[lId].AxSeA[lIndex]);
        break;
      case 1:
        ENode = Math.round(_SimulationData.gNeuronsDetails[lId].DeSeEV[lIndex]);
        INode = Math.round(_SimulationData.gNeuronsDetails[lId].DeSeIV[lIndex]);
        ANode = Math.round(_SimulationData.gNeuronsDetails[lId].AxSeV[lIndex]);
        break;
      case 2:
        ENode = Math.round(_SimulationData.gNeuronsDetails[lId].DeSeEC[lIndex]);
        INode = Math.round(_SimulationData.gNeuronsDetails[lId].DeSeIC[lIndex]);
        ANode = Math.round(_SimulationData.gNeuronsDetails[lId].AxSeC[lIndex]);
        break;
      default:
        break;
    }
    this.recalculateChilds("Excitatory", ENode);
    this.recalculateChilds("Inhibitory", INode);
    this.recalculateChilds("Axonal", ANode);
    this.graph.updateGraph();
    this.updateCalcium();

    _SingletonConfig.svg.select(".rect").moveToFront();


  },

  recalculateChilds: function (pParentId, pActNumChilds) {
    var lId = parseInt(_SingletonConfig.neuronSelected);
    var p = undefined;
    var k = 0;
    while (p === undefined) {
      if (this.nodes[k].id === pParentId)
        p = this.nodes[k];
      else ++k;
    }
    var idsList = [];
    var ids = [];
    this.nodes[k]["uniqueID"] = pParentId;
    if (_SingletonConfig.SEViewSelector !== 1) {
      if (pParentId === "Axonal") {
        if (typeof (_SimulationData.gConnectivity.EI[_SimulationData.steps[_SimulationController.actSimStep]]) !== "undefined")
          _SimulationData.gConnectivity.EI[_SimulationData.steps[_SimulationController.actSimStep]].forEach(
            function (d) {
              if (d[0] === lId) idsList.push(d[1])
            });
        if (typeof (_SimulationData.gConnectivity.EE[_SimulationData.steps[_SimulationController.actSimStep]]) !== "undefined")
          _SimulationData.gConnectivity.EE[_SimulationData.steps[_SimulationController.actSimStep]].forEach(
            function (d) {
              if (d[0] === lId) idsList.push(d[1])
            });

        if (typeof (_SimulationData.gConnectivity.IE[_SimulationData.steps[_SimulationController.actSimStep]]) !== "undefined")
          _SimulationData.gConnectivity.IE[_SimulationData.steps[_SimulationController.actSimStep]].forEach(
            function (d) {
              if (d[0] === lId) idsList.push(d[1])
            });
        if (typeof (_SimulationData.gConnectivity.II[_SimulationData.steps[_SimulationController.actSimStep]]) !== "undefined")
          _SimulationData.gConnectivity.II[_SimulationData.steps[_SimulationController.actSimStep]].forEach(
            function (d) {
              if (d[0] === lId) idsList.push(d[1])
            });

      }
      else if (pParentId === "Inhibitory") {

        if (typeof (_SimulationData.gConnectivity.IE[_SimulationData.steps[_SimulationController.actSimStep]]) !== "undefined")
          _SimulationData.gConnectivity.IE[_SimulationData.steps[_SimulationController.actSimStep]].forEach(
            function (d) {
              if (d[1] === lId) idsList.push(d[0])
            });
        if (typeof (_SimulationData.gConnectivity.II[_SimulationData.steps[_SimulationController.actSimStep]]) !== "undefined")
          _SimulationData.gConnectivity.II[_SimulationData.steps[_SimulationController.actSimStep]].forEach(
            function (d) {
              if (d[1] === lId) idsList.push(d[0])
            });
      }
      else {

        if (typeof (_SimulationData.gConnectivity.EI[_SimulationData.steps[_SimulationController.actSimStep]]) !== "undefined")
          _SimulationData.gConnectivity.EI[_SimulationData.steps[_SimulationController.actSimStep]].forEach(
            function (d) {
              if (d[1] === lId) idsList.push(d[0])
            });
        if (typeof (_SimulationData.gConnectivity.EE[_SimulationData.steps[_SimulationController.actSimStep]]) !== "undefined")
          _SimulationData.gConnectivity.EE[_SimulationData.steps[_SimulationController.actSimStep]].forEach(
            function (d) {
              if (d[1] === lId) idsList.push(d[0])
            });
      }


      idsList.sort(function (c1, c2) {
        return _SimulationData.gNeurons[c1].index < _SimulationData.gNeurons[c2].index ? -1 : 1;
      });

      var uniqueID = [];
      for (var i = 0; i < idsList.length; i++) {
        if (typeof uniqueID["node" + idsList[i]] === 'undefined') {
          uniqueID["node" + idsList[i]] = 0;
          ids.push(pParentId + " " + idsList[i] + " " + uniqueID["node" + idsList[i]]);
        }
        else {
          uniqueID["node" + idsList[i]] += 1;
          ids.push(pParentId + " " + idsList[i] + " " + uniqueID["node" + idsList[i]]);
        }
      }
    }

    for (var i = idsList.length; i < pActNumChilds; i++) {
      idsList.push("vacantNode");
      ids.push(pParentId + " vacantNode " + i);
    }

    p.children = [];
    for (var i = 0; i < idsList.length; i++) {
      p.children.push({id: idsList[i], uniqueID: ids[i]});
    }

    this.updateTree(this.nodes[k]);
  },

  zoom: function () {
    _SingletonConfig.svg.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
  },

  collapse: function (d) {
    if (d.children) {
      d._children = d.children;
      d._children.forEach(collapse);
      d.children = null;
    }
  },

  updateCalcium: function () {
    var lIndex = _SimulationController.actSimStep % _SimulationData.numSimStepsPerFile;
    this.soma.style("fill", function () {
      if (!_SimulationFilter.gNeuronsFilterB[_SingletonConfig.neuronSelected]) {
        return "#434343";
      }
      if (_SimulationData.gNeurons[_SingletonConfig.neuronSelected].NAct == "E") {
        var lVal = _SimulationData.CaEScale(_SimulationData.gNeuronsDetails[_SingletonConfig.neuronSelected].Calcium[lIndex]);
        return lVal;
      }
      else {
        var lVal = _SimulationData.CaIScale(_SimulationData.gNeuronsDetails[_SingletonConfig.neuronSelected].Calcium[lIndex]);
        return lVal;
      }
    });

    this.soma.moveToFront();
  },

  updateID: function (id) {
    this.nodes[0].id = id;
    _SingletonConfig.neuronSelected = id;
    this.graph.generateGraph();
    this.generateDetailMicroscopicView(id);
  }
};
