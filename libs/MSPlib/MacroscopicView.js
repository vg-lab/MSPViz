
MSP.MacroscopicView = function ()
{	
	this.gConnectLoaded	=	false;
		
	this.selecting 		= 	false;
	
	this.brush;
	this.zoombehavior;
	
	this.EEconnectGroup;
	this.EIconnectGroup;
	this.IEconnectGroup;
	this.IIconnectGroup;
	
	this.MSPViewType="MacroV";	
};

MSP.MacroscopicView.prototype = 
{	
	constructor: MSP.MacroscopicView
		
	,generateMacroscopicView :function () 
	{
		_SigletonConfig.gSelectionIds=[];
		
		d3.select("svg")
			.remove();
		
		var self=this;
		
		this.zoombehavior = d3.behavior.zoom()
								.x(_SigletonConfig.zoomXScale)
								.y(_SigletonConfig.zoomYScale)
								.scaleExtent([1, 10])
								.on("zoom", self.zoom);
		
		_SigletonConfig.svg = d3.select("#renderArea")
							    .attr("tabindex", 1)							    
							    .on("keydown.brush", this.keyDown)
							    .on("keyup.brush", this.keyUp)
							    .each(function()
							    		{ 
							    			this.focus(); 
							    		}
							    	)
									.append("svg")
										.attr("width", _SigletonConfig.width)
										.attr("height", _SigletonConfig.height)
										.attr("style", "outline: thin solid black;")
										.append("g")
										.call(self.zoombehavior)
										;
		
		_SigletonConfig.svg
						.append("g")
						.attr("class", "EEconnects");		

		_SigletonConfig.svg
						.append("g")
						.attr("class", "EIconnects");		

		_SigletonConfig.svg
						.append("g")
						.attr("class", "IEconnects");		

		_SigletonConfig.svg
						.append("g")
						.attr("class", "IIconnects");		
		
		//For zooming
		_SigletonConfig.svg
						.append("rect")
					    .attr("class", "overlay")
					    .attr("width", _SigletonConfig.width)
					    .attr("height", _SigletonConfig.height)
					    .style("opacity","0.0")
					    ;		
		
		//Create the neuronsrep
		_SimulationData.gNeuronsRep = _SigletonConfig.svg
															.attr("class", "node")
												  			.selectAll("path")					  			
															.data(_SimulationData.gNeurons)
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
																					return "translate(" + d.PosX + "," + d.PosY + ")";
																				}
																)
															.style("fill", "rgb(255,255,255)")
															.style("stroke", function(d) 
																			{
																				if ((d.NAct == "E")) 	return _SigletonConfig.EColor;
																				else					return _SigletonConfig.IColor;
																			}
																	)
															.on("mousedown", function(d) 
																			 {
																				if (_SimulationController.view.selecting)
																				{
																					d3.select(this).classed("selected", d.selected = !d.selected);
																				}
																				else
																				{
																					_SimulationData.gNeuronsRep.classed("selected", function(p)
																							{ 
																								return p.selected = false;
																							});																																																																													
																				}
																				
																			 }
												  				)
																.on("mouseup", function(d) 
																			 {
																				if (d.selected) 
																				{
																					_SigletonConfig.gSelectionIds.push(d.NId);
																				}
																				else
																				{
																					removeA(_SigletonConfig.gSelectionIds,d.NId);
																				}
																			 }
												  				)
																	
																.on("mouseover", function(d) 
																				{																																						
																					var xPos = d.PosX + 50;
																					var yPos = d.PosY;

																					d3.select("#tooltip")
																						.style("left", xPos + "px")
																						.style("top", yPos+ "px")
																						.text(
																								"Id:" + d.NId
																								+ " CaC=" + d.Calcium[_SimulationController.actSimStep]
																							
																						);
																					
																					d3.select("#tooltip").classed("hidden",false);
																					
																				})
																	.on("mouseout", function() 
																				{
																					d3.select("#tooltip").classed("hidden",true);
																				}
																)
																;
		
			_SigletonConfig.svg
				.append("svg:defs")
				.append("svg:marker")
				.attr("id", "arrowend")				//Identificador
				.attr("viewBox", "0 0 40 10") 		//Dimensiones del rectangulo de pintado (punto inicial, ancho y alto)
				.attr("refX", 50)					//Desplayamiento en X, q es en el eje en el que se ha definido.				
				.attr("refY", 5)					//Desplayamiento en Y, e snecesario 5 unidades ya que no se ha centrado en el 00, sino en el 0,5
				.attr("markerUnits", "strokeWidth") //Define las coordenadas para  markerWidth y markerHeight 
				.attr("markerWidth",  20)			//Represents the width of the viewport into which the marker is to be fitted when it is rendered.
				.attr("markerHeight", 8)			//Represents the height of the viewport into which the marker is to be fitted when it is rendered.
				.attr("orient", "auto")
				.append("svg:path")
				.attr("d","M 0 0 L 40 5 L 0 10 z")				
				.attr("fill", "#BBBBBB")
				;				
		
			_SigletonConfig.svg
				.append("svg:defs")
				.append("svg:marker")
				.attr("id", "arrowstart")			//Identificador
				.attr("viewBox", "0 0 10 10") 		//Dimensiones del rectangulo de pintado (punto inicial, ancho y alto)
				.attr("refX", -10)					//Desplayamiento en X, q es en el eje en el que se ha definido.				
				.attr("refY", 5)					//Desplayamiento en Y, e snecesario 5 unidades ya que no se ha centrado en el 00, sino en el 0,5
				.attr("markerUnits", "strokeWidth") //Define las coordenadas para  markerWidth y markerHeight 
				.attr("markerWidth",  20)			//Represents the width of the viewport into which the marker is to be fitted when it is rendered.
				.attr("markerHeight", 8)			//Represents the height of the viewport into which the marker is to be fitted when it is rendered.
				.attr("orient", "auto")
				//.attr("stroke", "black")
				.append("svg:path")
				.attr("d","M 0 0 L 5 5 L 0 10 z")					
				;							
			
			  this.brush = d3.svg.brush()
									.x(_SigletonConfig.noXScale)
									.y(_SigletonConfig.noYScale)
								    .on("brushstart", function(d) 
								    					{
								    						_SigletonConfig.gSelectionIds = [];
								    	
								    						if (_SimulationController.view.selecting)
								    						{
								    							
									    						_SimulationData.gNeuronsRep.each(function(d)
															  				{ 
															  					d.previouslySelected = _SigletonConfig.shiftKey && d.selected; 
															  				}
															  			 );									    							
								    						}
														})
									.on("brush", function(d) 
												{
						    						if (_SimulationController.view.selecting)
						    						{
														  var extent = d3.event.target.extent();
														  _SimulationData.gNeuronsRep.classed("selected", function(d)
																  					{
																						return d.selected = d.previouslySelected ^
																													        		(extent[0][0] <= d.PosX 
																															        && d.PosX < extent[1][0]
																															        && extent[0][1] <= d.PosY 
																															        && d.PosY < extent[1][1]);
																						
																			  		});
						    						}
						    						else
						    						{
						    							_SimulationData.gNeuronsRep.classed("selected",function(d)
											  					{
																	return d.selected = d.previouslySelected = false;
											  					});
						    							_SigletonConfig.gSelectionIds = [];
						    						}						    							
												})
									.on("brushend", function(d) 
													{
														_SigletonConfig.gSelectionIds = [];
														
														for (var i=0;i<_SimulationData.gNeurons.length;++i)
														{
															if (_SimulationData.gNeurons[i].selected ) 
																_SigletonConfig.gSelectionIds.push(_SimulationData.gNeurons[i].NId);
														}
				
														d3.event.target.clear();
												        d3.select(this).call(d3.event.target);
													});
									  
				  _SigletonConfig.svg
			  			  .append("g")
						  .datum(function() 
								  { 
							  			return {selected: false, previouslySelected: false}; 
							  	  }
						  		)
						  .attr("class", "brush")
						  .call(this.brush);
				  
				  d3.select("g.brush").style("opacity", 0.0);
	},
	
	//Create the synapsis dinamically
	updateSynapticElements: function () 
	{
		//Delete old connections
		d3.selectAll("line").remove();
		d3.selectAll("lineEE").remove();
		d3.selectAll("lineEI").remove();
		d3.selectAll("lineII").remove();
		d3.selectAll("lineIE").remove();
	
	//EI
		if ( 	_SimulationData.drawEIConn
				&& typeof (_SimulationData.gConnectivity.EI[_SimulationData.steps[_SimulationController.actSimStep]]) != "undefined")												
		{
			this.EIconnectGroup = _SigletonConfig.svg
											.select(".EIconnects")
											.selectAll("lineEI")													
											.data(_SimulationData.gConnectivity.EI[_SimulationData.steps[_SimulationController.actSimStep]]);

			this.EIconnectGroup
				.attr('transform', 'translate(' + this.zoombehavior.translate() + ')' + ' scale(' +         this.zoombehavior.scale() + ')');
					
//			_SigletonConfig.svg
			this.EIconnectGroup
				.enter()
				.append("line")
				.attr("x1", function(d) {
					return (_SimulationData.gNeurons[d[0]].PosX);
				}
				)
				.attr("y1", function(d) {
					return (_SimulationData.gNeurons[d[0]].PosY);
				}
				)
				.attr("x2", function(d) {
					return (_SimulationData.gNeurons[d[1]].PosX);
				}
				)
				.attr("y2", function(d) {
					return (_SimulationData.gNeurons[d[1]].PosY);
				}
				)
				.attr("stroke", _SigletonConfig.EIColor)
				.attr("stroke-width", 1)
				.attr("stroke-opacity",_SigletonConfig.macroVAlpha)
				.attr("marker-start", "url(#arrowstart)")
				.attr("marker-end", "url(#arrowend)")
				;			
		}
		
		
	//	IE
		if ( _SimulationData.drawIEConn
			&&	typeof (_SimulationData.gConnectivity.IE[_SimulationData.steps[_SimulationController.actSimStep]]) != "undefined")												
		{
			this.IEconnectGroup = _SigletonConfig.svg
						.select(".IEconnects")
						.selectAll("lineIE")													
						.data(_SimulationData.gConnectivity.IE[_SimulationData.steps[_SimulationController.actSimStep]]);
			
			this.IEconnectGroup
				.attr('transform', 'translate(' + this.zoombehavior.translate() + ')' + ' scale(' +         this.zoombehavior.scale() + ')');
			
			this.IEconnectGroup
				.enter()
				.append("line")
				.attr("x1", function(d) {
					return (_SimulationData.gNeurons[d[0]].PosX);
				}
				)
				.attr("y1", function(d) {
					return (_SimulationData.gNeurons[d[0]].PosY);
				}
				)
				.attr("x2", function(d) {
					return (_SimulationData.gNeurons[d[1]].PosX);
				}
				)
				.attr("y2", function(d) {
					return (_SimulationData.gNeurons[d[1]].PosY);
				}
				)
				.attr("stroke", _SigletonConfig.IEColor)
				.attr("stroke-width", 1)
				.attr("stroke-opacity",_SigletonConfig.macroVAlpha)
				.attr("marker-start", "url(#arrowstart)")
				.attr("marker-end", "url(#arrowend)");													
		}

	
	//	II
		if ( _SimulationData.drawIIConn
				&& typeof (_SimulationData.gConnectivity.II[_SimulationData.steps[_SimulationController.actSimStep]]) != "undefined")												
		{			
			this.IIconnectGroup = _SigletonConfig.svg
												.select(".IIconnects")
												.selectAll("lineII")													
												.data(_SimulationData.gConnectivity.II[_SimulationData.steps[_SimulationController.actSimStep]]);

			this.IIconnectGroup
				.attr('transform', 'translate(' + this.zoombehavior.translate() + ')' + ' scale(' +         this.zoombehavior.scale() + ')');
			
			this.IIconnectGroup
				.enter()
				.append("line")
				.attr("x1", function(d) {
					return (_SimulationData.gNeurons[d[0]].PosX);
				}
				)
				.attr("y1", function(d) {
					return (_SimulationData.gNeurons[d[0]].PosY);
				}
				)
				.attr("x2", function(d) {
					return (_SimulationData.gNeurons[d[1]].PosX);
				}
				)
				.attr("y2", function(d) {
					return (_SimulationData.gNeurons[d[1]].PosY);
				}
				)
				.attr("stroke", _SigletonConfig.IIColor)
				.attr("stroke-width", 1)
				.attr("stroke-opacity",_SigletonConfig.macroVAlpha)
				.attr("marker-end", "url(#arrow)")
				.attr("marker-start", "url(#arrowstart)")
				.attr("marker-end", "url(#arrowend)");													
		}							 					

		//	EE												
		if ( _SimulationData.drawEEConn
				&& typeof (_SimulationData.gConnectivity.EE[_SimulationData.steps[_SimulationController.actSimStep]]) != "undefined")												
		{
			this.EEconnectGroup = _SigletonConfig.svg
												.select(".EEconnects")
												.selectAll("lineEE")													
												.data(_SimulationData.gConnectivity.EE[_SimulationData.steps[_SimulationController.actSimStep]]);

			this.EEconnectGroup
				.attr('transform', 'translate(' + this.zoombehavior.translate() + ')' + ' scale(' +         this.zoombehavior.scale() + ')');
			
			this.EEconnectGroup
				.enter()
				.append("line")
				.attr("x1", function(d) 
					{
						return (_SimulationData.gNeurons[d[0]].PosX);
					}
				)
				.attr("y1", function(d) 
					{
						return (_SimulationData.gNeurons[d[0]].PosY);
					}
				)
				.attr("x2", function(d) 
				  {
					return (_SimulationData.gNeurons[d[1]].PosX);
				  }
				)
				.attr("y2", function(d) 
					{
						return (_SimulationData.gNeurons[d[1]].PosY);
					}
				)
				.attr("stroke", _SigletonConfig.EEColor)
				.attr("stroke-width", 1)
				.attr("stroke-opacity",_SigletonConfig.macroVAlpha)
				.attr("marker-start", "url(#arrowstart)")
				.attr("marker-end", "url(#arrowend)");													
		}
		
		this.gConnectLoaded=true;
	},
	
	updateCalcium: function () 
	{		 
		_SimulationData.gNeuronsRep.style("fill", function(d) 
		{
			if (d.NAct == "E") 
			{																							
				var lVal = _SimulationData.CaEScale(d.Calcium[_SimulationController.actSimStep]);
				return lVal;				
			} 
			else 
			{
				var lVal = _SimulationData.CaIScale(d.Calcium[_SimulationController.actSimStep]);
				return lVal;				
			}
		});		
		_SimulationData.gNeuronsRep.moveToFront();
		
	},
	
	updateVisualization: function () 
	{
		this.updateSynapticElements();
		this.updateCalcium();
	
		//Mover adelante el recuadro de seleccion
		_SigletonConfig.svg.select(".rect").moveToFront();		
	},
	
	keyDown: function () 
	{		
		_SigletonConfig.shiftKey = d3.event.shiftKey || d3.event.metaKey;
		
		if (_SigletonConfig.shiftKey)
		{
			if (!_SimulationController.view.selecting)
			{
				_SimulationController.view.selecting=true;
				d3.select("g.brush").style("opacity", 0.4);
				
				_SigletonConfig.svg.call(d3.behavior.zoom());				
			}
		}				
	},

	keyUp: function () 
	{		
		_SigletonConfig.shiftKey = d3.event.shiftKey || d3.event.metaKey;

		_SimulationController.view.selecting=false;
		d3.select("g.brush").style("opacity", 0.0);
		
		_SigletonConfig.svg.call(_SimulationController.view.zoombehavior);
				
	},
	
	zoom: function () 
	{
		_SigletonConfig.svg.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
	}	
};
