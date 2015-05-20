

MSP.MicroscopicView = function ()
{
	//Subdivision of pies
	this.piesShapes 	= 	[1,1,1];
	this.data			=	[];
	
	//Standart sizes of pies
	this.outerRadius 	= 80;
	this.innerRadius 	= 10;
	this.minInnerRadius = 10;			

	this.path;
	this.arc;

	//Local Scales
	this.AxScale;
	this.DeInScale; 
	this.DeExScale;
	
	this.GlScale;
	
	this.shapes;
	this.paths;
	this.pies;	
	
	this.zoombehavior=0;
	
	this.semZoomActive=false;
	
	this.MSPViewType="MicroV";	
};


MSP.MicroscopicView.prototype = 
{	
	constructor: MSP.MicroscopicView
		
	,generateMicroscopicView  : function ()
	{
		//Generate the pies	 
		var lNumNeurons = _SigletonConfig.gSelectionIds.length;
		_SimulationData.gNeuronsRep = [];
		
		for (var i=0;i<lNumNeurons;++i)
		{
			_SimulationData.gNeuronsRep.push(this.piesShapes);
		}			
	
		this.reclculateSEScales();
		
		var lMinPosX=Infinity, lMinPosY=Infinity, lMaxPosX=-Infinity, lMaxPosY=-Infinity;
		
		for (var i=0;i<_SigletonConfig.gSelectionIds.length;++i)
		{
			if (lMinPosX>_SimulationData.gNeurons[_SigletonConfig.gSelectionIds[i]].PosX) 
				lMinPosX=_SimulationData.gNeurons[_SigletonConfig.gSelectionIds[i]].PosX;
			if (lMaxPosX<_SimulationData.gNeurons[_SigletonConfig.gSelectionIds[i]].PosX) 
				lMaxPosX=_SimulationData.gNeurons[_SigletonConfig.gSelectionIds[i]].PosX;
			
			if (lMinPosY>_SimulationData.gNeurons[_SigletonConfig.gSelectionIds[i]].PosY) 
				lMinPosY=_SimulationData.gNeurons[_SigletonConfig.gSelectionIds[i]].PosY;
			if (lMaxPosY<_SimulationData.gNeurons[_SigletonConfig.gSelectionIds[i]].PosY) 
				lMaxPosY=_SimulationData.gNeurons[_SigletonConfig.gSelectionIds[i]].PosY;			
		}
	
		//Generate the arc
		this.arc = d3.svg
					.arc()
		    		.padRadius(this.outerRadius)
		    		.innerRadius(this.innerRadius);
	
		d3.select("svg")
			.remove();

		_SigletonConfig.recalculatePosScales(lMinPosX, lMaxPosX, lMinPosY, lMaxPosY, true);
		
		var self = this;
		
		this.zoombehavior = d3.behavior.zoom()
								.x(_SigletonConfig.xScale)
								.y(_SigletonConfig.yScale)		
								.scaleExtent([1, 10])
								.on("zoom", self.zoomManager)								
								;
		
		_SigletonConfig.svg = d3.select("#renderArea")
								.on("keydown", this.keyDown)
							    .on("keyup", this.keyUp)
								.append("svg")
								.attr("width", _SigletonConfig.width)
								.attr("height", _SigletonConfig.height)
								.attr("style", "outline: thin solid black;")								
								.call(self.zoombehavior)
								.append("g")
								;
		//For zooming
		_SigletonConfig.svg
						.append("rect")
					    .attr("class", "overlay")
					    .attr("width", _SigletonConfig.width)
					    .attr("height", _SigletonConfig.height)
					    .style("opacity","0.0")
						.on("mousedown", function() 
										 {
											d3.selectAll("path").classed("selected", false);
											_SigletonConfig.neuronSelected = -1;
										 }
			  				)
					    ;
		
		_SigletonConfig.svg
						.append("g")
						.attr("class", "shapes")
						;

		_SigletonConfig.svg
						.append("g")						
						.attr("class", "pies");
		
		this.shapes = _SigletonConfig.svg
						.select(".shapes")
						.selectAll("path")
						.data(_SigletonConfig.gSelectionIds)
			    	  	;
		
		this.shapes.enter()
				.append("path")											
				.attr("d", d3.svg.symbol()    						                 
			                 .type(function(d) 
			                		{ 
			                	 		if (_SimulationData.gNeurons[d].NAct == "E")	return "triangle-up"; 
			                		 	else											return "circle";
			                  		}
			                 	   )
						)				
				.attr("transform", self.transformShapes)												
				.style("fill", "rgb(255,255,255)")
				.style("stroke", function(d) 
								{
									if ((_SimulationData.gNeurons[d].NAct == "E")) 	return _SigletonConfig.EColor;
									else											return _SigletonConfig.IColor;									
								}
						)
				.on("mousedown", function(d) 
								 {
									if (_SimulationController.view.selecting)
									{
										d3.selectAll("path").classed("selected", false);
										d3.select(this).classed("selected", true);										
										_SigletonConfig.neuronSelected = d;
									}
								 }
	  				)
				.on("mouseover", function(d) 
								{
									var xPos = _SigletonConfig.xScale(_SimulationData.gNeurons[d].PosX) + 75;
									var yPos = _SigletonConfig.yScale(_SimulationData.gNeurons[d].PosY);

									
									var ENode = 0;
									var INode = 0;
									var ANode = 0;
									
									switch (_SigletonConfig.SEViewSelector) 
									{
										case 0:
											ENode = (_SimulationData.gNeurons[d].DeSeEA[_SimulationController.actSimStep]);
											INode = (_SimulationData.gNeurons[d].DeSeIA[_SimulationController.actSimStep]);
											ANode = (_SimulationData.gNeurons[d].AxSeA[_SimulationController.actSimStep]);				
											break;
										case 1:
											ENode = (_SimulationData.gNeurons[d].DeSeEV[_SimulationController.actSimStep]);
											INode = (_SimulationData.gNeurons[d].DeSeIV[_SimulationController.actSimStep]);
											ANode = (_SimulationData.gNeurons[d].AxSeV[_SimulationController.actSimStep]);															
											break;
										case 2:
											ENode = (_SimulationData.gNeurons[d].DeSeEC[_SimulationController.actSimStep]);
											INode = (_SimulationData.gNeurons[d].DeSeIC[_SimulationController.actSimStep]);
											ANode = (_SimulationData.gNeurons[d].AxSeC[_SimulationController.actSimStep]);								
											break;	
										default:
											break;
									}
									
									d3.select("#tooltip")
										.style("left", xPos + "px")
										.style("top", yPos+ "px")
										.text(																	
											"Id:" + _SimulationData.gNeurons[d].NId										
											+" CaC:" + _SimulationData.gNeurons[d].Calcium[_SimulationController.actSimStep]
											+ " SE_E:" + ENode
											+ " SE_I:" + INode
											+ " SE_A:" + ANode
										);
									
									d3.select("#tooltip").classed("hidden",false);
									
								})
					.on("mouseout", function() 
								{															
									d3.select("#tooltip").classed("hidden",true);
								}
				);
		
		this.pies = _SigletonConfig.svg
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
				    .each(function(d) 
				    		{ 
				    			d.foo = d.outerRadius = this.minInnerRadius;
				    		}
				    	  )
				    .attr("d", this.arc)
				    .attr("id", function(d) { return d.id = (++lId); })
				    .style("fill", function(d, i) 
				    				{ 
				    					if (i==0) return _SigletonConfig.EColor; 
				    					if (i==1)
				    					{					    						
				    						var lIndirectNeuId = parseInt(d.id/3);								    			
				    						var lRealNeuId = _SigletonConfig.gSelectionIds[lIndirectNeuId];
											
				    						var lTmpColor;
											if (_SimulationData.gNeurons[lRealNeuId].NAct=="E") 	lTmpColor = new KolorWheel(_SigletonConfig.EColor).getRgb(); 
					    					else															lTmpColor = new KolorWheel(_SigletonConfig.IColor).getRgb();

											axonalColor = "rgba("+lTmpColor[0] + "," + lTmpColor[1] +","+ lTmpColor[2]+", 0.5)" ;
											delete lTmpColor;
											
											return axonalColor;											
	 					    			}
				    					if (i==2) return _SigletonConfig.IColor;
				    				}
							)
				    .style("stroke", function(d, i) 
		    				{ 
				    			var lIndirectNeuId 	= parseInt(d.id/3);				    			
				    			var lRealNeuId 		= _SigletonConfig.gSelectionIds[lIndirectNeuId];
		    					
				    			return "rgb(0,0,0)";				    			
		    				}
							)
					.style("stroke-width", 0.2)
					.attr("stroke-opacity",0.6)
					;
	},
	
	showInformation: function ()
	{			
		console.log ( d3.select(this) );			
	},
	
	updateCalcium: function ()
	{			
		this.shapes.style("fill", function(d) 
		{
			if (d.NAct == "E") 
			{																							
				var lVal = _SimulationData.CaEScale(_SimulationData.gNeurons[d].Calcium[_SimulationController.actSimStep]);
				return lVal;				
			} 
			else 
			{
				var lVal = _SimulationData.CaIScale(_SimulationData.gNeurons[d].Calcium[_SimulationController.actSimStep]);
				return lVal;				
			}			
		});
	},
	
	
	updateVisualization: function () 
	{
		var myThis = this;
		
		this.paths
		 .data(d3.layout.pie())
	 	 .each(	function(d)
	    		{		    			
	    			// Wrap dom element in d3 selection
	 		 		var elm = d3.select(this);
	
					var lIndirectNeuId 	= parseInt(elm.attr('id')/3);
					var lArcId 			= parseInt(elm.attr('id')%3);
					var lRealNeuId 		= _SigletonConfig.gSelectionIds[lIndirectNeuId];
					
					var lPrevInc=1;
					if (_SimulationController.actSimStep==0) lPrevInc=0;
					
					switch (_SigletonConfig.SEViewSelector) 
					{
						case 0:
							//Dendritic excitatory
							if (lArcId == 0) 
							{						
				    			d.outerRadius 	= myThis.GlScale(_SimulationData.gNeurons[lRealNeuId].DeSeEA[(_SimulationController.actSimStep-lPrevInc)%_SimulationData.steps.length]);       					
								d.foo 			= myThis.GlScale(_SimulationData.gNeurons[lRealNeuId].DeSeEA[_SimulationController.actSimStep%_SimulationData.steps.length]);
							}	
							//Axon elements
							if (lArcId == 1) 
							{
				    			d.outerRadius 	= myThis.GlScale(_SimulationData.gNeurons[lRealNeuId].AxSeA[(_SimulationController.actSimStep-lPrevInc)%_SimulationData.steps.length]);       					
								d.foo 			= myThis.GlScale(_SimulationData.gNeurons[lRealNeuId].AxSeA[_SimulationController.actSimStep%_SimulationData.steps.length]);
							}
							//Dendritic inhibitory
							if (lArcId == 2) 
							{
				    			d.outerRadius 	= myThis.GlScale(_SimulationData.gNeurons[lRealNeuId].DeSeIA[(_SimulationController.actSimStep-lPrevInc)%_SimulationData.steps.length]);       					
								d.foo			= myThis.GlScale(_SimulationData.gNeurons[lRealNeuId].DeSeIA[_SimulationController.actSimStep%_SimulationData.steps.length]);
							}							
							break;	

						case 1:
							//Dendritic excitatory
							if (lArcId == 0) 
							{						
				    			d.outerRadius 	= myThis.GlScale(_SimulationData.gNeurons[lRealNeuId].DeSeEV[(_SimulationController.actSimStep-lPrevInc)%_SimulationData.steps.length]);       					
								d.foo 			= myThis.GlScale(_SimulationData.gNeurons[lRealNeuId].DeSeEV[_SimulationController.actSimStep%_SimulationData.steps.length]);
							}	
							//Axon elements
							if (lArcId == 1) 
							{
				    			d.outerRadius 	= myThis.GlScale(_SimulationData.gNeurons[lRealNeuId].AxSeV[(_SimulationController.actSimStep-lPrevInc)%_SimulationData.steps.length]);       					
								d.foo 			= myThis.GlScale(_SimulationData.gNeurons[lRealNeuId].AxSeV[_SimulationController.actSimStep%_SimulationData.steps.length]);
							}
							//Dendritic inhibitory
							if (lArcId == 2) 
							{
				    			d.outerRadius 	= myThis.GlScale(_SimulationData.gNeurons[lRealNeuId].DeSeIV[(_SimulationController.actSimStep-lPrevInc)%_SimulationData.steps.length]);       					
								d.foo			= myThis.GlScale(_SimulationData.gNeurons[lRealNeuId].DeSeIV[_SimulationController.actSimStep%_SimulationData.steps.length]);
							}
							break;	

						case 2:
							//Dendritic excitatory
							if (lArcId == 0) 
							{						
				    			d.outerRadius 	= myThis.GlScale(_SimulationData.gNeurons[lRealNeuId].DeSeEC[(_SimulationController.actSimStep-lPrevInc)%_SimulationData.steps.length]);       					
								d.foo 			= myThis.GlScale(_SimulationData.gNeurons[lRealNeuId].DeSeEC[_SimulationController.actSimStep%_SimulationData.steps.length]);
							}	
							//Axon elements
							if (lArcId == 1) 
							{
				    			d.outerRadius 	= myThis.GlScale(_SimulationData.gNeurons[lRealNeuId].AxSeC[(_SimulationController.actSimStep-lPrevInc)%_SimulationData.steps.length]);       					
								d.foo 			= myThis.GlScale(_SimulationData.gNeurons[lRealNeuId].AxSeC[_SimulationController.actSimStep%_SimulationData.steps.length]);
							}
							//Dendritic inhibitory
							if (lArcId == 2) 
							{
				    			d.outerRadius 	= myThis.GlScale(_SimulationData.gNeurons[lRealNeuId].DeSeIC[(_SimulationController.actSimStep-lPrevInc)%_SimulationData.steps.length]);       					
								d.foo			= myThis.GlScale(_SimulationData.gNeurons[lRealNeuId].DeSeIC[_SimulationController.actSimStep%_SimulationData.steps.length]);
							}							
							break;	

						default:
							break;
					}
					
					
	    		}
		  ) 		  
		 .attr("d", this.arcTween(_SimulationController.UpdateVelocity))		  
		;
		
		this.updateCalcium();
	}
	
	
	,reclculateSEScales : function()
	{
		//Maximun and minimun local values of the selection
		var lMax, lMin;
		lMax=lMin=0.0;
		
		switch (_SigletonConfig.SEViewSelector) 
		{
			case 0:
				for (var i=0;i<_SigletonConfig.gSelectionIds.length;++i)
					for (var j=0;j<_SimulationData.gNeurons[_SigletonConfig.gSelectionIds[i]].AxSeA.length;++j)
					{
						if (lMax<_SimulationData.gNeurons[_SigletonConfig.gSelectionIds[i]].AxSeA[j]) 	
							lMax=_SimulationData.gNeurons[_SigletonConfig.gSelectionIds[i]].AxSeA[j];
		                                                          
						if (lMax<_SimulationData.gNeurons[_SigletonConfig.gSelectionIds[i]].DeSeEA[j]) 
							lMax=_SimulationData.gNeurons[_SigletonConfig.gSelectionIds[i]].DeSeEA[j];					
		                                                          
						if (lMax<_SimulationData.gNeurons[_SigletonConfig.gSelectionIds[i]].DeSeIA[j]) 
							lMax=_SimulationData.gNeurons[_SigletonConfig.gSelectionIds[i]].DeSeIA[j];
					}
				break;
			case 1:
				for (var i=0;i<_SigletonConfig.gSelectionIds.length;++i)
					for (var j=0;j<_SimulationData.gNeurons[_SigletonConfig.gSelectionIds[i]].AxSeV.length;++j)
					{
						if (lMax<_SimulationData.gNeurons[_SigletonConfig.gSelectionIds[i]].AxSeV[j]) 	
							lMax=_SimulationData.gNeurons[_SigletonConfig.gSelectionIds[i]].AxSeV[j];
		                                                          
						if (lMax<_SimulationData.gNeurons[_SigletonConfig.gSelectionIds[i]].DeSeEV[j]) 
							lMax=_SimulationData.gNeurons[_SigletonConfig.gSelectionIds[i]].DeSeEV[j];					
		                                                          
						if (lMax<_SimulationData.gNeurons[_SigletonConfig.gSelectionIds[i]].DeSeIV[j]) 
							lMax=_SimulationData.gNeurons[_SigletonConfig.gSelectionIds[i]].DeSeIV[j];
					}
				break;			
			case 2:
				for (var i=0;i<_SigletonConfig.gSelectionIds.length;++i)
					for (var j=0;j<_SimulationData.gNeurons[_SigletonConfig.gSelectionIds[i]].AxSeC.length;++j)
					{
						if (lMax<_SimulationData.gNeurons[_SigletonConfig.gSelectionIds[i]].AxSeC[j]) 	
							lMax=_SimulationData.gNeurons[_SigletonConfig.gSelectionIds[i]].AxSeC[j];
		                                                          
						if (lMax<_SimulationData.gNeurons[_SigletonConfig.gSelectionIds[i]].DeSeEC[j]) 
							lMax=_SimulationData.gNeurons[_SigletonConfig.gSelectionIds[i]].DeSeEC[j];					
		                                                          
						if (lMax<_SimulationData.gNeurons[_SigletonConfig.gSelectionIds[i]].DeSeIC[j]) 
							lMax=_SimulationData.gNeurons[_SigletonConfig.gSelectionIds[i]].DeSeIC[j];
					}
				break;			
			default:
				break;
		}
				
		this.GlScale = d3.scale
					.linear()
					.domain([lMin, lMax])
					.range([this.minInnerRadius, this.outerRadius]); 
	}
	
	,arcTween: function (delay) 
	{
	  var myThis = this;

	  return function() 
	  		{
	    		d3.select(this)
	    			.transition()
	    			.delay(delay)
	    			.attrTween("d", function(d) 
	    							{	
	      								var i = d3.interpolate(d.outerRadius, d.foo);
	      								return function(t) 
	      										{ 
	      											d.outerRadius = i(t); 	      											
	      											return myThis.arc(d); 
	      										};
	    							}
	    						);
	  		};
	}
	
	
	,keyDown: function () 
	{	
		_SigletonConfig.shiftKey = d3.event.shiftKey || d3.event.metaKey;
		
		if (_SigletonConfig.shiftKey)
		{
			if (!_SimulationController.view.selecting)
			{
				_SimulationController.view.selecting=true;
				
				_SigletonConfig.svg.call(d3.behavior.zoom());				
			}
		}						
		else
		{
			if (d3.event.keyCode==81)
			{
				_SimulationController.view.semZoomActive=true;	
			}			
			else
			{
				_SimulationController.view.semZoomActive=false;
			}				
		}
		
		_SimulationController.view.updateVisualization();
	}

	,keyUp: function () 
	{	
		_SigletonConfig.shiftKey = d3.event.shiftKey || d3.event.metaKey;

		if (_SigletonConfig.shiftKey)
		{
			_SimulationController.view.selecting=false;
			
			_SigletonConfig.svg.call(_SimulationController.view.zoombehavior);			
		}
		else
		{
			_SigletonConfig.shiftKey = d3.event.shiftKey || d3.event.metaKey;			
		}
	}
	
	,zoomManager: function () 
	{
		if (_SimulationController.view.semZoomActive)	_SimulationController.view.zoomSemantic();
		else											_SimulationController.view.zoom();
	}
	
	,zoom: function () 
	{
		_SigletonConfig.svg.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
	}
	
	,zoomSemantic: function () 
	{
		_SimulationController.view.shapes.attr("transform", _SimulationController.view.transform);
		_SimulationController.view.pies.attr("transform", _SimulationController.view.transform);
	}

	,transformShapes: function (d) 
	{
		return "translate(" + _SigletonConfig.xScale(_SimulationData.gNeurons[d].PosX) + "," + _SigletonConfig.yScale(_SimulationData.gNeurons[d].PosY) + ")";
	}
	
	,transform: function (d,i) 
	{
		return "translate(" + _SigletonConfig.xScale(_SimulationData.gNeurons[_SigletonConfig.gSelectionIds[i]].PosX) + "," 
							+ _SigletonConfig.yScale(_SimulationData.gNeurons[_SigletonConfig.gSelectionIds[i]].PosY) + ")";
	}
};
