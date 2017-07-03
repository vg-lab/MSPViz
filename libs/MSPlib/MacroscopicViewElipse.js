/**
 * @brief
 * @author  Juan Pedro Brito Mendez <juanpebm@gmail.com>
 * @date
 * @remarks Do not distribute without further notice.
 */

MSP.MacroscopicViewElipse = function ()
{
    this.gConnectLoaded	=	false;

    this.selecting 		= 	false;

    this.brush;
    this.zoombehavior;

    this.EEconnectGroup;
    this.EIconnectGroup;
    this.IEconnectGroup;
    this.IIconnectGroup;
    this.figSize;
    this.MSPViewType="MacroV";
    this.x=0;
    this.posXA = [];
    this.posYA = [];
    this.indx = [];
    this.numNeurons = _SimulationData.gNeurons.length;
    this.idx = 0;
    this.centerNeurons;
};

function sortWithIndeces(arr) {
    var toSort = JSON.parse(JSON.stringify(arr));
    for (var i = 0; i < toSort.length; i++) {
        toSort[i] = [toSort[i], i];
    }
    toSort.sort(function(left, right) {
        return left[0] < right[0] ? -1 : 1;
    });
    toSort.sortIndices = [];
    for (var j = 0; j < toSort.length; j++) {
        toSort.sortIndices.push(toSort[j][1]);
        toSort[j] = toSort[j][0];
    }
    return toSort;
}

