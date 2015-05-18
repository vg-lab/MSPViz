
MSP.GlobalConnectionsView = function() {
	this.margin;
	this.x;
	this.y;
	this.xAxis;
	this.yAxis;

	this.numYTicks;
	this.ActData;
	this.bars;
	this.lConnectionTypes;

	this.width;
	this.height;
	
	this.MSPViewType="GlobalCV";	
};

MSP.GlobalConnectionsView.prototype = 
{
	constructor : MSP.GlobalConnectionsView

	,
	generateGlobalConnectionsView : function() 
	{
		this.numYTicks 			= 10;
		this.lConnectionTypes 	= [ "All E SE.", "All I SE.", "EE Conn.", "EI Conn.", "IE Conn.", "II Conn." ];

		// Margin definitions for the view
		this.margin = 
		{
			top 	: 50,
			right 	: 50,
			bottom 	: 50,
			left 	: 50
		};

		// width and height for the views
		this.width = _SigletonConfig.width 
					- this.margin.left
					- this.margin.right;

		this.height = _SigletonConfig.height 
						- this.margin.top
						- this.margin.bottom;

		// x Scale fos axis
		this.x = d3.scale.ordinal().rangeRoundBands([ 0, this.width ], .1);

		// y scale fos axis
		this.y = d3.scale.linear().range([ this.height, 0 ]);

		// Definition of the axis
		this.xAxis = d3.svg.axis().scale(this.x).orient("bottom");

		this.yAxis = d3.svg.axis().scale(this.y).orient("left").ticks(this.numYTicks);

		var self = this;

		// Destroy the previous canvas
		d3.select("svg").remove();

		// Redefinition of the domains for the scale
		self.x.domain(this.lConnectionTypes);

		// Calcular los maximos de las conexiones
		self.y.domain([0, d3.max([ _SimulationData.maxTEConn,
		                           _SimulationData.maxTIConn ]) ]);

		// Generacion del objeto svg
		_SigletonConfig.svg = d3.select("#renderArea")
								.append("svg")
								.attr("width", this.width + self.margin.left + self.margin.right)
								.attr("height", self.height + self.margin.top + self.margin.bottom)
								.append("g")
								.call(d3.behavior.zoom().scaleExtent([1, 10])
										.on("zoom", self.zoom))										
								.attr("transform", "translate(" + self.margin.left + "," + self.margin.top + ")")
								;

		//For zooming
		_SigletonConfig.svg
						.append("rect")
					    .attr("class", "overlay")
					    .attr("width", _SigletonConfig.width)
					    .attr("height", _SigletonConfig.height);
		
		// Add the object for the x axis
		_SigletonConfig.svg.append("g")
							.attr("class", "x axis")
							.attr("transform", "translate(0," + self.height + ")")
							.call(self.xAxis);

		// Add the object for the y axis
		_SigletonConfig.svg.append("g")
							.attr("class", "y axis")
							.call(self.yAxis)
							.append("text")
							.attr("transform","rotate(-90)")
							.attr("y", 6)
							.attr("dy", ".71em")
							.style("text-anchor", "end")
							.text("Global connections");

		// Generate the data for this timestep
		this.ActData = [
				{
					connType : this.lConnectionTypes[0],
					value : _SimulationData.TEConn[_SimulationController.actSimStep],
					color : _SigletonConfig.EColor
				},
				{
					connType : this.lConnectionTypes[1],
					value : _SimulationData.TIConn[_SimulationController.actSimStep],
					color : _SigletonConfig.IColor
				},
				{
					connType : this.lConnectionTypes[2],
					value : _SimulationData.EEConn[_SimulationController.actSimStep],
					color : _SigletonConfig.EEColor
				},
				{
					connType : this.lConnectionTypes[3],
					value : _SimulationData.EIConn[_SimulationController.actSimStep],
					color : _SigletonConfig.EIColor
				},
				{
					connType : this.lConnectionTypes[4],
					value : _SimulationData.IEConn[_SimulationController.actSimStep],
					color : _SigletonConfig.IEColor
				},
				{
					connType : this.lConnectionTypes[5],
					value : _SimulationData.IIConn[_SimulationController.actSimStep],
					color : _SigletonConfig.IIColor
				} ];

		// x,y defines the left top position of the rectangle
		// width and height defines the dimmensions of the rectangle
		this.bars = _SigletonConfig.svg
									.selectAll(".bar")
									.data(this.ActData)
									.enter()
									.append("rect")
									.attr("class", "bar")
									.style("fill",function(d) 
													{
														return d.color;
													})
									.attr("x", function(d) 
												{
													return self.x(d.connType);
												})
									.attr("width", self.x.rangeBand())
									.attr("y", function(d) 
												{
													return self.y(d.value);
												})
									.attr("height", function(d) 
													{
														return self.height - self.y(d.value);
													});
	},

	updateVisualization : function() {
		
		//console.log("Actualizando vista");
		
		// Update the ActData
		// #### Buscar como solo modificar el valor de las conexiones
		this.ActData = [
				{
					connType : this.lConnectionTypes[0],
					value : _SimulationData.TEConn[_SimulationController.actSimStep],
					color : _SigletonConfig.EColor
				},
				{
					connType : this.lConnectionTypes[1],
					value : _SimulationData.TIConn[_SimulationController.actSimStep],
					color : _SigletonConfig.IColor
				},
				{
					connType : this.lConnectionTypes[2],
					value : _SimulationData.EEConn[_SimulationController.actSimStep],
					color : _SigletonConfig.EEColor
				},
				{
					connType : this.lConnectionTypes[3],
					value : _SimulationData.EIConn[_SimulationController.actSimStep],
					color : _SigletonConfig.EIColor
				},
				{
					connType : this.lConnectionTypes[4],
					value : _SimulationData.IEConn[_SimulationController.actSimStep],
					color : _SigletonConfig.IEColor
				},
				{
					connType : this.lConnectionTypes[5],
					value : _SimulationData.IIConn[_SimulationController.actSimStep],
					color : _SigletonConfig.IIColor
				} ];

		var self = this;
		
		self.bars = _SigletonConfig.svg
									.selectAll(".bar")
									.data(this.ActData)
									.transition()
									.duration(function(d) 
												{
													return _SimulationController.UpdateVelocity;
												})
									.ease("linear")
									.style("fill",function(d) 
											{
												return d.color;
											})	
									.attr("y", function(d) 
												{
													return self.y(d.value);
												})
									.attr("height", function(d) 
													{
														return self.height - self.y(d.value);
													})
									;
		;
	},
	
	zoom: function () 
	{
		_SigletonConfig.svg.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
	}	
};
