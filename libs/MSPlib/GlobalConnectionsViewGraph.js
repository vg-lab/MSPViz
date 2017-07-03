/**
 * @brief
 * @author  Juan Pedro Brito Mendez <juanpebm@gmail.com>
 * @date
 * @remarks Do not distribute without further notice.
 */

MSP.GlobalConnectionsViewGraph = function() {
    this.margin;
    this.margin2;
    this.x;
    this.y;
    this.x3;
    this.y3;
    this.x4;
    this.y4;
    this.x5;
    this.y5;
    this.xAxis;
    this.yAxis;

    this.xAxis3;
    this.yAxis35;


    this.xAxis4;
    this.yAxis4;


    this.xAxis5;
    this.yAxis5;


    this.numYTicks;
    this.ActData;
    this.lConnectionTypes;

    this.width;
    this.height;
    this.width2;
    this.height2;
    this.svg;
    this.maxCalciumValue;
    this.maxEConn;
    this.maxIConn;
    this.maxAConn;
    this.MSPViewType="GlobalCV";
    this.colorScale;

};

MSP.GlobalConnectionsViewGraph.prototype =
    {
        constructor : MSP.GlobalConnectionsViewGraph

        ,resize : function()
        {
            this.generateGlobalConnectionsViewGraph();
        },
        generateGlobalConnectionsViewGraph : function()
        {
            // Destroy the previous canvas
            d3.selectAll("svg").filter(function() {
                return !this.classList.contains('color')
            }).remove();

            d3.selectAll("canvas")
                .remove();


            var self = this;
            this.maxCalciumValue = Math.max.apply(Math, _SimulationData.gNeuronsDetails[126].Calcium);
            this.maxEConn = Math.max.apply(Math, _SimulationData.gNeuronsDetails[126].DeSeEA);
            this.maxIConn = Math.max.apply(Math, _SimulationData.gNeuronsDetails[126].DeSeIA);
            this.maxAConn = Math.max.apply(Math, _SimulationData.gNeuronsDetails[126].AxSeA);

            if (_SimulationData.gNeurons[126].NAct === "E") {
                this.colorScale = _SimulationData.CaEScale;

            } else {
                this.colorScale = _SimulationData.CaIScale;

            }
            this.margin = {top: 10, right: 15, left: 65};
            this.width = _SigletonConfig.width-this.margin.right-this.margin.left;
            this.height = ((_SigletonConfig.height-(this.margin.top*2)-50)/2)-5;

            this.margin2 = {top: this.height+this.margin.top+40, right: 15, bottom: 0, left: 65};
            this.width2 = _SigletonConfig.width-this.margin.right-this.margin.left;
            this.height2 = this.height;

            this.numYTicks 			= 10;

            this.y = d3.scale.linear().range([ this.height, 0 ]).nice();
            this.yAxis = d3.svg.axis().scale(this.y).orient("left").innerTickSize(-this.width).outerTickSize(3);
            self.y.domain([0, d3.max([ 0, this.maxCalciumValue]) ]);


            d3.select("#caGraph").remove();

            this.svg = d3.select("#renderArea")
                .append("svg")
                .style("border-left","1px solid #ebebeb")
                .attr("id","caGraph")
                .attr("width",_SigletonConfig.width)
                .attr("height", _SigletonConfig.height)
                .append("g")
                .call(d3.behavior.zoom().scaleExtent([1, 10])
                    .on("zoom", self.zoom))
                .attr("transform", "translate(" + self.margin.left + "," + self.margin.top + ")")
                .append("g")
            ;

            this.updateVisualization();



        },
        updateVisualization: function() {
            var lIndex = _SimulationController.actSimStep % _SimulationData.numSimStepsPerFile;
            var dataEE = {text:"EE Conn.", textShort:"", color:_SigletonConfig.EEColor, data:[]};
            var dataEI = {text:"EI  Conn.", textShort:"", color:_SigletonConfig.EIColor, data:[]};
            var dataIE = {text:"IE  Conn.", textShort:"", color:_SigletonConfig.IEColor, data:[]};
            var dataII = {text:"II  Conn.", textShort:"", color:_SigletonConfig.IIColor, data:[]};
            var dataAI = {text:"All E SE.", textShort:"", color:_SigletonConfig.EColor, data:[]};
            var dataAE = {text:"All I SE.", textShort:"", color:_SigletonConfig.IColor, data:[]};
            for(var i = 0; i<lIndex+1;i++)
            {
                dataEE.data.push({
                    value : i,
                    data : _SimulationData.EEConn[i]
                });
                dataEI.data.push({
                    value : i,
                    data : _SimulationData.EIConn[i]
                });
                dataIE.data.push({
                    value : i,
                    data : _SimulationData.IEConn[i]
                });
                dataII.data.push({
                    value : i,
                    data : _SimulationData.IIConn[i]
                });
                dataAE.data.push({
                    value : i,
                    data : _SimulationData.AESe[i]
                });
                dataAI.data.push({
                    value : i,
                    data : _SimulationData.AISe[i]
                });
            }

            this.graph(1,this.width,this.margin.left, this.margin.top,this.height,[dataEE,dataEI,dataIE,dataII],"Global Connections");
            this.graph(2,this.width2,this.margin.left, this.margin2.top,this.height2,[dataAE,dataAI],"Synaptic elements");

        },
        // Method for drawing graphs
        // Everything is redrawn because every element (lines, axis, values) are step dependant
        graph: function(i,widthTotal,marginLeft,marginTop,height,data,title)
        {
            var self = this;
            var width = widthTotal-80;
            var scales = [];
            var scalesX = [];
            var xx = d3.scale.linear().range([0, width]);
            d3.select(".history.a"+i).remove();
            d3.select(".history.b"+i).remove();
            this.svg.selectAll(".legend.a"+i).remove();
            var gLegend = this.svg.append("g").attr("class","legend a"+i).attr("transform","translate(0,"+marginTop+")");

            d3.select(".textoA.t"+i).remove();

            this.svg
                .append("text")
                .attr("transform","rotate(-90)")
                .attr("y", 0 - (marginLeft-10))
                .attr("x", 0 - (height /2)-marginTop)
                .attr("dy", ".71em")
                .attr("class","textoA t"+i)
                .style("text-anchor", "middle")
                .text(title);

            data.forEach(function (d,z) {
                gLegend.append("circle")
                    .attr("class","circleL")
                    .attr("cx",width+marginLeft-45)
                    .attr("cy",((height/2)-((22*data.length)/2))+10+(z*20))
                    .style("stroke",d.color)
                    .style("fill",d.color)
                    .attr("r", 4);

                gLegend.append("text")
                    .attr("x",width+marginLeft-35)
                    .attr("y",((height/2)-((22*data.length)/2))+16+(z*20))
                    .attr("class","textoL")
                    .text(d.text);
            });


            this.svg.append("line")
                .attr("class", "line_over"+i)
                .attr("stroke-width", 1)
                .attr("stroke","#000")
                .attr("x1",0)
                .attr("x2",0)
                .attr("y1",marginTop)
                .attr("y2",height+marginTop)
                .attr("style","display:none;")
                .style("opacity","0.5")
                .attr("shape-rendering","crispEdges");




            var area = d3.svg.area()
                .x(function(d) { return xx(d.value); })
                .y1(function(d) { return y(d.data); });

            var valueline = d3.svg.line()
                .x(function(d) { return xx(d.value); })
                .y(function(d) {  return y(d.data);  });
            var max = 0;

            data.forEach(function(d){
                d.data.forEach(function(d){
                    if(d.data > max) max = d.data;
                });
            });

            var x2 = d3.scale.linear().range([ 0, width], 1);
            x2.domain([0,_SimulationController.actSimStep]);
            var xAxis2 = d3.svg.axis().scale(x2).tickValues(x2.ticks().concat(x2.domain())).orient("bottom").innerTickSize(-height);

            var y = d3.scale.linear().range([ height, 0 ]).domain([0,max]);
            var yAxis = d3.svg.axis().scale(y).orient("left").tickValues(y.ticks().concat(y.domain())).innerTickSize(-width);

            d3.select(".x.axis.p"+i).remove();
            d3.select(".y.axis.p"+i).remove();
            this.svg.append("g")
                .attr("class", "x axis p"+i)
                .attr("transform", "translate(0," + (marginTop+height) + ")")
                .call(xAxis2)
            ;


            this.svg.append("g")
                .attr("transform", "translate(0," + (marginTop) + ")")
                .attr("class", "y axis p"+i)
                .call(yAxis);

            this.svg.selectAll(".y.axis.p"+i+" text").attr("transform",  "translate(" +  -4+ ",0)");
            this.svg.selectAll(".x.axis.p"+i+" text").attr("transform",  "translate(0," +  4+ ")");

            xx.domain([0,_SimulationController.actSimStep]);
            var x = d3.scale.linear().range([0, _SimulationController.actSimStep]);
            x.domain([0,   width]);
            var gBurbujas = this.svg.append("g").attr("class","history c"+i).attr("transform","translate(0,"+marginTop+")");
            var glineas = this.svg.append("g").attr("class","history b"+i).attr("transform","translate(0,"+marginTop+")");
            var g = this.svg.append("g").attr("class","history a"+i).attr("transform","translate(0,"+marginTop+")");

            g.selectAll(".rect_over").remove();
            g.append("rect")
                .attr("class", "rect_over")
                .attr("fill-opacity","1")
                .attr("fill","#ffffff")
                .attr("x",0)
                .attr("rx",5)
                .attr("ry",5)
                .attr("height",22*data.length)
                .attr("width",80)
                .attr("y",400)
                .attr("style","display:none;");


            data.forEach(function (d,z) {
                area.y0(y(0));
                scales.push(y);
                scalesX.push(xx);
                if(data.length===1) {
                    glineas.append("path")
                        .datum(d.data)
                        .attr("class", "graphArea a" + i)
                        .attr("d", area);
                }


                glineas.append("path")
                    .attr("class", "graphLine")
                    .style("stroke",d.color)
                    .attr("d", valueline(d.data));

                gBurbujas.append("circle")
                    .attr("class","circleBck")
                    .style("display", "none")
                    .style("stroke","none")
                    .style("fill","white")
                    .attr("r", 6);

                g.append("circle")
                    .attr("class","circlePos")
                    .style("display", "none")
                    .style("stroke",d.color)
                    .style("fill","none")
                    .attr("r", 6);
                g.append("circle")
                    .attr("class","circleTxt")
                    .style("display", "none")
                    .style("stroke",d.color)
                    .style("fill",d.color)
                    .attr("r", 3);


                g.append("text")
                    .attr("class","texto")
                    .style("display", "none");
            });


            d3.selectAll(".overlay.a"+i).remove();
            d3.select("svg")
                .append("rect")
                .attr("class", "overlay a"+i)
                .attr("transform", "translate("+self.margin.left+","+self.margin.top+")")
                .attr("width", width)
                .attr("y",marginTop)
                .attr("height", height)
                .on("mousemove", function () {
                    var coordinate = d3.mouse(this);
                    var ys = [];
                    g.selectAll('.circlePos')[0].forEach(function(d,i){
                        ys.push(y(data[i].data[Math.floor(x(coordinate[0]))].data));
                    });
                    d3.selectAll('.line_over'+i)
                        .style("display", "inline")
                        .attr("x1",parseInt(x(coordinate[0]))*(width/_SimulationController.actSimStep))
                        .attr("x2",parseInt(x(coordinate[0]))*(width/_SimulationController.actSimStep));

                    g.selectAll('.rect_over')
                        .style("display", "inline")
                        .attr("x",parseInt(x(coordinate[0]))*(width/_SimulationController.actSimStep)+30)
                        .attr("y",function(){
                            return d3.max(ys);
                        });



                    g.selectAll('.circleTxt')
                        .style("display", "inline")
                        .attr("cx",parseInt(x(coordinate[0]))*(width/_SimulationController.actSimStep)+30+10)
                        .attr("cy",function(d,i){
                            return d3.max(ys)+15+(i*20);
                        });

                    g.selectAll('.texto')
                        .style("display", "inline")
                        .attr("x",parseInt(x(coordinate[0]))*(width/_SimulationController.actSimStep)+30+20)
                        .attr("y",function(d,i){
                            return d3.max(ys)+20+(i*20);
                        })
                        .text(function(d,i){
                            return data[i].textShort+" "+ data[i].data[Math.floor(x(coordinate[0]))].data;
                        });

                    g.selectAll('.circlePos')
                        .style("display", "inline")
                        .attr("cy",function(d,i){
                            return y(data[i].data[Math.floor(x(coordinate[0]))].data);
                        })
                        .attr("cx",parseInt(x(coordinate[0]))*(width/_SimulationController.actSimStep));

                    gBurbujas.selectAll('.circleBck')
                        .style("display", "inline")
                        .attr("cy",function(d,i){
                            return y(data[i].data[Math.floor(x(coordinate[0]))].data);
                        })
                        .attr("cx",parseInt(x(coordinate[0]))*(width/_SimulationController.actSimStep));
                })
                .on("mouseout", function () {
                    d3.selectAll('.circleTxt').style("display", "none");
                    d3.selectAll('.line_over'+i).style("display", "none");
                    d3.selectAll('.rect_over').style("display", "none");
                    d3.selectAll('.texto').style("display", "none");
                    d3.selectAll('.circlePos').style("display", "none");
                    d3.selectAll('.circleBck').style("display", "none");
                });




        }, zoom: function ()
    {
        this.svg.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
    }
    };
