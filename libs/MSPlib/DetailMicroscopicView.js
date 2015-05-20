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
	
	this.MSPViewType="DMicroV";	
};


MSP.DetailMicroscopicView.prototype = 
{	
	constructor: MSP.DetailMicroscopicView
		
	,generateDetailMicroscopicView  : function ()
	{		
		d3.select("svg")
			.remove();

		var self = this;
		this.zoombehavior = d3.behavior.zoom()
								.x(_SigletonConfig.xScale)
								.y(_SigletonConfig.yScale)
								.scaleExtent([1, 10])
								.on("zoom", self.zoom);
		
		_SigletonConfig.svg = d3.select("#renderArea")
								.append("svg")
								.attr("width", _SigletonConfig.width)
								.attr("height", _SigletonConfig.height)
								.attr("style", "outline: thin solid black;")
								.append("g")
								.attr("transform", "translate(" + _SigletonConfig.width/2 + "," + _SigletonConfig.height/2 + ")"													
													)								
								.call(self.zoombehavior)
								;
		//For zooming
		_SigletonConfig.svg
						.append("rect")
					    .attr("class", "overlay")
					    .attr("width", _SigletonConfig.width)
					    .attr("height", _SigletonConfig.height)
						.attr("transform", "translate(" + -_SigletonConfig.width/2 + "," + (-_SigletonConfig.height/2) + ")")																		    
					    .style("opacity","0.0")
					    ;
		
		
		
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
								                 	   )
											)
									.attr("transform", function(d) 
														{ 
															return "scale(2,2)";
														}
										)
									.style("fill", "rgb(255,255,255)")
									.style("stroke", function(d) 
													{
														if ((d.NAct == "E")) 	return _SigletonConfig.EColor;
														else					return _SigletonConfig.IColor;
													}
											)
								    .on("mouseover", function() 
													{
														var xPos = 50;
														var yPos = 50;
														
														var ENode = 0;
														var INode = 0;
														var ANode = 0;
														
														switch (_SigletonConfig.SEViewSelector) 
														{
															case 0:
																ENode = (_SimulationData.gNeurons[_SigletonConfig.neuronSelected].DeSeEA[_SimulationController.actSimStep]);
																INode = (_SimulationData.gNeurons[_SigletonConfig.neuronSelected].DeSeIA[_SimulationController.actSimStep]);
																ANode = (_SimulationData.gNeurons[_SigletonConfig.neuronSelected].AxSeA[_SimulationController.actSimStep]);				
																break;
															case 1:
																ENode = (_SimulationData.gNeurons[_SigletonConfig.neuronSelected].DeSeEV[_SimulationController.actSimStep]);
																INode = (_SimulationData.gNeurons[_SigletonConfig.neuronSelected].DeSeIV[_SimulationController.actSimStep]);
																ANode = (_SimulationData.gNeurons[_SigletonConfig.neuronSelected].AxSeV[_SimulationController.actSimStep]);				
																
																break;
															case 2:
																ENode = (_SimulationData.gNeurons[_SigletonConfig.neuronSelected].DeSeEC[_SimulationController.actSimStep]);
																INode = (_SimulationData.gNeurons[_SigletonConfig.neuronSelected].DeSeIC[_SimulationController.actSimStep]);
																ANode = (_SimulationData.gNeurons[_SigletonConfig.neuronSelected].AxSeC[_SimulationController.actSimStep]);								
																break;	
															default:
																break;
														}
																												
														d3.select("#tooltip")
															.style("left", xPos + "px")
															.style("top", yPos+ "px")
															.text(																	
																"CaC:" + _SimulationData.gNeurons[_SigletonConfig.neuronSelected].Calcium[_SimulationController.actSimStep]										
																+ " SE_E:" + ENode
																+ " SE_I:" + ANode
																+ " SE_A:" + INode
															);
														
														d3.select("#tooltip").classed("hidden",false);
														
													})
										.on("mouseout", function() 
													{															
														d3.select("#tooltip").classed("hidden",true);
													}
										);

		this.tree = d3.layout.cluster()
	    			.size([360, 240]);
		
		this.diagonal = d3.svg.diagonal
								.radial()
	    						.projection(function(d) { return [d.y, d.x / 180 * Math.PI]; });		
		
		this.root = {};
		this.root.parent 	= this.root;
		this.root.px 		= this.root.x;
		this.root.py 		= this.root.y;
		
		//Configure the fixed nodes E, I, Axonal
		var ENode 	= {id: 1};
		var INode 	= {id: 2};
		var AxNode 	= {id: 3};
		
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

		
		this.updateTree(this.root);
		this.updateVisualization();		
	}

	,updateTree:function (source)
	{
		var self = this;
		var duration = _SimulationController.UpdateVelocity;
		
		this.nodes = this.tree(self.root);
				
		var i = this.nodes.lenght;
		this.nodesRep = _SigletonConfig.svg
									.selectAll("g.node")
									.data(self.nodes, function(d) 
														{ 
															return d.id || (d.id = ++i); }
														);
		
		this.nodesRep.enter()
					.append("g")
					.attr("class", "node")
					.attr("transform", function(d) 
										{ 
											return "rotate(" + (source.x0 - 90) + ") translate(" + source.y0 + ")";
										}
						)
					.append("circle")
					.attr("r", 1e-6)
					.style("fill", function(d) { return d._children ? "lightsteelblue" : "#fff"; })
					.style("stroke-width", 0.0)
				    .on("mouseover", function(d) 
									{
										var xPos = 50;
										var yPos = 50;
										d3.select("#tooltip")
											.style("left", xPos + "px")
											.style("top", yPos+ "px")
											.text(																	
												"Id:" + d.id										
											);
										
										d3.select("#tooltip").classed("hidden",false);
										
									})
						.on("mouseout", function() 
									{															
										d3.select("#tooltip").classed("hidden",true);
									}
						);
				
		var nodeUpdate = this.nodesRep
							.transition()
							.duration(duration)
							.attr("transform", function(d) 
												{ 
													return "rotate(" + (d.x - 90) + ") translate(" + d.y + ")";
												}
								)
							;
							
		nodeUpdate.select("circle")
					.attr("r", function(d) 
							{ 
								return 5;
							}
						)
					.style("fill", function(d) 
									{ 
										var lColor="#000000";
										
										if (d.id>3)
										{
											switch (d.parent.id) 
											{										
												case 1:
													lColor= _SigletonConfig.EColor;
													break;
												case 2:													
						    						var lTmpColor;
													if (_SimulationData.gNeurons[_SigletonConfig.neuronSelected].NAct=="E") 	lTmpColor = new KolorWheel(_SigletonConfig.EColor).getRgb(); 
							    					else																		lTmpColor = new KolorWheel(_SigletonConfig.IColor).getRgb();

													axonalColor = "rgba("+lTmpColor[0] + "," + lTmpColor[1] +","+ lTmpColor[2]+", 0.5)" ;
													delete lTmpColor;
													
													lColor = axonalColor;																								
													break;
													
												case 3:
													lColor = _SigletonConfig.IColor;
													break;	
											}																						
										}										
										else if (d.id == 1) //Excitatory
										{
											lColor = _SigletonConfig.EColor;
										}
										else if (d.id == 2) //Axon
										{
				    						var lTmpColor;
											if (_SimulationData.gNeurons[_SigletonConfig.neuronSelected].NAct=="E") 	lTmpColor = new KolorWheel(_SigletonConfig.EColor).getRgb(); 
					    					else																		lTmpColor = new KolorWheel(_SigletonConfig.IColor).getRgb();

											axonalColor = "rgba("+lTmpColor[0] + "," + lTmpColor[1] +","+ lTmpColor[2]+", 0.5)" ;
											delete lTmpColor;
											
											lColor = axonalColor;											
										}
										else if (d.id == 3) //Inhibitory
										{
											lColor = _SigletonConfig.IColor;
										}
										else lColor = "rgb(0,0,0,0.5)";
										
										return lColor;
									}
						);
		
		var nodeExit = this.nodesRep
							.exit()
							.transition()
							.duration(duration)
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
																return d.target.id; 
															}
							);	      
		
		this.link.enter().insert("path", "g")
						.attr("class", "link")
						.attr("d", function(d) 
									{
										var o = {x: source.x0, y: source.y0};
										return self.diagonal({source: o, target: o});
									}
							);
		
		this.link.transition()
				.duration(duration)
				.attr("d", self.diagonal);
		
		this.link.exit().transition()
						.duration(duration)
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
		
		switch (_SigletonConfig.SEViewSelector) 
		{
			case 0:
					ENode = Math.round(_SimulationData.gNeurons[lId].DeSeEA[_SimulationController.actSimStep]);
					INode = Math.round(_SimulationData.gNeurons[lId].DeSeIA[_SimulationController.actSimStep]);
					ANode = Math.round(_SimulationData.gNeurons[lId].AxSeA[_SimulationController.actSimStep]);				
				break;
			case 1:
					ENode = Math.round(_SimulationData.gNeurons[lId].DeSeEV[_SimulationController.actSimStep]);
					INode = Math.round(_SimulationData.gNeurons[lId].DeSeIV[_SimulationController.actSimStep]);
					ANode = Math.round(_SimulationData.gNeurons[lId].AxSeV[_SimulationController.actSimStep]);								
				break;
			case 2:
					ENode = Math.round(_SimulationData.gNeurons[lId].DeSeEC[_SimulationController.actSimStep]);
					INode = Math.round(_SimulationData.gNeurons[lId].DeSeIC[_SimulationController.actSimStep]);
					ANode = Math.round(_SimulationData.gNeurons[lId].AxSeC[_SimulationController.actSimStep]);								
				break;	
			default:
				break;
		}
		
		this.recalculateChilds(1, ENode);
		this.recalculateChilds(2, ANode);		
		this.recalculateChilds(3, INode);
		
		this.updateCalcium();
		
		_SigletonConfig.svg.select(".rect").moveToFront();
	}
	
	,recalculateChilds: function(pParentId, pActNumChilds)
	{
		
		var p =undefined;
		var k=0;
		while (p==undefined)
		{
			if (this.nodes[k].id==pParentId)
				p = this.nodes[k];
			else ++k;
		}
		
		if (p.children)
		{
			var lNumEles = p.children.length;
			
			if (p.children.length<pActNumChilds)
			{
				for (var i=lNumEles;i<pActNumChilds;++i)
				{
					  var n = {id: this.usedIds++};
					  p.children.push(n); 
				}			
			}
			else
			{
				p.children = p.children.splice(0,pActNumChilds); 
			}
		}
		else			
		{	
			if (pActNumChilds!=0)
			{
				var n 		= {id: this.usedIds++};
				p.children 	= [n];
				this.nodes.push(n);			
			}
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
		this.soma.style("fill", function() 
		{
			if (_SimulationData.gNeurons[_SigletonConfig.neuronSelected].NAct=="E") 
			{																							
				var lVal = _SimulationData.CaEScale(_SimulationData.gNeurons[_SigletonConfig.neuronSelected].Calcium[_SimulationController.actSimStep]);
				return lVal;				
			} 
			else 
			{
				var lVal = _SimulationData.CaIScale(_SimulationData.gNeurons[_SigletonConfig.neuronSelected].Calcium[_SimulationController.actSimStep]);
				return lVal;				
			}
		});
		
		this.soma.moveToFront();
	}
};
