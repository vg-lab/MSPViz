/**
 * @brief
 * @author  Juan Pedro Brito Mendez <juanpebm@gmail.com>
 * @date
 * @remarks Do not distribute without further notice.
 */

MSP.GlobalConnectionsView = function() {
    this.margin;
    this.x;
    this.xI;
    this.y;
    this.yI;
    this.xAxis;
    this.xAxisI;
    this.yAxis;
    this.yAxisI;

    this.numYTicks;
    this.ActData;
    this.ActDataI;
    this.bars;
    this.barsI;
    this.lConnectionTypes;
    this.lConnectionTypesI;

    this.width;
    this.height;

    this.MSPViewType="GlobalCV";
};

MSP.GlobalConnectionsView.prototype = {
    constructor : MSP.GlobalConnectionsView

    ,resize : function()
    {
        this.generateGlobalConnectionsView();
    },
    generateGlobalConnectionsView : function()
    {

        _SigletonConfig.navBar = [{label:"Bar", viewID:0, src:"bargraph.png" },{label:"Graph", viewID:5, src:"linegraph.png"}];
        generateNav();
        this.numYTicks 			= 10;
        this.lConnectionTypes 	= [ "EE Conn.", "EI Conn.", "IE Conn.", "II Conn." ];
        this.lConnectionTypesI	= ["All E SE.", "All I SE."];
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
        this.x = d3.scale.ordinal().rangeRoundBands([ 0, ((this.width-50)/6.0)*4], .1);
        this.xI = d3.scale.ordinal().rangeRoundBands([ (((this.width-50)/6.0)*4)+50, this.width ], .1);
        // y scale fos axis
        this.y = d3.scale.linear().range([ this.height, 0 ]);
        this.yI = d3.scale.linear().range([ this.height, 0 ]);

        // Definition of the axis
        this.xAxis = d3.svg.axis().scale(this.x).orient("bottom");
        this.xAxisI = d3.svg.axis().scale(this.xI).orient("bottom");

        this.yAxis = d3.svg.axis().scale(this.y).orient("left").ticks(this.numYTicks).innerTickSize(-(((this.width-50)/6.0)*4)).outerTickSize(2);
        this.yAxisI = d3.svg.axis().scale(this.yI).orient("left").ticks(this.numYTicks).innerTickSize(-(((this.width-50)/6.0)*2)).outerTickSize(2);

        var self = this;

        // Destroy the previous canvas
        d3.selectAll("svg").filter(function() {
            return !this.classList.contains('color')
        }).remove();

        d3.selectAll("canvas").filter(function() {
            return !this.classList.contains('imgCanvas')
        }).remove();

        // Redefinition of the domains for the scale
        self.x.domain(this.lConnectionTypes);
        self.xI.domain(this.lConnectionTypesI);

        // Calcular los maximos de las conexiones
//		self.y.domain([0, d3.max([ _SimulationData.maxTEConn,
//		                           _SimulationData.maxTIConn ]) ]);
        self.y.domain([0, d3.max([ 0,
            4000]) ]);
        self.yI.domain([0, d3.max([ 0,
            4000]) ]);


        // Generacion del objeto svg
        _SigletonConfig.svg = d3.select("#renderArea")
            .append("svg")
            .attr("width", this.width + self.margin.left + self.margin.right)
            .attr("height", self.height + self.margin.top + self.margin.bottom)
            .append("g")
            .call(d3.behavior.zoom().scaleExtent([1, 10])
                .on("zoom", self.zoom))
            .attr("transform", "translate(" + self.margin.left + "," + self.margin.top + ")")
            .append("g")
        ;

        //For zooming
        _SigletonConfig.svg
            .append("rect")
            .attr("class", "overlay")
            .attr("width", _SigletonConfig.width)
            .attr("height", _SigletonConfig.height)
            .style("opacity","0.0")
        ;

        // Add the object for the x axis
        _SigletonConfig.svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + self.height + ")")
            .call(self.xAxis);

        _SigletonConfig.svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + self.height + ")")
            .call(self.xAxisI);

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

        _SigletonConfig.svg.append("g")
            .attr("class", "y axis")
            .attr("transform","translate("+Math.round((((((this.width-50)/6.0)*4)+50)))+",0)")
            .call(self.yAxisI)
            .append("text")
            .attr("transform","rotate(-90)")
            .attr("y", 6)
            .attr("dy", ".71em")
            .style("text-anchor", "end")
            .text("Synaptic elements");

        // Generate the data for this timestep
        var lIndex = _SimulationController.actSimStep % _SimulationData.numSimStepsPerFile
        this.ActData = [
            {
                connType : this.lConnectionTypes[0],
                value : _SimulationData.EEConn[lIndex],
                color : _SigletonConfig.EEColor
            },
            {
                connType : this.lConnectionTypes[1],
                value : _SimulationData.EIConn[lIndex],
                color : _SigletonConfig.EIColor
            },
            {
                connType : this.lConnectionTypes[2],
                value : _SimulationData.IEConn[lIndex],
                color : _SigletonConfig.IEColor
            },
            {
                connType : this.lConnectionTypes[3],
                value : _SimulationData.IIConn[lIndex],
                color : _SigletonConfig.IIColor
            } ];

        this.ActDataI = [
            {
                connType : this.lConnectionTypesI[0],
                //value : _SimulationData.TEConn[lIndex],
                value : _SimulationData.AESe[lIndex],
                color : _SigletonConfig.EColor
            },
            {
                connType : this.lConnectionTypesI[1],
                //value : _SimulationData.TIConn[lIndex],
                value : _SimulationData.AISe[lIndex],
                color : _SigletonConfig.IColor
            }];
        // x,y defines the left top position of the rectangle
        // width and height defines the dimmensions of the rectangle


        this.bars = _SigletonConfig.svg
            .selectAll(".bar")
            .data(this.ActData)
            .enter()
            .append("g")
            .attr("class", "grupoBar")
            .append("rect")
            .attr("class", "bar")
            .style("fill",function(d)
            {
                return d.color;
            })
            .style("stroke","black")
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
            })
            .on("mouseover", function (d) {
                d3.selectAll('.line_over')
                    .style("display", "inline")
                    .attr("y1", self.y(d.value))
                    .attr("y2", self.y(d.value))
            })
            .on("mouseout", function (d) {
                d3.selectAll('.line_over').style("display", "none");
            });


        _SigletonConfig.svg
            .selectAll(".grupoBar")
            .data(this.ActData)
            .append("text")
            .style("text-anchor", "middle")
            .style("font","0.8em sans-serif")
            .style("font-weight","bold")
            .attr("class", "textoBar")
            .text(function(d)
            {
                return d.value;
            })
            .attr("y", function(d)
            {
                return self.y(d.value)-10;
            })
            .attr("x",function(d)
            {
                return self.x(d.connType)+self.x.rangeBand()/2.0;
            });

        _SigletonConfig.svg.append("line")
            .attr("class", "line_over")
            .attr("stroke-width", 2)
            .attr("stroke-linecap","square")
            .attr("stroke-dasharray","4, 6")
            .attr("stroke","#000")
            .attr("x1",0)
            .attr("x2",(((((this.width-50)/6.0)*4))))
            .attr("y1",0)
            .attr("y2",0)
            .attr("style","display:none;")
            .style("opacity","0.5")
            .attr("shape-rendering","crispEdges");


        this.barsI = _SigletonConfig.svg
            .selectAll(".bar2")
            .data(this.ActDataI)
            .enter()
            .append("g")
            .attr("class", "grupoBar2")
            .append("rect")
            .attr("class", "bar2")
            .style("fill",function(d)
            {
                return d.color;
            })
            .style("stroke","black")
            .attr("x", function(d)
            {
                return self.xI(d.connType);
            })
            .attr("width", self.xI.rangeBand())
            .attr("y", function(d)
            {
                return self.yI(d.value);
            })
            .attr("height", function(d)
            {
                return self.height - self.yI(d.value);
            })
            .on("mouseover", function (d) {
                d3.selectAll('.line_over2')
                    .style("display", "inline")
                    .attr("y1", self.yI(d.value))
                    .attr("y2", self.yI(d.value))
            })
            .on("mouseout", function (d) {
                d3.selectAll('.line_over2').style("display", "none");
            });

        _SigletonConfig.svg.append("line")
            .attr("class", "line_over2")
            .attr("stroke-width", 2)
            .attr("stroke-linecap","square")
            .attr("stroke-dasharray","4, 6")
            .attr("stroke","#000")
            .attr("x1",(((((this.width-50)/6.0)*4)))+50)
            .attr("x2",this.width)
            .attr("y1",0)
            .attr("y2",0)
            .attr("style","display:none;")
            .style("opacity","0.5")
            .attr("shape-rendering","crispEdges");

        _SigletonConfig.svg
            .selectAll(".grupoBar2")
            .data(this.ActDataI)
            .append("text")
            .style("text-anchor", "middle")
            .style("font","0.8em sans-serif")
            .style("font-weight","bold")
            .attr("class", "textoBar2")
            .text(function(d)
            {
                return d.value;
            })
            .attr("y", function(d)
            {
                return self.yI(d.value)-10;
            })
            .attr("x",function(d)
            {
                return self.xI(d.connType)+self.xI.rangeBand()/2.0;
            });

        d3.selectAll(".tick").selectAll("line")
            .attr("stroke-width", 1)
            .attr("stroke", "#000")
            .style("opacity", "0.1");
    },

    updateVisualization : function() {

        //console.log("Actualizando vista");

        // Update the ActData
        // #### Buscar como solo modificar el valor de las conexiones
        var lIndex = _SimulationController.actSimStep % _SimulationData.numSimStepsPerFile;
        this.ActData = [
            {
                connType : this.lConnectionTypes[0],
                value : _SimulationData.EEConn[lIndex],
                color : _SigletonConfig.EEColor
            },
            {
                connType : this.lConnectionTypes[1],
                value : _SimulationData.EIConn[lIndex],
                color : _SigletonConfig.EIColor
            },
            {
                connType : this.lConnectionTypes[2],
                value : _SimulationData.IEConn[lIndex],
                color : _SigletonConfig.IEColor
            },
            {
                connType : this.lConnectionTypes[3],
                value : _SimulationData.IIConn[lIndex],
                color : _SigletonConfig.IIColor
            } ];

        this.ActDataI = [
            {
                connType : this.lConnectionTypesI[0],
                //value : _SimulationData.TEConn[lIndex],
                value : _SimulationData.AESe[lIndex],
                color : _SigletonConfig.EColor
            },
            {
                connType : this.lConnectionTypesI[1],
                //value : _SimulationData.TIConn[lIndex],
                value : _SimulationData.AISe[lIndex],
                color : _SigletonConfig.IColor
            }];

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


        _SigletonConfig.svg
            .selectAll(".textoBar")
            .data(this.ActData)
            .transition()
            .duration(function(d)
            {
                return _SimulationController.UpdateVelocity;
            })
            .ease("linear")
            .text(function(d)
            {
                return d.value;
            })
            .attr("y", function(d)
            {
                return self.y(d.value)-10;
            })
            .attr("x", function(d)
            {
                return self.x(d.connType)+self.x.rangeBand()/2.0;
            });

        _SigletonConfig.svg
            .selectAll(".textoBar2")
            .data(this.ActDataI)
            .transition()
            .duration(function(d)
            {
                return _SimulationController.UpdateVelocity;
            })
            .ease("linear")
            .text(function(d)
            {
                return d.value;
            })
            .attr("y", function(d)
            {
                return self.yI(d.value)-10;
            })
            .attr("x", function(d)
            {
                return self.xI(d.connType)+self.xI.rangeBand()/2.0;
            });

        self.barsI = _SigletonConfig.svg
            .selectAll(".bar2")
            .data(this.ActDataI)
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
                return self.yI(d.value);
            })
            .attr("height", function(d)
            {
                return self.height - self.yI(d.value);
            })
        ;

    },

    zoom: function ()
    {
        _SigletonConfig.svg.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
    }
};
