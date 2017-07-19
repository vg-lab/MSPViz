/**
 * @brief
 * @author  Juan Pedro Brito Mendez <juanpebm@gmail.com>
 * @date
 * @remarks Do not distribute without further notice.
 */

MSP.MacroscopicViewGrid = function ()
{
    this.gConnectLoaded	=	false;

    this.selecting 		= 	false;

    this.brush;
    this.zoombehavior;

    this.EEconnectGroup;
    this.EIconnectGroup;
    this.IEconnectGroup;
    this.IIconnectGroup;
    this.actSim = 0;
    this.indX = 0;
    this.MSPViewType="MacroV";
    this.x=0;
    this.posXA = [];
    this.posYA = [];
    this.indx = [];
    this.numNeurons = _SimulationData.gNeurons.length;
    this.squareSideLength;
    this.horizontalPositionsNum;
    this.verticalPositionsNum;
    this.selecting = false;
    this.idx = 0;
    this.context;
    this.translateX=0;
    this.translateY=0;
    this.scale=1;
    this.hiddenCanvasContext;
    this.scaleBandHeight;
    this.sizeRatio;
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

MSP.MacroscopicViewGrid.prototype =
    {
        constructor: MSP.MacroscopicViewGrid

        ,resize : function()
    {
        this.generateMacroscopicViewGrid();
    },
        init :function ()
        {
            _SimulationFilter.createDummy();
            this.recalcultePositions();
        }
        ,generateMacroscopicViewGrid :function ()
    {
        this.init();
        _SigletonConfig.gSelectionIds=[];

        d3.selectAll("svg").filter(function() {
            return !this.classList.contains('color')
        }).remove();

        d3.selectAll("canvas")
            .remove();

        var self=this;
        self.idx = 0;

        this.zoombehavior = d3.behavior.zoom().scaleExtent([-Infinity, Infinity]).on("zoom", zoom);

        _SigletonConfig.svg = d3.select("#renderArea")
            .append("canvas")
            .attr("id","canvas")
            .attr("width", _SigletonConfig.width)
            .attr("height", _SigletonConfig.height)
            .attr("tabindex",1)
            .style("cursor","crosshair")
            .call(this.zoombehavior);

        _SigletonConfig.svgH = d3.select("body")
            .append("canvas")
            .attr("id","canvasHidden")
            .attr("width", _SigletonConfig.width)
            .attr("height", _SigletonConfig.height)
            .style("display","none");


        this.hiddenCanvasContext = _SigletonConfig.svgH.node().getContext("2d");
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
                var color  = self.hiddenCanvasContext.getImageData(parseInt((d3.mouse(this)[0]-self.translateX)/self.scale,10), parseInt((d3.mouse(this)[1]-self.translateY)/self.scale,10), 1, 1).data;
                if(color[3]===255) {
                    _SimulationData.gNeurons[color[0] * 255 * 256 + color[1] * 256 + color[2]].selected = !_SimulationData.gNeurons[color[0] * 255 * 256 + color[1] * 256 + color[2]].selected ;
                    self.draw();
                }
            }
            _SimulationData.gNeurons.forEach(function (d) {
                    d.previouslySelected = _SigletonConfig.shiftKey && d.selected;
                }
            );

            if(parseInt(d3.mouse(this)[0])<=40 && parseInt(d3.mouse(this)[0])<=40)
            {
                self.zoombehavior.translate([0,0]).scale(1);
                context.save();
                context.clearRect(0, 0, _SigletonConfig.width, _SigletonConfig.height);
                self.translateX = 0;
                self.translateY = 0;
                self.scale =1;
                self.draw();
                context.restore();
            }


        }


        function mouseMove(e) {
            var lIndex = _SimulationController.actSimStep % _SimulationData.numSimStepsPerFile;
            if(down &&  _SigletonConfig.shiftKey) {
                recti.x2 = d3.mouse(this)[0];
                recti.y2 = d3.mouse(this)[1];
                var x = (recti.x-self.translateX)/self.scale;
                var y = (recti.y-self.translateY)/self.scale;
                var x2 = (recti.x2-self.translateX)/self.scale;
                var y2 = (recti.y2-self.translateY)/self.scale;

                _SimulationFilter.gNeuronsFilter.forEach(function (z) {
                    var d = _SimulationData.gNeurons[z];
                    d.selected = d.previouslySelected ^
                        (Math.min(x,x2) <= d.PosX
                        && d.PosX < Math.max(x,x2)
                        && Math.min(y,y2) <= d.PosY
                        && d.PosY < Math.max(y,y2));
                });

                self.draw();
                context.fillStyle="rgb(0,0,0)";

                context.rect((recti.x-self.translateX)/self.scale, (recti.y-self.translateY)/self.scale, (recti.x2-self.translateX)/self.scale-(recti.x-self.translateX)/self.scale, (recti.y2-self.translateY)/self.scale-(recti.y-self.translateY)/self.scale);
                context.stroke();
                context.globalAlpha=0.1;
                context.fill();
                context.globalAlpha=1;

            }
            self.draw();
            var color = context.getImageData(parseInt(d3.mouse(this)[0]), parseInt(d3.mouse(this)[1]), 1, 1).data;
            //TODO: cambiar condicion por colores
            if ((color[0] + color[1] + color[2]) < 600) {
                self.draw(parseInt(parseInt((d3.mouse(this)[0] - self.translateX) / self.scale, 10) / 7),parseInt(parseInt((d3.mouse(this)[1] - self.translateY) / self.scale, 10) / 7));
                var posX = d3.mouse(this)[0]+60;
                var width = $("#tooltip").width();
                if((posX+width+50)>$(window).width()) posX -= width+20;

                d3.select("#tooltip")
                    .style("left",posX + "px")
                    .style("top", d3.mouse(this)[1] +10+ "px")
                    .html(
                        "From: <b>" + _SimulationFilter.orderIndex[parseInt(parseInt((d3.mouse(this)[1] - self.translateX) / self.scale, 10) / 7)]
                        + "</b><br> To: <b>" + _SimulationFilter.orderIndex[parseInt(parseInt((d3.mouse(this)[0] - self.translateY) / self.scale, 10) / 7)]+"</b>"
                    );
                d3.select("#tooltip").classed("hidden", false);
            } else {
                d3.select("#tooltip").classed("hidden", true);
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
            self.translateX =  Math.max(Math.min(d3.event.translate[0],40),((-_SimulationData.gNeurons.length*7)+_SigletonConfig.width)*d3.event.scale);
            self.translateY =   Math.max(Math.min(d3.event.translate[1],40),((-_SimulationData.gNeurons.length*7)+_SigletonConfig.height)*d3.event.scale);
            self.zoombehavior.translate([self.translateX,self.translateY]).scale(d3.event.scale);
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
    }, draw : function(x, y) {
        var self = this;
        var context= this.context;
        context.setTransform(1, 0, 0, 1, 0, 0);
        context.clearRect(0,0,_SigletonConfig.width,_SigletonConfig.height);
        context.translate(_SimulationController.view.translateX,_SimulationController.view.translateY);
        context.scale(_SimulationController.view.scale,_SimulationController.view.scale);

        var lIndex = _SimulationController.actSimStep % _SimulationData.numSimStepsPerFile;
        context.lineWidth = this.sizeRatio*0.2;




        var data = [
            {draw:_SimulationData.drawEEConn, data:_SimulationData.gConnectivity.EE[_SimulationData.steps[_SimulationController.actSimStep]], color:_SigletonConfig.EEColor},
            {draw:_SimulationData.drawEIConn, data:_SimulationData.gConnectivity.EI[_SimulationData.steps[_SimulationController.actSimStep]], color:_SigletonConfig.EIColor},
            {draw:_SimulationData.drawIEConn, data:_SimulationData.gConnectivity.IE[_SimulationData.steps[_SimulationController.actSimStep]], color:_SigletonConfig.IEColor},
            {draw:_SimulationData.drawIIConn, data:_SimulationData.gConnectivity.II[_SimulationData.steps[_SimulationController.actSimStep]], color:_SigletonConfig.IIColor}];

        context.fillStyle = "#ffffff";

        context.beginPath();
        context.rect(0,0,_SimulationData.gNeurons.length*8,_SimulationData.gNeurons.length*8);
        context.fill();
        context.fillStyle = "#dfdfdf";
        context.beginPath();
        context.rect(-(_SimulationController.view.translateX/_SimulationController.view.scale),(y*7)+1,_SigletonConfig.width/_SimulationController.view.scale,6);
        context.fill();
        context.beginPath();
        context.rect((x*7)+1,-(_SimulationController.view.translateY/_SimulationController.view.scale),6,_SigletonConfig.height/_SimulationController.view.scale);
        context.fill();

        context.fillStyle = "#dfdfdf";
        for(var z = 0; z<=_SimulationData.gNeurons.length;z++)
        {

            context.beginPath();
            context.rect(0,(z*7),_SimulationData.gNeurons.length*7,1);
            context.fill();

            context.beginPath();
            context.rect((z*7),0,1,_SimulationData.gNeurons.length*7);
            context.fill();
        }

        data.forEach(function (d, i) {
                var color = d.color;
                if ( d.draw
                    && typeof (d.data) !== "undefined") {
                    d.data.forEach(function (d) {
                        context.fillStyle = "#777777";
                        if(_SimulationFilter.gNeuronsFilterB[d[0]] || _SimulationFilter.gNeuronsFilterB[d[1]])
                            context.fillStyle = color;
                        context.beginPath();
                        context.rect((_SimulationData.gNeurons[d[1]].index*7)+1,(_SimulationData.gNeurons[d[0]].index*7)+1,6,6);
                        context.fill();
                        context.globalAlpha = 1;

                    });
                }

            }
        );

        var figureSize = this.sizeRatio;




        context.fillStyle = "#ffffff";
        context.beginPath();
        context.rect(-(_SimulationController.view.translateX/_SimulationController.view.scale),
            -((_SimulationController.view.translateY)/_SimulationController.view.scale),_SigletonConfig.width/_SimulationController.view.scale,40/_SimulationController.view.scale);
        context.fill();


        context.beginPath();
        context.rect(-(_SimulationController.view.translateX/_SimulationController.view.scale),
            -((_SimulationController.view.translateY)/_SimulationController.view.scale),40/_SimulationController.view.scale,_SigletonConfig.height/_SimulationController.view.scale);

        context.fill();
        context.textBaseline = "middle";
        var fontsize = 16/_SimulationController.view.scale;
        context.font = fontsize+"px normal normal normal sans-serif";
        context.fillStyle = "#000";
        for(var k = 0; k<_SimulationData.gNeurons.length; k+= Math.min(Math.max(Math.round(4/_SimulationController.view.scale),1),_SimulationData.gNeurons.length/4)) {
            context.rotate(-Math.PI / 2);
            context.fillText(_SimulationFilter.orderIndex[k], ((_SimulationController.view.translateY-32)/_SimulationController.view.scale), ((k+1) * 7)-2.5);
            context.rotate(Math.PI / 2);
            context.fillText(_SimulationFilter.orderIndex[k], -(_SimulationController.view.translateX/_SimulationController.view.scale)+((30/(_SimulationFilter.orderIndex[k].toString().length*2))+5)/_SimulationController.view.scale, ((k+1) * 7) -2.5);
            context.beginPath();
            context.rect( -((_SimulationController.view.translateX-36)/_SimulationController.view.scale), ((k+1) * 7) -2.5,4/_SimulationController.view.scale,1/_SimulationController.view.scale);
            context.rect( ((k+1) * 7) -2.5,-((_SimulationController.view.translateY-36)/_SimulationController.view.scale),1/_SimulationController.view.scale,4/_SimulationController.view.scale);
            context.fill();
        }
        context.fillStyle = "#f5f5f5";
        context.beginPath();
        context.rect(-(_SimulationController.view.translateX/_SimulationController.view.scale),
            -((_SimulationController.view.translateY)/_SimulationController.view.scale),40/_SimulationController.view.scale,40/_SimulationController.view.scale);
        context.fill();

        context.fillStyle = "#000000";
        context.beginPath();
        context.moveTo(-((_SimulationController.view.translateX)/_SimulationController.view.scale),
            -((_SimulationController.view.translateY-40)/_SimulationController.view.scale));
        context.lineTo(-((_SimulationController.view.translateX-40-_SigletonConfig.width)/_SimulationController.view.scale),
            -((_SimulationController.view.translateY-40)/_SimulationController.view.scale));
        context.lineWidth = 1/_SimulationController.view.scale;
        context.stroke();

        context.beginPath();
        context.moveTo(-((_SimulationController.view.translateX-40)/_SimulationController.view.scale),
            -((_SimulationController.view.translateY)/_SimulationController.view.scale));
        context.lineTo(-((_SimulationController.view.translateX-40)/_SimulationController.view.scale),
            -((_SimulationController.view.translateY-40-_SigletonConfig.height)/_SimulationController.view.scale));
        context.lineWidth = 1/_SimulationController.view.scale;
        context.stroke();

        context.fillText("home", -((_SimulationController.view.translateX)/_SimulationController.view.scale), -((_SimulationController.view.translateY-20)/_SimulationController.view.scale));

    },drawHidden : function()
    {
        var contextHidden= this.hiddenCanvasContext;
        var self = this;
        var figureSize = this.sizeRatio;
        _SimulationFilter.gNeuronsFilter.forEach(function (z, i) {
            var d = _SimulationData.gNeurons[z];
            var colorHexString = self.toColor(i);
            contextHidden.fillStyle = colorHexString;
            contextHidden.fillRect(d.PosX - figureSize,d.PosY - figureSize,figureSize*2,figureSize*2);
        });



    }, recalcultePositions: function()
    {
        var self = this;
        var width = _SigletonConfig.width;
        this.sizeRatio = _SigletonConfig.height/180;
        var height = _SigletonConfig.height;
        this.squareSideLength = Math.sqrt((width*height)/_SimulationData.gNeurons.length);
        this.horizontalPositionsNum = Math.floor(width/this.squareSideLength);
        this.verticalPositionsNum = Math.floor(height/this.squareSideLength);
        this.posXA=[];
        this.posYA=[];
        for (var i = 0; i <= _SimulationData.gNeurons.length; i++) {
            this.posXA.push((i%this.horizontalPositionsNum)*(this.squareSideLength)+9);
        }

        var j = 1;
        var val = 10;
        while(j<=_SimulationData.gNeurons.length){
            this.posYA.push(val);
            if(j%this.horizontalPositionsNum===0){
                val+=(this.squareSideLength);
            }
            j++;
        }

        _SimulationData.gNeurons.forEach(function (d,i) {
            d.PosX = self.posXA[i];
            d.PosY = self.posYA[i];
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