MSP.MacroscopicViewElipse.prototype =
    {
        constructor: MSP.MacroscopicViewElipse

        , resize: function () {
        this.generateMacroscopicViewElipse();
    },
        init: function () {
            _SimulationFilter.createDummy();
            this.recalcultePositions();
            this.scaleBandHeight = 65;
        }
        , update: function()
    {
        this.recalcultePositions();
        this.draw();
        this.drawHidden();
    },
        generateMacroscopicViewElipse :function ()
        {
            this.init();
            _SigletonConfig.gSelectionIds=[];

            d3.selectAll("svg").filter(function() {
                return !this.classList.contains('color')
            }).remove();

            d3.selectAll("canvas")
                .remove();

            this.createSampleBandColor(_SigletonConfig.calciumScheme);

            var self=this;
            self.idx = 0;

            this.zoombehavior = d3.behavior.zoom().scaleExtent([-Infinity, Infinity]).on("zoom", zoom);

            _SigletonConfig.svg = d3.select("#renderArea")
                .append("canvas")
                .attr("id","canvas")
                .attr("width", _SigletonConfig.width)
                .attr("height", _SigletonConfig.height-this.scaleBandHeight)
                .attr("tabindex",1)
                .style("cursor","crosshair")
                .call(this.zoombehavior);

            _SigletonConfig.svgH = d3.select("body")
                .append("canvas")
                .attr("id","canvasHidden")
                .attr("width", _SigletonConfig.width)
                .attr("height", _SigletonConfig.height)
                .style("display","none");


            this.contextHidden = _SigletonConfig.svgH.node().getContext("2d");
            var context = _SigletonConfig.svg.node().getContext("2d");
            this.context = context;
            var scale = d3.scale.linear()
                .range([0, 1200])
                .domain([0,1200]);


            _SigletonConfig.svg.on('keydown', keyDown, false);
            _SigletonConfig.svg.on('keyup', keyUp, false);
            _SigletonConfig.svg.on('mousedown', mouseDown, false);
            _SigletonConfig.svg.on('mousemove', mouseMove, false);
            _SigletonConfig.svg.on('mouseup', mouseUp, false);

            rect = {};
            var  drag = false;
            self.drawHidden();
            function keyDown(e) {
                _SigletonConfig.shiftKey = d3.event.shiftKey || d3.event.metaKey;
                if (_SigletonConfig.shiftKey) {
                    d3.select("#canvas").call(d3.behavior.zoom());
                    _SigletonConfig.svg.style("cursor","crosshair");
                }
                else if(d3.event.which === 27) {
                    self.selecting = false;
                    _SimulationData.gNeurons.forEach(function (d) {
                        d.previouslySelected = false;
                        d.selected = false;
                    });
                    self.draw();
                }

            }

            function keyUp(e) {
                _SigletonConfig.shiftKey = d3.event.shiftKey || d3.event.metaKey;
                d3.select("#canvas").call(self.zoombehavior);
                _SigletonConfig.svg.style("cursor","crosshair");

            }


            var self = this;
            var recti = {x:0,y:0,x2:0,y2:0};
            var down = false;
            function mouseDown(e) {
                if(_SigletonConfig.shiftKey) {
                    recti.x = d3.mouse(this)[0];
                    recti.y = d3.mouse(this)[1];
                    down = true;
                    var color  = self.contextHidden.getImageData(parseInt((d3.mouse(this)[0]-self.translate0)/self.scale,10), parseInt((d3.mouse(this)[1]-self.translate1)/self.scale,10), 1, 1).data;
                    if(color[3]===255) {
                        var idx = _SimulationFilter.orderIndex[color[0] * 255 * 256 + color[1] * 256 + color[2]];
                        _SimulationData.gNeurons[idx].selected = !_SimulationData.gNeurons[idx].selected ;
                        self.draw();
                    }
                }
                _SimulationData.gNeurons.forEach(function (d) {
                        d.previouslySelected = _SigletonConfig.shiftKey && d.selected;
                    }
                );


            }

            function mouseMove(e) {
                var lIndex = _SimulationController.actSimStep % _SimulationData.numSimStepsPerFile;
                if(down &&  _SigletonConfig.shiftKey) {
                    recti.x2 = d3.mouse(this)[0];
                    recti.y2 = d3.mouse(this)[1];
                    var x = (recti.x-self.translate0)/self.scale;
                    var y = (recti.y-self.translate1)/self.scale;
                    var x2 = (recti.x2-self.translate0)/self.scale;
                    var y2 = (recti.y2-self.translate1)/self.scale;

                    _SimulationData.gNeurons.forEach(function (d,i) {
                        var posX = self.posXA[d.index];
                        var posY = self.posYA[d.index];
                        //TODO: seleccionar solo selecionados
                        d.selected = d.previouslySelected ^
                            (Math.min(x,x2) <= posX
                            && posX < Math.max(x,x2)
                            && Math.min(y,y2) <= posY
                            && posY < Math.max(y,y2));
                    });

                    self.draw();
                    context.fillStyle="rgb(0,0,0)";

                    context.rect((recti.x-self.translate0)/self.scale, (recti.y-self.translate1)/self.scale, (recti.x2-self.translate0)/self.scale-(recti.x-self.translate0)/self.scale, (recti.y2-self.translate1)/self.scale-(recti.y-self.translate1)/self.scale);
                    context.stroke();
                    context.globalAlpha=0.1;
                    context.fill();
                    context.globalAlpha=1;

                }
                var color  = self.contextHidden.getImageData(parseInt((d3.mouse(this)[0]-self.translate0)/self.scale,10), parseInt((d3.mouse(this)[1]-self.translate1)/self.scale,10), 1, 1).data;
                if(color[3]===255) {
                    var idx = _SimulationFilter.orderIndex[color[0] * 255 * 256 + color[1] * 256 + color[2]];
                    var d = _SimulationData.gNeurons[idx];
                    var posX = d3.mouse(this)[0]+50;
                    var width = $("#tooltip").width();
                    if((posX+width+50)>$(window).width()) posX -= width+20;

                    d3.select("#tooltip")
                        .html(
                            "Id: <b>" + d.NId
                            + "</b><br> CaC= <b>" + _SimulationData.gNeuronsDetails[d.NId].Calcium[lIndex]+"</b>"
                        )
                        .style("left",posX + "px")
                        .style("top", d3.mouse(this)[1]+10 + "px");
                    d3.select("#tooltip").classed("hidden", false);
                }else
                {
                    d3.select("#tooltip").classed("hidden",true);
                }
            }

            function mouseUp(e) {
                _SimulationData.gNeurons.forEach(function (d, i) {
                    if (d.selected) {
                        _SigletonConfig.gSelectionIds.push(d.NId);
                    }
                    else {
                        removeA(_SigletonConfig.gSelectionIds, d.NId);
                    }
                });
                self.selecting = (_SigletonConfig.gSelectionIds.length > 0);
                self.draw();
                down = false;
            }

            $('body').on('contextmenu', '#canvas', function(e){ return false; });


            this.draw();
            var self = this;
            function zoom() {

                context.save();
                context.clearRect(0, 0, _SigletonConfig.width, _SigletonConfig.height);
                self.translate0 = d3.event.translate[0];
                self.translate1 = d3.event.translate[1];
                self.scale = d3.event.scale;

                self.draw();
                context.restore();

            }


        }, toColor: function(num) {
        num >>>= 0;
        var b = num & 0xFF,
            g = (num & 0xFF00) >>> 8,
            r = (num & 0xFF0000) >>> 16;
        return "rgb(" + [r, g, b].join(",") + ")";
    }, draw : function() {

        var self = this;
        var context= this.context;
        context.setTransform(1, 0, 0, 1, 0, 0);
        context.clearRect(0,0,_SigletonConfig.width,_SigletonConfig.height);
        context.translate(_SimulationController.view.translate0,_SimulationController.view.translate1);
        context.scale(_SimulationController.view.scale,_SimulationController.view.scale);

        var lIndex = _SimulationController.actSimStep % _SimulationData.numSimStepsPerFile;
        context.lineWidth = this.figSize*0.2;

        function canvas_arrow(context, fromx, fromy, tox, toy){

            var figureSize = self.figSize;
            var headlen = figureSize;
            var distFig = figureSize*2.5;
            var angle = Math.atan2(toy-fromy,tox-fromx);
            var dist = Math.sqrt(Math.pow(tox-fromx,2)+(Math.pow(toy-fromy,2)));
            var x1 = fromx+((-distFig/dist)*(fromx-tox));
            var y1 = fromy+((-distFig/dist)*(fromy-toy));
            var x2 = tox+((distFig/dist)*(fromx-tox));
            var y2 = toy+((distFig/dist)*(fromy-toy));
            context.beginPath();

            context.fillStyle = "#000";
            context.moveTo(x1, y1);
            context.lineTo(x1-headlen*Math.cos(angle-Math.PI/14),y1-headlen*Math.sin(angle-Math.PI/14));
            context.lineTo(x1-headlen*Math.cos(angle+Math.PI/14),y1-headlen*Math.sin(angle+Math.PI/14));
            context.lineTo(x1, y1);
            context.fill();

            context.beginPath();
            context.moveTo(x2, y2);
            context.lineTo(x2-headlen*Math.cos(angle-Math.PI/14),y2-headlen*Math.sin(angle-Math.PI/14));
            context.lineTo(x2-headlen*Math.cos(angle+Math.PI/14),y2-headlen*Math.sin(angle+Math.PI/14));
            context.lineTo(x2, y2);
            context.fill();
        }

        var data = [{draw:_SimulationData.drawEEConn, data:_SimulationData.gConnectivity.EE[_SimulationData.steps[_SimulationController.actSimStep]], color:_SigletonConfig.EEColor},
            {draw:_SimulationData.drawEIConn, data:_SimulationData.gConnectivity.EI[_SimulationData.steps[_SimulationController.actSimStep]], color:_SigletonConfig.EIColor},
            {draw:_SimulationData.drawIEConn, data:_SimulationData.gConnectivity.IE[_SimulationData.steps[_SimulationController.actSimStep]], color:_SigletonConfig.IEColor},
            {draw:_SimulationData.drawIIConn, data:_SimulationData.gConnectivity.II[_SimulationData.steps[_SimulationController.actSimStep]], color:_SigletonConfig.IIColor}];

        data.forEach(function (d, i) {
                var color = d.color;
                if ( d.draw
                    && typeof (d.data) !== "undefined") {
                    d.data.forEach(function (d, i) {

                        context.beginPath();
                        context.strokeStyle = "#777777";
                        context.globalAlpha = 0.1;
                        if ((self.selecting && (_SimulationData.gNeurons[d[0]].selected && _SigletonConfig.outgoingConn) || (_SimulationData.gNeurons[d[1]].selected && _SigletonConfig.incomingConn))
                            || (!self.selecting && (_SimulationFilter.gNeuronsFilterB[d[0]] || _SimulationFilter.gNeuronsFilterB[d[1]]))) {
                            context.globalAlpha = _SigletonConfig.macroVAlpha;
                            context.strokeStyle = color;
                        }
                        context.moveTo(self.posXA[_SimulationData.gNeurons[d[0]].index], self.posYA[_SimulationData.gNeurons[d[0]].index]);
                        context.lineTo(self.posXA[_SimulationData.gNeurons[d[1]].index], self.posYA[_SimulationData.gNeurons[d[1]].index]);
                        context.stroke();
                        canvas_arrow(context, self.posXA[_SimulationData.gNeurons[d[0]].index], self.posYA[_SimulationData.gNeurons[d[0]].index],
                            self.posXA[_SimulationData.gNeurons[d[1]].index], self.posYA[_SimulationData.gNeurons[d[1]].index]);
                        context.globalAlpha = 1;


                    });
                }

            }
        );

        var figureSize = this.figSize;
        _SimulationData.gNeurons.forEach(function (d, i) {

            var posX = self.posXA[d.index];
            var posY = self.posYA[d.index];
            context.lineWidth = figureSize*10/100;
            context.globalAlpha = 1;
            if(d.NAct === "E")
                context.fillStyle=_SimulationData.CaEScale(_SimulationData.gNeuronsDetails[d.NId].Calcium[lIndex]);
            else
                context.fillStyle=_SimulationData.CaIScale(_SimulationData.gNeuronsDetails[d.NId].Calcium[lIndex]);

            if((!d.selected && self.selecting) || (!_SimulationFilter.gNeuronsFilterB[d.NId])) {
                context.fillStyle = "#434343";
                context.globalAlpha = 0.1;
            }

            context.strokeStyle="#000";

            if (d.NAct === "E") {
                context.beginPath();
                context.moveTo(posX -figureSize, posY + figureSize );
                context.lineTo(posX , posY-figureSize );
                context.lineTo(posX + figureSize, posY  + figureSize);
                context.fill();
                context.lineTo(posX -figureSize, posY + figureSize);
                context.lineTo(posX , posY-figureSize );
                context.stroke();
            } else {
                context.beginPath();
                context.arc(posX, posY,figureSize,0,2*Math.PI);
                context.fill();
                context.beginPath();
                context.arc(posX, posY,figureSize,0,2*Math.PI);
                context.stroke();
            }

        });
    },drawHidden : function()
    {
        var contextHidden= this.contextHidden;
        var self = this;
        var figureSize = this.figSize;
        _SimulationData.gNeurons.forEach(function (d, i) {
            contextHidden.fillStyle = self.toColor(i);
            contextHidden.fillRect(d.PosX - 2*figureSize,d.PosY - 2*figureSize,figureSize*4,figureSize*4);
        });

    }, recalcultePositions: function()
    {
        var self = this;
        this.figSize = _SigletonConfig.height/1000;
        var radius = _SigletonConfig.height-50;

        var selected = [];
        var nonSelected = [];

        _SimulationData.gNeurons.forEach(function(d){
            if(d.centerElipse) selected.push(d.NId);
            else  nonSelected.push(d.NId);
        });

        var step = 2*Math.PI/selected.length;
        var h = _SigletonConfig.width/2;
        var k = (_SigletonConfig.height-50)/2;
        var r = radius/4;
        this.posXA = [];
        this.posYA = [];
        for(var theta=0;  theta < 2*Math.PI && selected.length > 0;  theta+=step) {
            var x = h + r*Math.cos(theta);
            var y = k - 0.47 * r*Math.sin(theta);
            this.posXA.push(x);
            this.posYA.push(y);
        }

        var step = 2*Math.PI/nonSelected.length;
        var r = radius;

        for(var theta=0;  theta < 2*Math.PI;  theta+=step) {
            var x = h + r*Math.cos(theta);
            var y = k - 0.47 * r*Math.sin(theta);
            this.posXA.push(x);
            this.posYA.push(y);
        }

        selected.forEach(function (d,i) {
            _SimulationData.gNeurons[d].PosX = self.posXA[i];
            _SimulationData.gNeurons[d].PosY = self.posYA[i];
        });

        nonSelected.forEach(function (d,i) {
            _SimulationData.gNeurons[d].PosX = self.posXA[i+selected.length];
            _SimulationData.gNeurons[d].PosY = self.posYA[i+selected.length];
        });

    }, sortNeuronsByCa: function ()
    {
        var lIndex = _SimulationController.actSimStep % _SimulationData.numSimStepsPerFile;
        var self = _SimulationController.view;
        self.idx = 0;
        var calcios = [];
        for(var i = 0; i<_SimulationData.gNeuronsDetails.length;i++)
            calcios.push(_SimulationData.gNeuronsDetails[i].Calcium[lIndex])
        var sorted = sortWithIndeces(calcios).sortIndices;
        var posXA2 =self.posXA.slice(0);
        var posYA2 =self.posYA.slice(0);
        for(i = 0; i<sorted.length;i++){
            posXA2[sorted[i]] = self.posXA[i];
            posYA2[sorted[i]] = self.posYA[i];
        }
        _SimulationData.gNeuronsRep.attr("transform", function (d) {

                d.PosX = posXA2[self.idx];
                d.PosY = posYA2[self.idx];
                self.idx += 1;
                return "translate(" + d.PosX + "," + d.PosY + ")";
            }
        )
    }, unSortNeuronsByCa: function ()
    {

        var self = _SimulationController.view;
        self.idx = 0;
        _SimulationData.gNeuronsRep.attr("transform", function (d) {

                d.PosX = self.posXA[self.idx];
                d.PosY = self.posYA[self.idx];
                self.idx += 1;
                return "translate(" + d.PosX + "," + d.PosY + ")";
            }
        )
    }, updateSynapticElements: function ()
    {

        this.gConnectLoaded=true;
    }, updateCalcium: function ()
    {

        this.draw();


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

                    d3.select("svg").call(d3.behavior.zoom());
                }
            }
        },

        keyUp: function ()
        {
            _SigletonConfig.shiftKey = d3.event.shiftKey || d3.event.metaKey;

            _SimulationController.view.selecting=false;
            d3.select("g.brush").style("opacity", 0.0);

            d3.select("svg").call(_SimulationController.view.zoombehavior);

        },

        zoom: function ()
        {
            if (!_SigletonConfig.shiftKey) {
                _SigletonConfig.svg.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
            }
        }
        ,createSampleBandColor: function(interpolator)
    {

        var self = this;

        var svgContainer = d4.select("#colorSampleBand").append("svg")
            .attr("x",0).attr("y",20)
            .attr("width", _SigletonConfig.width)
            .attr("height", 60);
        var z = d4.scaleSequential(d4["interpolate"+interpolator]);
        var lg = svgContainer.append("defs").append("linearGradient")
            .attr("id", "mygrad2")
            .attr("x1", "0%")
            .attr("x2", "100%")
            .attr("y1", "0%")
            .attr("y2", "0%")
        ;
        for(var i = 0; i<=20; i++) {
            lg.append("stop")
                .attr("offset", (i*5)+"%")
                .style("stop-color", z(i/20))
                .style("stop-opacity", 1);
        }

        var rectangle = svgContainer.append("rect")
            .attr("id","boix2")
            .attr("height", 20)
            .attr("y", 22)
            .attr("x", 10)
            .attr("width", _SigletonConfig.width-20)
            .attr("fill","url(#mygrad2)");

        var x = d3.scale.linear().range([ 0, _SigletonConfig.width-20]).domain([_SimulationData.minICalciumValue, _SimulationData.maxICalciumValue]);
        var xE = d3.scale.linear().range([ 0, _SigletonConfig.width-20]).domain([_SimulationData.minECalciumValue, _SimulationData.maxECalciumValue]);
        var xInverted = d3.scale.linear().range([_SimulationData.minICalciumValue, _SimulationData.maxICalciumValue]).domain([ 10, _SigletonConfig.width-10]);
        var xAxis = d3.svg.axis().scale(x).orient("bottom").tickValues(x.ticks().concat(x.domain())).tickSize(-10);
        var xAxisE = d3.svg.axis().scale(xE).orient("top").tickValues(xE.ticks().concat(xE.domain())).tickSize(-10);

        svgContainer.append("g")
            .attr("class", "x axis E")
            .attr("transform", "translate(10,45)")
            .call(xAxis);

        svgContainer.append("g")
            .attr("class", "x axis I")
            .attr("transform", "translate(10,18)")
            .call(xAxisE);

        $(".x.axis.I text").first().css("text-anchor","start");
        $(".x.axis.E text").first().css("text-anchor","start");
        $(".x.axis.I text").last().css("text-anchor","end");
        $(".x.axis.E text").last().css("text-anchor","end");

    }
    };

