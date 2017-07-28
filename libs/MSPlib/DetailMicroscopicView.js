/**
 * @brief
 * @author  Juan Pedro Brito Mendez <juanpebm@gmail.com>
 * @date
 * @remarks Do not distribute without further notice.
 */

MSP.DetailMicroscopicView = function ()
{
    this.zoombehavior =0;

    this.tree;
    this.diagonal;
    this.root;

    this.nodes;
    this.nodesRep;
    this.links;
    this.linksRep;

    this.transition;
    this.usedIds=0;;

    this.soma = 0;
    margin = {top: 0, right: 0, bottom: 600, left: 1600};
    margin2 = {top: 400, right: 0, bottom: 200, left: 1600};
    this.MSPViewType="DMicroV";
    this.graph;
    this.width;
    this.height;
};


MSP.DetailMicroscopicView.prototype =
    {
        constructor: MSP.DetailMicroscopicView

        ,resize : function()
    {
        this.generateDetailMicroscopicView();
    },generateDetailMicroscopicView  : function (rootID)
    {
        _SigletonConfig.navBar = [];
        generateNav();

        d3.selectAll("svg").filter(function() {
            return !this.classList.contains('color')
        }).remove();

        d3.selectAll("canvas").filter(function() {
            return !this.classList.contains('imgCanvas')
        }).remove();

        this.width = _SigletonConfig.width*50/100;
        var self = this;
        this.zoombehavior = d3.behavior.zoom()
            .x(_SigletonConfig.xScale)
            .y(_SigletonConfig.yScale)
            .scaleExtent([-Infinity, Infinity])
            .on("zoom", self.zoom);


        this.graph = new MSP.GraphDetailMicroscopicView();
        this.graph.generateGraph();
        _SigletonConfig.svg = d3.select("#renderArea")
            .append("svg")
            .style("width","50%")
            .attr("height", _SigletonConfig.height)
            .append("g")
            .attr("transform", "translate(" + this.width/2 + "," + _SigletonConfig.height/2 + ")"
            )
            .call(self.zoombehavior)
            .append("g");



        //For zooming
        _SigletonConfig.svg
            .append("rect")
            .attr("class", "overlay")
            .attr("width", this.width)
            .attr("height", _SigletonConfig.height)
            .attr("transform", "translate(" + -this.width/2 + "," + (-_SigletonConfig.height/2) + ")")
            .style("opacity","0.0");



        //Soma
        var lVect = [];
        lVect.push(_SimulationData.gNeurons[_SigletonConfig.neuronSelected]);

        this.soma = _SigletonConfig.svg
            .selectAll("soma")
            .data(lVect)
            .enter()
            .append("path")
            .attr("d", d3.svg.symbol()
                .type(function(d)
                    {
                        if (d.NAct == "E")	return "triangle-up";
                        else				return "circle";
                    }
                ).size(function(d)
                {
                    if (d.NAct == "E")	return 100;
                    else				return 136;
                })
            )
            .attr("transform", function(d)
                {
                    return "scale(2,2)";
                }
            )
            .style("fill", "rgb(255,255,255)")
            .style("stroke-width", 1.0
            )
            .on("mouseover", function()
            {
                var xPos = (_SigletonConfig.width/2)+50;
                var yPos = 50;

                var ENode = 0;
                var INode = 0;
                var ANode = 0;
                var lIndex = _SimulationController.actSimStep % _SimulationData.numSimStepsPerFile;

                switch (_SigletonConfig.SEViewSelector)
                {
                    case 0:
                        ENode = (_SimulationData.gNeuronsDetails[_SigletonConfig.neuronSelected].DeSeEA[lIndex]);
                        INode = (_SimulationData.gNeuronsDetails[_SigletonConfig.neuronSelected].DeSeIA[lIndex]);
                        ANode = (_SimulationData.gNeuronsDetails[_SigletonConfig.neuronSelected].AxSeA[lIndex]);
                        break;
                    case 1:
                        ENode = (_SimulationData.gNeuronsDetails[_SigletonConfig.neuronSelected].DeSeEV[lIndex]);
                        INode = (_SimulationData.gNeuronsDetails[_SigletonConfig.neuronSelected].DeSeIV[lIndex]);
                        ANode = (_SimulationData.gNeuronsDetails[_SigletonConfig.neuronSelected].AxSeV[lIndex]);

                        break;
                    case 2:
                        ENode = (_SimulationData.gNeuronsDetails[_SigletonConfig.neuronSelected].DeSeEC[lIndex]);
                        INode = (_SimulationData.gNeuronsDetails[_SigletonConfig.neuronSelected].DeSeIC[lIndex]);
                        ANode = (_SimulationData.gNeuronsDetails[_SigletonConfig.neuronSelected].AxSeC[lIndex]);
                        break;
                    default:
                        break;
                }

                d3.select("#tooltip")
                    .style("left", xPos + "px")
                    .style("top", yPos+ "px")
                    .html(
                        "Id: <b>" + _SigletonConfig.neuronSelected
                        +"</b><br> CaC= <b>" + _SimulationData.gNeuronsDetails[_SigletonConfig.neuronSelected].Calcium[lIndex]
                        + "</b><br>  SE_E: <b>" + ENode
                        + "</b> SE_I: <b>" + INode
                        + "</b> SE_A: <b>" + ANode+"</b>"
                    );


                d3.select("#tooltip").classed("hidden",false);

            })
            .on("mouseout", function()
                {
                    d3.select("#tooltip").classed("hidden",true);
                }
            );

        this.tree = d3.layout.cluster()
            .size([360, 340]);

        this.diagonal = d3.svg.diagonal
            .radial()
            .projection(function(d) { return [d.y, d.x / 180 * Math.PI]; });

        this.root = {};
        this.root.parent 	= this.root;
        this.root.px 		= this.root.x;
        this.root.py 		= this.root.y;

        //Configure the fixed nodes E, I, Axonal
        var ENode 	= {id: "Excitatory"};
        var INode 	= {id: "Inhibitory"};
        var AxNode 	= {id: "Axonal"};

        this.root.children = [ENode];
        this.root.children.push(INode);
        this.root.children.push(AxNode);

        this.usedIds=4;

        this.nodes = this.tree(self.root);

        this.nodes.forEach(function(d)
            {
                d.x0 = d.x;
                d.y0 = d.y;
            }
        );



        this.updateVisualization();
    }

        ,updateTree:function (source)
    {
        var self = this;
        var duration = _SimulationController.UpdateVelocity;

        this.nodes = this.tree(self.root);
        /*            .sort(function(a, b) {
         if(a.depth<2 || b.depth<2) return 0;
         var lIndex = _SimulationController.actSimStep % _SimulationData.numSimStepsPerFile;
         var cal1 = _SimulationData.gNeuronsDetails[a.id].Calcium[lIndex];
         var cal2 = _SimulationData.gNeuronsDetails[b.id].Calcium[lIndex];
         return d3.ascending(cal1,cal2);
         });*/
        var i = 0;
        this.nodesRep = _SigletonConfig.svg
            .selectAll("g.node")
            .data(self.nodes, function(d)
                {
                    return d.uniqueID;
                }
            );

        this.nodesRep.enter()
            .append("g")
            .filter(function(d,i){return i!==0})
            .attr("class", "node")
            .attr("id", function(d)
                {
                    return d.id;
                }
            )
            .attr("transform", function(d)
                {
                    return "rotate(" + (source.x0 - 90) + ") translate(" + source.y0 + ")";
                }
            )
            .append("path")
            .attr("d", d3.svg.symbol()
                .type(function(d)
                    {
                        if(d.id ==="Excitatory" || d.id ==="Inhibitory" ||d.id ==="Axonal")
                            return "circle";
                        else if (_SimulationData.gNeurons[d.id].NAct == "E")	return "triangle-up";
                        else				return "circle";
                    }
                ).size(function(d)
                {
                    if(d.id ==="Excitatory" || d.id ==="Inhibitory" ||d.id ==="Axonal")
                        return 300;
                    else  if (_SimulationData.gNeurons[d.id].NAct == "E")	return 100;
                    else				return 136;
                })
            )
            .style("fill-opacity",function (d) {
                if(!isNaN(parseInt(d.id)))
                    if(!_SimulationFilter.gNeuronsFilterB[d.id] ) {
                        return 0.1
                    }else{
                        return 1
                    }
            })
            .style("fill", function(d) {
                var lColor = "#000000";
                var lIndex = _SimulationController.actSimStep % _SimulationData.numSimStepsPerFile;
                if (!isNaN(parseInt(d.id))) {

                    if(!_SimulationFilter.gNeuronsFilterB[d.id]) {
                        lColor =  "#434343";
                    } else if (_SimulationData.gNeurons[d.id].NAct === "E") {
                        lColor = _SimulationData.CaEScale(_SimulationData.gNeuronsDetails[d.id].Calcium[lIndex]);

                    } else {
                        lColor = _SimulationData.CaIScale(_SimulationData.gNeuronsDetails[d.id].Calcium[lIndex]);

                    }


                    /*              switch (d.parent.id)
                     {
                     case "Excitatory":
                     lColor= _SigletonConfig.EColor;
                     break;
                     case "Inhibitory":
                     var lTmpColor;
                     if (_SimulationData.gNeurons[_SigletonConfig.neuronSelected].NAct=="E") 	lTmpColor = new KolorWheel(_SigletonConfig.EColor).getRgb();
                     else																		lTmpColor = new KolorWheel(_SigletonConfig.IColor).getRgb();

                     axonalColor = "rgba("+lTmpColor[0] + "," + lTmpColor[1] +","+ lTmpColor[2]+", 0.5)" ;
                     delete lTmpColor;

                     lColor = axonalColor;
                     break;

                     case "Axonal":
                     lColor = _SigletonConfig.IColor;
                     break;
                     }*/
                }
                else if (d.id == "Excitatory") //Excitatory
                {
                    lColor = _SigletonConfig.EColor;
                }
                else if (d.id == "Axonal") //Axon
                {
                    var lTmpColor;
                    if (_SimulationData.gNeurons[_SigletonConfig.neuronSelected].NAct == "E") lTmpColor = new KolorWheel(_SigletonConfig.EColor).getRgb();
                    else                                                                        lTmpColor = new KolorWheel(_SigletonConfig.IColor).getRgb();

                    axonalColor = _SigletonConfig.AColor;
                    delete lTmpColor;

                    lColor = axonalColor;
                }
                else if (d.id == "Inhibitory") //Inhibitory
                {
                    lColor = _SigletonConfig.IColor;
                }
                else lColor = "rgb(0,0,0,0.5)";

                return lColor;
            })
            .style("stroke-width", 1.0)
            .on("mouseover", function(d)
            {
                var xPos = (_SigletonConfig.width/2)+50;
                var yPos = 50;

                if(d.id ==="Excitatory" || d.id ==="Inhibitory" ||d.id ==="Axonal"){
                    d3.select("#tooltip")
                        .style("left", xPos + "px")
                        .style("top", yPos + "px")
                        .html(function() {
                                if( typeof d.children === "undefined")
                                    return d.id + " <b>" + 0 +"</b> ";
                                else
                                    return d.id + "  <b>" + d.children.length+"</b> ";
                            }
                        );
                }else {

                    var ENode = 0;
                    var INode = 0;
                    var ANode = 0;
                    var lIndex = _SimulationController.actSimStep % _SimulationData.numSimStepsPerFile;

                    switch (_SigletonConfig.SEViewSelector) {
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
                            "Id: <b>" +  d.id
                            +"</b><br> CaC= <b>" + _SimulationData.gNeuronsDetails[d.id].Calcium[lIndex]
                            + "</b><br>  SE_E: <b>" + ENode
                            + "</b> SE_I: <b>" + INode
                            + "</b> SE_A: <b>" + ANode+"</b>"
                        );


                }
                d3.select("#tooltip").classed("hidden", false);
            })
            .on("mouseout", function()
                {
                    d3.select("#tooltip").classed("hidden",true);
                }
            ).on("mousedown",function(d){
            self.updateID(d.id)
        });

        var nodeUpdate = this.nodesRep
            .transition()
            .duration(duration-40)
            .attr("transform", function(d)
                {
                    return "rotate(" + (d.x - 90) + ") translate(" + d.y + ")";
                }
            )
        ;

        this.nodesRep.selectAll("path").style("fill-opacity",function (d) {
            if(!isNaN(parseInt(d.id)))
                if(!_SimulationFilter.gNeuronsFilterB[d.id] ) {
                    return 0.1
                }else{
                    return 1
                }
        })
            .style("fill", function(d) {
                var lColor = "#000000";
                var lIndex = _SimulationController.actSimStep % _SimulationData.numSimStepsPerFile;
                if (!isNaN(parseInt(d.id))) {

                    if(!_SimulationFilter.gNeuronsFilterB[d.id]) {
                        lColor =  "#434343";
                    } else if (_SimulationData.gNeurons[d.id].NAct === "E") {
                        lColor = _SimulationData.CaEScale(_SimulationData.gNeuronsDetails[d.id].Calcium[lIndex]);

                    } else {
                        lColor = _SimulationData.CaIScale(_SimulationData.gNeuronsDetails[d.id].Calcium[lIndex]);

                    }

                }
                else if (d.id == "Excitatory") //Excitatory
                {
                    lColor = _SigletonConfig.EColor;
                }
                else if (d.id == "Axonal") //Axon
                {
                    var lTmpColor;
                    if (_SimulationData.gNeurons[_SigletonConfig.neuronSelected].NAct == "E") lTmpColor = new KolorWheel(_SigletonConfig.EColor).getRgb();
                    else                                                                        lTmpColor = new KolorWheel(_SigletonConfig.IColor).getRgb();

                    axonalColor = _SigletonConfig.AColor;
                    delete lTmpColor;

                    lColor = axonalColor;
                }
                else if (d.id == "Inhibitory") //Inhibitory
                {
                    lColor = _SigletonConfig.IColor;
                }
                else lColor = "rgb(0,0,0,0.5)";

                return lColor;
            });



        var nodeExit = this.nodesRep
            .exit()
            .transition()
            .duration(duration-40)
            .attr("transform", function(d)
                {
                    return "translate(" + source.x + "," + source.y + ")";
                }
            )
            .remove();

        nodeExit.select("circle")
            .attr("r", 1e-6);

        this.link = _SigletonConfig.svg
            .selectAll("path.link")
            .data(self.tree.links(self.nodes), function(d)
                {
                    return d.target.uniqueID;
                }
            ).style("stroke-opacity",function (d) {
                if(!isNaN(parseInt(d.target.id)))
                    if(!_SimulationFilter.gNeuronsFilterB[d.target.id] ) {
                        return 0.2
                    }else{
                        return 1
                    }
            });

        this.link.enter().insert("path", "g")
            .attr("class", "link")
            .attr("d", function(d)
                {
                    var o = {x: source.x0, y: source.y0};
                    return self.diagonal({source: o, target: o});
                }
            ).style("stroke-opacity",function (d) {
            if(!isNaN(parseInt(d.target.id)))
                if(!_SimulationFilter.gNeuronsFilterB[d.target.id] ) {
                    return 0.2
                }else{
                    return 1
                }
        });

        this.link.transition()
            .duration(duration-40)
            .attr("d", self.diagonal);

        this.link.exit().transition()
            .duration(duration-40)
            .attr("d", function(d)
                {
                    var o = {x: source.x, y: source.y};
                    return self.diagonal({source: o, target: o});
                }
            )
            .remove();


        this.nodes.forEach(function(d)
            {
                d.x0 = d.x;
                d.y0 = d.y;
            }
        );
    }

        ,updateVisualization: function ()
    {

        var lId = _SigletonConfig.neuronSelected;

        var ENode = 0;
        var INode = 0;
        var ANode = 0;
        var lIndex = _SimulationController.actSimStep % _SimulationData.numSimStepsPerFile;

        switch (_SigletonConfig.SEViewSelector)
        {
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
        this.recalculateChilds("Inhibitory", ANode);
        this.recalculateChilds("Axonal", INode);
        this.graph.updateGraph();
        this.updateCalcium();

        _SigletonConfig.svg.select(".rect").moveToFront();


    }

        ,recalculateChilds: function(pParentId, pActNumChilds)
    {
        var lId = parseInt(_SigletonConfig.neuronSelected);
        var p =undefined;
        var k=0;
        while (p===undefined)
        {
            if (this.nodes[k].id===pParentId)
                p = this.nodes[k];
            else ++k;
        }
        var idsList=[];
        this.nodes[k]["uniqueID"] = pParentId;

        if(pParentId ==="Axonal") {
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
        else    if(pParentId ==="Inhibitory"){

            if (typeof (_SimulationData.gConnectivity.IE[_SimulationData.steps[_SimulationController.actSimStep]]) !== "undefined")
                _SimulationData.gConnectivity.IE[_SimulationData.steps[_SimulationController.actSimStep]].forEach(
                    function (d) {
                        if (d[1] === lId) idsList.push(d[0])
                    });
            if( typeof (_SimulationData.gConnectivity.II[_SimulationData.steps[_SimulationController.actSimStep]]) !== "undefined")
                _SimulationData.gConnectivity.II[_SimulationData.steps[_SimulationController.actSimStep]].forEach(
                    function(d){ if(d[1]===lId) idsList.push(d[0])});
        }
        else {

            if( typeof (_SimulationData.gConnectivity.EI[_SimulationData.steps[_SimulationController.actSimStep]]) !== "undefined")
                _SimulationData.gConnectivity.EI[_SimulationData.steps[_SimulationController.actSimStep]].forEach(
                    function(d){ if(d[1]===lId) idsList.push(d[0])});
            if (typeof (_SimulationData.gConnectivity.EE[_SimulationData.steps[_SimulationController.actSimStep]]) !== "undefined")
                _SimulationData.gConnectivity.EE[_SimulationData.steps[_SimulationController.actSimStep]].forEach(
                    function (d) {
                        if (d[1] === lId) idsList.push(d[0])
                    });
        }


        idsList.sort(function(c1, c2) {
            return _SimulationData.gNeurons[c1].index < _SimulationData.gNeurons[c2].index ? -1 : 1;
        });
        var uniqueID = [];
        var ids =[];
        for(var i=0;i<idsList.length;i++) {
            if( typeof uniqueID["node"+idsList[i]] === 'undefined' ){
                uniqueID["node"+idsList[i]] = 0;
                ids.push(pParentId+" "+idsList[i]+" "+uniqueID["node"+idsList[i]]);
            }
            else{
                uniqueID["node"+idsList[i]]+=1;
                ids.push(pParentId+" "+idsList[i]+" "+uniqueID["node"+idsList[i]]);
            }
        }

        p.children=[];
        for (var i=0;i<idsList.length;i++) {
            p.children.push({id: idsList[i], uniqueID: ids[i]});
        }

        this.updateTree(this.nodes[k]);
    }


        ,zoom: function ()
    {
        _SigletonConfig.svg.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
    }

        ,collapse: function(d)
    {
        if (d.children)
        {
            d._children = d.children;
            d._children.forEach(collapse);
            d.children = null;
        }
    }

        ,updateCalcium: function ()
    {
        var lIndex = _SimulationController.actSimStep % _SimulationData.numSimStepsPerFile;
        this.soma.style("fill", function()
        {
            if(!_SimulationFilter.gNeuronsFilterB[_SigletonConfig.neuronSelected]) {
                return  "#434343";
            }
            if (_SimulationData.gNeurons[_SigletonConfig.neuronSelected].NAct=="E")
            {
                var lVal = _SimulationData.CaEScale(_SimulationData.gNeuronsDetails[_SigletonConfig.neuronSelected].Calcium[lIndex]);
                return lVal;
            }
            else
            {
                var lVal = _SimulationData.CaIScale(_SimulationData.gNeuronsDetails[_SigletonConfig.neuronSelected].Calcium[lIndex]);
                return lVal;
            }
        });

        this.soma.moveToFront();
    },updateID: function(id) {
        this.nodes[0].id = id;
        _SigletonConfig.neuronSelected = id;
        this.graph.generateGraph();
        this.generateDetailMicroscopicView(id);
        //   this.updateVisualization();
    }
    };
