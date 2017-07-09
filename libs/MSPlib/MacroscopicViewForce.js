/**
 * @brief
 * @author  Juan Pedro Brito Mendez <juanpebm@gmail.com>
 * @date
 * @remarks Do not distribute without further notice.
 */

MSP.MacroscopicViewForce = function ()
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
    this.lado;
    this.enX;
    this.enY;
    this.selecting = false;
    this.idx = 0;
    this.context;
    this.translate0=0;
    this.translate1=0;
    this.scale=1;
    this.contextHidden;
    this.scaleBandHeight;
    this.figSize;

    this.posXA = [];
    this.posYA = [];
    this.indx = [];
    this.numNeurons = _SimulationData.gNeurons.length;
    this.lado = Math.sqrt((_SigletonConfig.width*_SigletonConfig.height)/this.numNeurons);
    this.enX = Math.floor(_SigletonConfig.width/this.lado);
    this.enY = Math.floor(_SigletonConfig.height/this.lado);

    for (var i = 0; i <= 2000; i++) {
        this.posXA.push((i%this.enX)*(this.lado));
    }

    var j = 1;
    var val = 0;
    while(j<=2000){
        this.posYA.push(val);
        if(j%this.enX===0){
            val+=(this.lado);
        }
        j++;
    }

    this.node =[];
    this.nodes = [];
    this.force = null;
    this.links = null;
    this.linkB = null;
    this.nodoB = null;
    this.linksPrev = {};
    this.linksPrevActual = {};
    this.t = 1;
    this.bounds = {minX:0,maxX:0,minY:0,maxY:0};
    this.rescaleY;
    this.rescaleX;
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