/*
 var self = this;
 this.figSize = _SigletonConfig.height/1000;
 var radius = _SigletonConfig.height-50;

 var selected = [];
 var nonSelected = [];

 _SimulationFilter.gNeuronsFilter.forEach(function(z){
 var d = _SimulationData.gNeurons[z];
 if(d.selected) selected.push(z);
 else  nonSelected.push(z);
 });

 var step = 2*Math.PI/selected.length;
 var h = _SigletonConfig.width/2;
 var k = (_SigletonConfig.height-50)/2;
 var r = radius/4;
 this.posXA = [];
 this.posYA = [];
 for(var theta=0;  theta < 2*Math.PI && selected.length > 0;  theta+=step)
 { var x = h + r*Math.cos(theta);
 var y = k - 1 * r*Math.sin(theta);    //note 2.
 this.posXA.push(x);
 this.posYA.push(y);
 }


 var step = 2*Math.PI/(nonSelected.length*0.2);  // see note 1
 var r = radius;
 var yIni = k - 1 * r*Math.sin(theta);
 for(var theta=Math.PI/2;  theta < 1.5*Math.PI;  theta+=step)
 { var x = h + r*Math.cos(theta);
 var y = k - 1 * r*Math.sin(theta);    //note 2.
 this.posXA.push(x);
 this.posYA.push(y);
 }
 var yFin = y = k - 1 * r*Math.sin(theta);

 selected.forEach(function (d,i) {
 _SimulationData.gNeurons[d].PosX = self.posXA[i];
 _SimulationData.gNeurons[d].PosY = self.posYA[i];
 });

 nonSelected.forEach(function (d,i) {
 _SimulationData.gNeurons[d].PosX = self.posXA[i+selected.length];
 _SimulationData.gNeurons[d].PosY = self.posYA[i+selected.length];
 });*/
