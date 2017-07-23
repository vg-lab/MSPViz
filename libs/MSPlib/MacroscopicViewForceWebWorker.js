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
    this.squareSideLength;
    this.horizontalPositionsNum;
    this.verticalPositionsNum;
    this.selecting = false;
    this.idx = 0;
    this.context;
    this.translateX=0;
    this.translateY=0;
    this.scale=1;
    this.scaleBandHeight;
    this.sizeRatio;

    this.posXA = [];
    this.posYA = [];
    this.indx = [];
    this.numNeurons = _SimulationData.gNeurons.length;
    this.squareSideLength = Math.sqrt((_SigletonConfig.width*_SigletonConfig.height)/this.numNeurons);
    this.horizontalPositionsNum = Math.floor(_SigletonConfig.width/this.squareSideLength);
    this.verticalPositionsNum = Math.floor(_SigletonConfig.height/this.squareSideLength);

    for (var i = 0; i <= 2000; i++) {
        this.posXA.push((i%this.horizontalPositionsNum)*(this.squareSideLength));
    }

    var j = 1;
    var val = 0;
    while(j<=2000){
        this.posYA.push(val);
        if(j%this.horizontalPositionsNum===0){
            val+=(this.squareSideLength);
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
    this.worker;
};

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

        var self=this;
        self.idx = 0;

        this.zoombehavior = d3.behavior.zoom().scaleExtent([-Infinity, Infinity]).on("zoom", zoom);

        _SigletonConfig.svg = d3.select("#renderArea")
            .append("canvas")
            .attr("id","canvas")
            .attr("width", _SigletonConfig.width)
            .attr("height", _SigletonConfig.height)
            .attr("tabindex",1)
            .style("outline","none")
            .style("cursor","crosshair")
            .call(this.zoombehavior);



        var context = _SigletonConfig.svg.node().getContext("2d");
        this.context = context;

        _SigletonConfig.svg.on('keydown', keyDown, false);
        _SigletonConfig.svg.on('keyup', keyUp, false);
        _SigletonConfig.svg.on('mousedown', mouseDown, false);
        _SigletonConfig.svg.on('mousemove', mouseMove, false);
        _SigletonConfig.svg.on('mouseup', mouseUp, false);

        rect = {};
        var  drag = false;

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
                var sizeRatio = self.sizeRatio;

                var x = (d3.mouse(this)[0] - self.translateX) / self.scale;
                var y = (d3.mouse(this)[1] - self.translateY) / self.scale;


                var minX = x - sizeRatio;
                var maxX = x + sizeRatio;
                var minY = y - sizeRatio;
                var maxY = y + sizeRatio;
                var found = false;
                var idx = -1;
                var length = _SimulationData.gNeurons.length;

                for (var i = 0; i < length; i++) {
                    var d = _SimulationData.gNeurons[i];
                    if (d.PosX >= minX && d.PosX <= maxX && d.PosY >= minY && d.PosY <= maxY) {
                        found = true;
                        idx = i;
                        break;
                    }
                }
                if(found){
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
                var x = (recti.x-self.translateX)/self.scale;
                var y = (recti.y-self.translateY)/self.scale;
                var x2 = (recti.x2-self.translateX)/self.scale;
                var y2 = (recti.y2-self.translateY)/self.scale;

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

                context.rect((recti.x-self.translateX)/self.scale, (recti.y-self.translateY)/self.scale, (recti.x2-self.translateX)/self.scale-(recti.x-self.translateX)/self.scale, (recti.y2-self.translateY)/self.scale-(recti.y-self.translateY)/self.scale);
                context.stroke();
                context.globalAlpha=0.1;
                context.fill();
                context.globalAlpha=1;

            }
            var sizeRatio = self.sizeRatio;

            var x = (d3.mouse(this)[0] - self.translateX) / self.scale;
            var y = (d3.mouse(this)[1] - self.translateY) / self.scale;


            var minX = x - sizeRatio;
            var maxX = x + sizeRatio;
            var minY = y - sizeRatio;
            var maxY = y + sizeRatio;
            var found = false;
            var idx = -1;
            var length = _SimulationData.gNeurons.length;

            for (var i = 0; i < length; i++) {
                var d = _SimulationData.gNeurons[i];
                if (d.PosX >= minX && d.PosX <= maxX && d.PosY >= minY && d.PosY <= maxY) {
                    found = true;
                    idx = i;
                    break;
                }
            }
            if (found) {
                var d = _SimulationData.gNeurons[idx];
                var tooltipX = d3.mouse(d3.select('body').node())[0];
                var tooltipWidth = $("#tooltip").outerWidth();

                if ((tooltipX + tooltipWidth) > $(window).width())
                    tooltipX -= tooltipWidth;

                d3.select("#tooltip")
                    .html(
                        "Id: <b>" + d.NId
                        + "</b><br> CaC= <b>" + _SimulationData.gNeuronsDetails[d.NId].Calcium[lIndex] + "</b>"
                    )
                    .style("left", tooltipX + "px")
                    .style("top", d3.mouse(this)[1] + 10 + "px")
                    .classed("hidden", false);
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

        _SimulationData.gNeurons.forEach(function (d) {
            d.PosX = _SigletonConfig.width * 0.5;
            d.PosY = _SigletonConfig.height * 0.5;
        });

        this.nodesB = JSON.parse(JSON.stringify(_SimulationData.gNeurons));
        this.nodes = _SimulationData.gNeurons;


        var self = this;
        this.worker = new Worker('./libs/MSPlib/forceWorker.js');
        this.worker.postMessage({
            type:"init",
            width: _SigletonConfig.width,
            height: _SigletonConfig.height,
            nodes: self.nodes,
            links: [],
            step:_SimulationController.actSimStep
        });

        this.worker.onmessage =  function(event) {


            event.data.nodes.forEach(function (d, i) {
                _SimulationData.gNeurons[i].x = d.x;
                _SimulationData.gNeurons[i].y = d.y;
                _SimulationData.gNeurons[i].px = d.px;
                _SimulationData.gNeurons[i].py = d.py;
            });
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

                        return true;

                    }
                }
            },50);

        };



        this.draw();
        var self = this;
        function zoom() {

            context.save();
            context.clearRect(0, 0, _SigletonConfig.width, _SigletonConfig.height);
            self.translateX = d3.event.translate[0];
            self.translateY = d3.event.translate[1];
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
        context.translate(_SimulationController.view.translateX,_SimulationController.view.translateY);
        context.scale(_SimulationController.view.scale,_SimulationController.view.scale);

        var lIndex = _SimulationController.actSimStep % _SimulationData.numSimStepsPerFile;
        context.lineWidth = this.sizeRatio*0.6;

        function canvas_arrow(context, fromx, fromy, tox, toy){

            var figureSize = self.sizeRatio;
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
                            context.lineWidth = (self.sizeRatio * 4 * (1 - self.t)) + (self.sizeRatio * 0.6 * self.t);
                            context.globalAlpha = (1 - self.t)+_SigletonConfig.macroVAlpha*self.t;
                        }
                        context.moveTo(_SimulationData.gNeurons[d[0]].PosX, _SimulationData.gNeurons[d[0]].PosY);
                        context.lineTo(_SimulationData.gNeurons[d[1]].PosX,_SimulationData.gNeurons[d[1]].PosY);
                        context.stroke();
                        context.lineWidth = self.sizeRatio*0.6;
                        canvas_arrow(context, _SimulationData.gNeurons[d[0]].PosX, _SimulationData.gNeurons[d[0]].PosY,
                            _SimulationData.gNeurons[d[1]].PosX, _SimulationData.gNeurons[d[1]].PosY);
                        context.globalAlpha = 1;
                    });
                }

            }
        );

        var figureSize = this.sizeRatio;
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
    }, recalcultePositions: function()
    {
        var self = this;
        var width = _SigletonConfig.width;
        this.sizeRatio = _SigletonConfig.height/100;
        var height = _SigletonConfig.height-_SigletonConfig.scaleBandHeight;
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
        var nodes = _SimulationData.gNeurons;
        var linksRAWEE = _SimulationData.gConnectivity.EE[_SimulationData.steps[_SimulationController.actSimStep]];
        var linksRAWEI = _SimulationData.gConnectivity.EI[_SimulationData.steps[_SimulationController.actSimStep]];
        var linksRAWIE = _SimulationData.gConnectivity.IE[_SimulationData.steps[_SimulationController.actSimStep]];
        var linksRAWII = _SimulationData.gConnectivity.II[_SimulationData.steps[_SimulationController.actSimStep]];
        var links = [];
        for (var i = 0;_SimulationData.drawEEConn && typeof linksRAWEE !== 'undefined' && i < linksRAWEE.length; i++) {
            links.push({source: linksRAWEE[i][0], target: linksRAWEE[i][1],  id:"i"+linksRAWEE[i][0]+" "+linksRAWEE[i][1],color:_SigletonConfig.EEColor});
        }

        for (i = 0;_SimulationData.drawIEConn && typeof linksRAWIE !== 'undefined' && i < linksRAWIE.length; i++) {
            links.push({source: linksRAWIE[i][0], target: linksRAWIE[i][1],  id:"i"+linksRAWIE[i][0]+" "+linksRAWIE[i][1],color:_SigletonConfig.IEColor});
        }

        for (i = 0;_SimulationData.drawEIConn &&  typeof linksRAWEI !== 'undefined' &&  i < linksRAWEI.length; i++) {
            links.push({source: linksRAWEI[i][0], target: linksRAWEI[i][1],  id:"i"+linksRAWEI[i][0]+" "+linksRAWEI[i][1],color:_SigletonConfig.EIColor});
        }

        for (i = 0;_SimulationData.drawIIConn && typeof linksRAWII !== 'undefined' && i < linksRAWII.length; i++) {
            links.push({source: linksRAWII[i][0], target: linksRAWII[i][1],  id:"i"+linksRAWII[i][0]+" "+linksRAWII[i][1],color:_SigletonConfig.IIColor});
        }
        this.linksPrevActual = {};
        links.forEach(function (d) { self.linksPrevActual[d.id] = true; });
        this.worker.postMessage({
            type:"step",
            links: links,
            step:_SimulationController.actSimStep
        });
        this.t = 0;
        this.draw();

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