MSP.MacroscopicViewForce.prototype =
    {
        constructor: MSP.MacroscopicViewForce

        ,resize : function()
    {
        this.generateMacroscopicViewForce();
    },
        init :function ()
        {
            _SigletonConfig.shiftKey = false;

            _SimulationController.view.selecting=false;
            _SimulationFilter.createDummy();
            this.recalcultePositions();

        }
        ,generateMacroscopicViewForce :function ()
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
            .attr("height", _SigletonConfig.height-_SigletonConfig.scaleBandHeight)
            .attr("tabindex",1)
            .style("outline","none")
            .style("cursor","crosshair")
            .call(this.zoombehavior);

        _SigletonConfig.svgH = d3.select("body")
            .append("canvas")
            .attr("id","canvasHidden")
            .attr("width", 8000)
            .attr("height", 8000)
            .style("display","none");


        this.contextHidden = _SigletonConfig.svgH.node().getContext("2d");
        var context = _SigletonConfig.svg.node().getContext("2d");
        this.context = context;

        _SigletonConfig.svg.on('keydown', keyDown, false);
        _SigletonConfig.svg.on('keyup', keyUp, false);
        _SigletonConfig.svg.on('mousedown', mouseDown, false);
        _SigletonConfig.svg.on('mousemove', mouseMove, false);
        _SigletonConfig.svg.on('mouseup', mouseUp, false);

        rect = {};
        var  drag = false;
        //self.drawHidden();
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
                    var posX = d.PosX;
                    var posY = d.PosY;
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
            var color  = self.contextHidden.getImageData(self.rescaleX((d3.mouse(this)[0]-self.translate0)/self.scale), self.rescaleY((d3.mouse(this)[1]-self.translate1)/self.scale), 1, 1).data;
            if(color[3]===255) {
                var idx = _SimulationFilter.orderIndex[color[0] * 255 * 256 + color[1] * 256 + color[2]];
                var d = _SimulationData.gNeurons[idx];
                var posX = d3.mouse(this)[0]+50;
                var width = $("#tooltip").width();
                if((posX+width+50)>$(window).width()) posX -= width+20;

                d3.select("#tooltip")
                    .text(
                        "Id:" + d.NId
                        + " CaC=" + _SimulationData.gNeuronsDetails[d.NId].Calcium[lIndex]
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

        for (var i = 0; i < _SimulationData.gNeurons.length; i++) {
            var elem = _SimulationData.gNeurons[i];
            elem["PosX"] = 0;
            elem["PosY"] = 0;

        }
        this.nodesB = JSON.parse(JSON.stringify(_SimulationData.gNeurons));
        this.nodes = _SimulationData.gNeurons;

        var force = d3.layout.force()
            .size([ _SigletonConfig.width,  _SigletonConfig.height])
            .nodes( this.nodes)
            .linkStrength(1)
            .linkDistance(dist)
            .charge(charge)
            .gravity(0.05)
            .on("start",start)
        ;
        function dist(d)
        {
            var dista =  Math.pow((Math.min(d.source.weight , d.target.weight)+1),2) * 10;
            if(d.source.weight === 1 || d.target.weight === 1)
                return 10;
            else if(dista > 2000)

                return 2000;
            else
                return dista;
        }
        function charge(d)
        {
            if(d.weight === 0)
                return -100;
            else if(d.weight === 1)
                return -300;
            else
                return (d.weight+1) * -180;


        }
        this.force = force;
        // this.linkB = _SigletonConfig.svg.selectAll(".link");

        function start() {
            var ticksPerRender = 40;
            requestAnimationFrame(function render() {
                for (var i = 0; i < ticksPerRender && force.alpha() > 0; i++) {
                    force.tick();
                }

                if (force.alpha() > 0) {
                    requestAnimationFrame(render);
                }
            })
        }
        var self = this;

        force.on('end', function() {

            var timer = null;
            timer = d3.timer(function(elapsed) {

                if(elapsed>2000) {
                    elapsed-=2000;
                    const t = Math.min(1, d3.easeCubic(elapsed / 2000));
                    self.t = t;
                    _SimulationData.gNeurons.forEach(function (d, i) {
                        d.PosX = self.nodesB[i].PosX * (1 - t) + d.x * t;
                        d.PosY = self.nodesB[i].PosY * (1 - t) + d.y * t;
                    });

                    self.draw(t);


                    if (t === 1){
                        self.nodesB = JSON.parse(JSON.stringify(_SimulationData.gNeurons));
                        self.linksPrev = self.linksPrevActual;
                        self.drawHidden();
                        return true;

                    }
                }
            },50);

        });



        force.start();

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
    }, draw : function(timer) {

        var self = this;
        var context= this.context;
        context.setTransform(1, 0, 0, 1, 0, 0);
        context.clearRect(0,0,_SigletonConfig.width,_SigletonConfig.height);
        context.translate(_SimulationController.view.translate0,_SimulationController.view.translate1);
        context.scale(_SimulationController.view.scale,_SimulationController.view.scale);

        var lIndex = _SimulationController.actSimStep % _SimulationData.numSimStepsPerFile;
        context.lineWidth = this.figSize*0.6;

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
                        if(!self.linksPrev["i"+d[0]+" "+d[1]]) {
                            context.lineWidth = (self.figSize * 4 * (1 - self.t)) + (self.figSize * 0.6 * self.t);
                            context.globalAlpha = 1;
                        }
                        context.moveTo(_SimulationData.gNeurons[d[0]].PosX, _SimulationData.gNeurons[d[0]].PosY);
                        context.lineTo(_SimulationData.gNeurons[d[1]].PosX,_SimulationData.gNeurons[d[1]].PosY);
                        context.stroke();
                        context.lineWidth = self.figSize*0.6;
                        canvas_arrow(context, _SimulationData.gNeurons[d[0]].PosX, _SimulationData.gNeurons[d[0]].PosY,
                            _SimulationData.gNeurons[d[1]].PosX, _SimulationData.gNeurons[d[1]].PosY);
                        context.globalAlpha = 1;
                    });
                }

            }
        );

        var figureSize = this.figSize;
        _SimulationData.gNeurons.forEach(function (d, i) {

            var posX = d.PosX;
            var posY = d.PosY;
            if(timer===1) {
                if (posX < self.bounds["minX"]) self.bounds["minX"] = posX;
                else if (posX > self.bounds["maxX"]) self.bounds["maxX"] = posX;
                if (posY < self.bounds["minY"]) self.bounds["minY"] = posY;
                else if (posY > self.bounds["maxY"]) self.bounds["maxY"] = posY;
            }

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
        contextHidden.clearRect(0,0,_SigletonConfig.width,_SigletonConfig.height);
        var self = this;
        var figureSize = 10;
        this.rescaleX = d3.scale
            .linear()
            .domain([this.bounds.minX-figureSize,this.bounds.maxX+figureSize])
            .range([0,  8000]);

        this.rescaleY = d3.scale
            .linear()
            .domain([this.bounds.minY-figureSize,this.bounds.maxY+figureSize])
            .range([0, 8000]);
        _SimulationData.gNeurons.forEach(function (d, i) {
            contextHidden.fillStyle = self.toColor(i);
            contextHidden.fillRect( self.rescaleX(d.PosX-figureSize) , self.rescaleY(d.PosY-figureSize),figureSize*2.5,figureSize*1.5);
        });

    }, recalcultePositions: function()
    {
        var self = this;
        var width = _SigletonConfig.width;
        this.figSize = _SigletonConfig.height/100;
        var height = _SigletonConfig.height-_SigletonConfig.scaleBandHeight;
        this.lado = Math.sqrt((width*height)/_SimulationData.gNeurons.length);
        this.enX = Math.floor(width/this.lado);
        this.enY = Math.floor(height/this.lado);
        this.posXA=[];
        this.posYA=[];
        for (var i = 0; i <= _SimulationData.gNeurons.length; i++) {
            this.posXA.push((i%this.enX)*(this.lado)+9);
        }

        var j = 1;
        var val = 10;
        while(j<=_SimulationData.gNeurons.length){
            this.posYA.push(val);
            if(j%this.enX===0){
                val+=(this.lado);
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
        _SimulationData.gNeurons.forEach(function(d,i){
            d.posX = posXA2[i];
            d.posY = posYA2[i];

        });
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
        var self = this;
        var nodes = _SimulationController.view.nodes;
        var linksRAWEE = _SimulationData.gConnectivity.EE[_SimulationData.steps[_SimulationController.actSimStep]];
        var linksRAWEI = _SimulationData.gConnectivity.EI[_SimulationData.steps[_SimulationController.actSimStep]];
        var linksRAWIE = _SimulationData.gConnectivity.IE[_SimulationData.steps[_SimulationController.actSimStep]];
        var linksRAWII = _SimulationData.gConnectivity.II[_SimulationData.steps[_SimulationController.actSimStep]];
        var links = [];
        for (var i = 0;_SimulationData.drawEEConn && typeof linksRAWEE !== 'undefined' && i < linksRAWEE.length; i++) {
            links.push({source: nodes[linksRAWEE[i][0]], target: nodes[linksRAWEE[i][1]],  id:"i"+linksRAWEE[i][0]+" "+linksRAWEE[i][1],color:_SigletonConfig.EEColor});
        }

        for (i = 0;_SimulationData.drawIEConn && typeof linksRAWIE !== 'undefined' && i < linksRAWIE.length; i++) {
            links.push({source: nodes[linksRAWIE[i][0]], target: nodes[linksRAWIE[i][1]],  id:"i"+linksRAWIE[i][0]+" "+linksRAWIE[i][1],color:_SigletonConfig.IEColor});
        }

        for (i = 0;_SimulationData.drawEIConn &&  typeof linksRAWEI !== 'undefined' &&  i < linksRAWEI.length; i++) {
            links.push({source: nodes[linksRAWEI[i][0]], target: nodes[linksRAWEI[i][1]],  id:"i"+linksRAWEI[i][0]+" "+linksRAWEI[i][1],color:_SigletonConfig.EIColor});
        }

        for (i = 0;_SimulationData.drawIIConn && typeof linksRAWII !== 'undefined' && i < linksRAWII.length; i++) {
            links.push({source: nodes[linksRAWII[i][0]], target: nodes[linksRAWII[i][1]],  id:"i"+linksRAWII[i][0]+" "+linksRAWII[i][1],color:_SigletonConfig.IIColor});
        }
        this.linksPrevActual = {};
        links.forEach(function (d) { self.linksPrevActual[d.id] = true; });
        _SimulationController.view.force.links(links);
        this.t = 0;
        this.draw();
        _SimulationController.view.force.start();

    },

        updateVisualization: function ()
        {
            this.updateSynapticElements();
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
    };
