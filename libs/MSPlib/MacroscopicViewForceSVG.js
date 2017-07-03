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

    this.MSPViewType="MacroV";
    this.x=0;
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

    this.idx = 0;
    this.node =[];
    this.nodes = [];
    this.force = null;
    this.links = null;
    this.linkB = null;
    this.nodoB = null;
    this.scaleBandHeight;
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
    },generateMacroscopicViewForce :function ()
    {
        this.scaleBandHeight = 65;
        var nodes = [];
        for (var i = 0; i < _SimulationData.gNeurons.length; i++) {
            var elem = _SimulationData.gNeurons[i];
            elem["x"] = this.posXA[i];
            elem["y"] = this.posYA[i];
        }
        this.nodes = _SimulationData.gNeurons;

        d3.selectAll("svg").filter(function() {
            return !this.classList.contains('color')
        }).remove();

        d3.selectAll("canvas")
            .remove();
        var self = this;
        this.zoombehavior = d3.behavior.zoom()
            .x(_SigletonConfig.zoomXScale)
            .y(_SigletonConfig.zoomYScale)
            .scaleExtent([0.1, Infinity])
            .on("zoom", self.zoom);


        _SigletonConfig.svg = d3.select("#renderArea")
            .attr("tabindex", 1)
            .on("keydown.brush", this.keyDown)
            .on("keyup.brush", this.keyUp)
            .append("svg")
            .each(function()
                {
                    this.focus();
                }
            )
            .attr("width", _SigletonConfig.width)
            .attr("height", _SigletonConfig.height-this.scaleBandHeight)
            .call(self.zoombehavior)
            .append("g")

        ;
        this.createSampleBandColor(_SigletonConfig.calciumScheme);

        _SigletonConfig.svg
            .append("rect")
            .attr("class", "overlay")
            .attr("width", _SigletonConfig.width)
            .attr("height", _SigletonConfig.height)
            .style("opacity","0.0")
        ;

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
        this.linkB = _SigletonConfig.svg.selectAll(".link");

        function start() {
            var ticksPerRender = 40;
            requestAnimationFrame(function render() {
                for (var i = 0; i < ticksPerRender && force.alpha() > 0; i++) {
                    force.tick();
                }

                var self = _SimulationController.view;





                if (force.alpha() > 0) {
                    requestAnimationFrame(render);
                }
            })
        }


        _SimulationController.view.links = _SigletonConfig.svg.selectAll("line");

        var node =    _SigletonConfig.svg.selectAll('.node')
            .data(this.nodes)
            .enter()
            .append("path")
            .attr("class","node")
            .attr("d", d3.svg.symbol()
                .type(function(d)
                    {
                        if (d.NAct == "E")	return "triangle-up";
                        else				return "circle";
                    }
                ).size(function(d)
                {
                    if (d.NAct == "E")	return 150;
                    else				return 204;
                })
            )
            .style("fill", "rgb(255,255,255)")  .on("mousedown", function(d)
                {
                    if (_SimulationController.view.selecting)
                    {
                        d3.select(this).classed("selected", d.selected = !d.selected);
                        for (i=0;i<_SimulationController.view.EIconnectGroup[0].length;i++)
                        {
                            _SimulationController.view.EIconnectGroup[0][i].style = "stroke-opacity: 0;";
                            if (_SimulationData.gNeurons[_SimulationController.view.EIconnectGroup[0][i].__data__[0]].selected ||
                                _SimulationData.gNeurons[_SimulationController.view.EIconnectGroup[0][i].__data__[1]].selected )
                                _SimulationController.view.EIconnectGroup[0][i].style = "stroke-opacity: 1;"
                        }

                        for (i=0;i<_SimulationController.view.IIconnectGroup[0].length;i++)
                        {
                            _SimulationController.view.IIconnectGroup[0][i].style = "stroke-opacity: 0;";
                            if (_SimulationData.gNeurons[_SimulationController.view.IIconnectGroup[0][i].__data__[0]].selected ||
                                _SimulationData.gNeurons[_SimulationController.view.IIconnectGroup[0][i].__data__[1]].selected )
                                _SimulationController.view.IIconnectGroup[0][i].style = "stroke-opacity: 1;"
                        }

                        for (i=0;i<_SimulationController.view.EEconnectGroup[0].length;i++)
                        {
                            _SimulationController.view.EEconnectGroup[0][i].style = "stroke-opacity: 0;";
                            if (_SimulationData.gNeurons[_SimulationController.view.EEconnectGroup[0][i].__data__[0]].selected ||
                                _SimulationData.gNeurons[_SimulationController.view.EEconnectGroup[0][i].__data__[1]].selected )
                                _SimulationController.view.EEconnectGroup[0][i].style = "stroke-opacity: 1;"
                        }

                        for (i=0;i<_SimulationController.view.IEconnectGroup[0].length;i++)
                        {
                            _SimulationController.view.IEconnectGroup[0][i].style = "stroke-opacity: 0;";
                            if (_SimulationData.gNeurons[_SimulationController.view.IEconnectGroup[0][i].__data__[0]].selected ||
                                _SimulationData.gNeurons[_SimulationController.view.IEconnectGroup[0][i].__data__[1]].selected )
                                _SimulationController.view.IEconnectGroup[0][i].style = "stroke-opacity: 1;"
                        }
                    }
                    else
                    {
                        _SimulationData.gNeuronsRep.classed("selected", function(p)
                        {
                            return p.selected = false;
                        });

                        for (i=0;i<_SimulationController.view.EIconnectGroup[0].length;i++)
                        {
                            _SimulationController.view.EIconnectGroup[0][i].style = "\"stroke-opacity: "+_SigletonConfig.macroVAlpha+";\""
                        }

                        for (i=0;i<_SimulationController.view.IIconnectGroup[0].length;i++)
                        {
                            _SimulationController.view.IIconnectGroup[0][i].style = "\"stroke-opacity: "+_SigletonConfig.macroVAlpha+";\""
                        }

                        for (i=0;i<_SimulationController.view.EEconnectGroup[0].length;i++)
                        {
                            _SimulationController.view.EEconnectGroup[0][i].style = "\"stroke-opacity: "+_SigletonConfig.macroVAlpha+";\""
                        }

                        for (i=0;i<_SimulationController.view.IEconnectGroup[0].length;i++)
                        {
                            _SimulationController.view.IEconnectGroup[0][i].style = "\"stroke-opacity: "+_SigletonConfig.macroVAlpha+";\""
                        }

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
                        for (i=0;i<_SimulationController.view.EIconnectGroup[0].length;i++)
                        {
                            _SimulationController.view.EIconnectGroup[0][i].style = "\"stroke-opacity: "+_SigletonConfig.macroVAlpha+";\""
                        }

                        for (i=0;i<_SimulationController.view.IIconnectGroup[0].length;i++)
                        {
                            _SimulationController.view.IIconnectGroup[0][i].style = "\"stroke-opacity: "+_SigletonConfig.macroVAlpha+";\""
                        }

                        for (i=0;i<_SimulationController.view.EEconnectGroup[0].length;i++)
                        {
                            _SimulationController.view.EEconnectGroup[0][i].style = "\"stroke-opacity: "+_SigletonConfig.macroVAlpha+";\""
                        }

                        for (i=0;i<_SimulationController.view.IEconnectGroup[0].length;i++)
                        {
                            _SimulationController.view.IEconnectGroup[0][i].style = "\"stroke-opacity: "+_SigletonConfig.macroVAlpha+";\""
                        }
                    }
                }
            )

            .on("mouseover", function(d)
            {

                var lIndex = _SimulationController.actSimStep % _SimulationData.numSimStepsPerFile;

                var posX = d3.mouse(document.body)[0];
                var width = $("#tooltip").width();
                if((posX+width+50)>$(window).width()) posX -= width;

                d3.select("#tooltip")
                    .text(
                        "Id:" + d.NId
                        + " CaC=" + _SimulationData.gNeuronsDetails[d.NId].Calcium[lIndex]
                    )
                    .style("left",posX + "px")
                    .style("top", d3.mouse(document.body)[1]+10 + "px");
                d3.select("#tooltip").classed("hidden", false);

            })
            .on("mouseout", function()
                {
                    d3.select("#tooltip").classed("hidden",true);
                }
            );
        _SigletonConfig.svg
            .append("svg:defs")
            .append("svg:marker")
            .attr("id", "arrowend")				//Identificador
            .attr("viewBox", "0 0 50 10") 		//Dimensiones del rectangulo de pintado (punto inicial, ancho y alto)
            .attr("refX", 40)					//Desplayamiento en X, q es en el eje en el que se ha definido.
            .attr("refY", 5)					//Desplayamiento en Y, e snecesario 5 unidades ya que no se ha centrado en el 00, sino en el 0,5     .attr("markerUnits", "strokeWidth") //Define las coordenadas para  markerWidth y markerHeight
            .attr("markerWidth",  6)			//Represents the width of the viewport into which the marker is to be fitted when it is rendered.
            .attr("markerHeight", 3)			//Represents the height of the viewport into which the marker is to be fitted when it is rendered.
            .attr("orient", "auto")
            .attr("stroke-width", 1)
            .append("svg:path")
            .attr("d","M 0 0 L 20 5 L 0 10 z")
            .attr("fill", "#000000")
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

                    for (i=0;i<_SimulationController.view.EIconnectGroup[0].length;i++)
                    {
                        _SimulationController.view.EIconnectGroup[0][i].style = "\"stroke-opacity: "+_SigletonConfig.macroVAlpha+";\""
                    }

                    for (i=0;i<_SimulationController.view.IIconnectGroup[0].length;i++)
                    {
                        _SimulationController.view.IIconnectGroup[0][i].style = "\"stroke-opacity: "+_SigletonConfig.macroVAlpha+";\""
                    }

                    for (i=0;i<_SimulationController.view.EEconnectGroup[0].length;i++)
                    {
                        _SimulationController.view.EEconnectGroup[0][i].style = "\"stroke-opacity: "+_SigletonConfig.macroVAlpha+";\""
                    }

                    for (i=0;i<_SimulationController.view.IEconnectGroup[0].length;i++)
                    {
                        _SimulationController.view.IEconnectGroup[0][i].style = "\"stroke-opacity: "+_SigletonConfig.macroVAlpha+";\""
                    }



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



                    for (i=0;i<_SimulationController.view.EIconnectGroup[0].length;i++)
                    {
                        _SimulationController.view.EIconnectGroup[0][i].style = "stroke-opacity: 0;";
                        if (_SimulationData.gNeurons[_SimulationController.view.EIconnectGroup[0][i].__data__[0]].selected ||
                            _SimulationData.gNeurons[_SimulationController.view.EIconnectGroup[0][i].__data__[1]].selected )
                            _SimulationController.view.EIconnectGroup[0][i].style = "stroke-opacity: 1;"
                    }

                    for (i=0;i<_SimulationController.view.IIconnectGroup[0].length;i++)
                    {
                        _SimulationController.view.IIconnectGroup[0][i].style = "stroke-opacity: 0;";
                        if (_SimulationData.gNeurons[_SimulationController.view.IIconnectGroup[0][i].__data__[0]].selected ||
                            _SimulationData.gNeurons[_SimulationController.view.IIconnectGroup[0][i].__data__[1]].selected )
                            _SimulationController.view.IIconnectGroup[0][i].style = "stroke-opacity: 1;"
                    }

                    for (i=0;i<_SimulationController.view.EEconnectGroup[0].length;i++)
                    {
                        _SimulationController.view.EEconnectGroup[0][i].style = "stroke-opacity: 0;";
                        if (_SimulationData.gNeurons[_SimulationController.view.EEconnectGroup[0][i].__data__[0]].selected ||
                            _SimulationData.gNeurons[_SimulationController.view.EEconnectGroup[0][i].__data__[1]].selected )
                            _SimulationController.view.EEconnectGroup[0][i].style = "stroke-opacity: 1;"
                    }

                    for (i=0;i<_SimulationController.view.IEconnectGroup[0].length;i++)
                    {
                        _SimulationController.view.IEconnectGroup[0][i].style = "stroke-opacity: 0;";
                        if (_SimulationData.gNeurons[_SimulationController.view.IEconnectGroup[0][i].__data__[0]].selected ||
                            _SimulationData.gNeurons[_SimulationController.view.IEconnectGroup[0][i].__data__[1]].selected )
                            _SimulationController.view.IEconnectGroup[0][i].style = "stroke-opacity: 1;"
                    }
                }
                else
                {
                    _SimulationData.gNeuronsRep.classed("selected",function(d)
                    {
                        return d.selected = d.previouslySelected = false;
                    });
                    _SigletonConfig.gSelectionIds = [];

                    for (i=0;i<_SimulationController.view.EIconnectGroup[0].length;i++)
                    {
                        _SimulationController.view.EIconnectGroup[0][i].style = "\"stroke-opacity: "+_SigletonConfig.macroVAlpha+";\""
                    }

                    for (i=0;i<_SimulationController.view.IIconnectGroup[0].length;i++)
                    {
                        _SimulationController.view.IIconnectGroup[0][i].style = "\"stroke-opacity: "+_SigletonConfig.macroVAlpha+";\""
                    }

                    for (i=0;i<_SimulationController.view.EEconnectGroup[0].length;i++)
                    {
                        _SimulationController.view.EEconnectGroup[0][i].style = "\"stroke-opacity: "+_SigletonConfig.macroVAlpha+";\""
                    }

                    for (i=0;i<_SimulationController.view.IEconnectGroup[0].length;i++)
                    {
                        _SimulationController.view.IEconnectGroup[0][i].style = "\"stroke-opacity: "+_SigletonConfig.macroVAlpha+";\""
                    }
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

        _SimulationData.gNeuronsRep = node;

        this.node = node;
        force.on('end', function() {

            var self = _SimulationController.view;


            var data = _SigletonConfig.svg.selectAll(".link");

            if(typeof data !== "undefined")
                data
                    .transition()
                    .duration(2000)
                    .attr('x1', function(d) {
                        return d.source.x; })
                    .attr('y1', function(d) {
                        return d.source.y; })
                    .attr('x2', function(d) {
                        return d.target.x; })
                    .attr('y2', function(d) {
                        return d.target.y; })
                    .style("stroke", function(d){
                        if ((self.selecting && (d.source.selected && _SigletonConfig.outgoingConn) || (d.target.selected && _SigletonConfig.incomingConn))
                            || (!self.selecting && (_SimulationFilter.gNeuronsFilterB[d.source.NId] || _SimulationFilter.gNeuronsFilterB[d.target.NId]))) {
                            return  d.color;
                        }else{
                            return  "#434343";
                        }

                    })
                    .style("opacity", _SigletonConfig.macroVAlpha)
                    .style("stroke-width", 4)
                    .attr("marker-start", "url(#arrowstart)")
                    .attr("marker-end", "url(#arrowend)");


            _SimulationController.view.node
                .transition()
                .duration(2000)
                .attr('r',function(d) {
                    return (d.weight/10)+5; })

                .attr("transform", function(d)
                    {
                        return "translate(" + d.x + "," + d.y + ")";
                    }
                );

            _SimulationData.gNeuronsRep.moveToFront();

        });



        force.start();

    },
        updateSynapticElements: function ()
        {



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

            _SimulationController.view.idx = links;
            var data = _SigletonConfig.svg.selectAll(".link").data(_SimulationController.view.idx, function(d) {
                return d.id;
            });
            data.exit()
                .style("stroke", "black")
                .remove();

            data
                .enter().append('line')
                .attr('class', 'link')
                .attr('x1', function(d) {
                    return d.source.x; })
                .attr('y1', function(d) {
                    return d.source.y; })
                .attr('x2', function(d) {
                    return d.target.x; })
                .attr('y2', function(d) {
                    return d.target.y; })
                .style("stroke", function(d){

                    return d.color;
                })
                .style("opacity", "1")
                .style("stroke-width", 15)
                .attr("marker-start", "url(#arrowstart)")
                .attr("marker-end", "url(#arrowend)")
            ;

            data.attr('x1', function(d) {
                return d.source.x; })
                .attr('y1', function(d) {
                    return d.source.y; })
                .attr('x2', function(d) {
                    return d.target.x; })
                .attr('y2', function(d) {
                    return d.target.y; })
                .style("stroke", function(d){
                    if ((self.selecting && (d.source.selected && _SigletonConfig.outgoingConn) || (d.target.selected && _SigletonConfig.incomingConn))
                        || (!self.selecting && (_SimulationFilter.gNeuronsFilterB[d.source.NId] || _SimulationFilter.gNeuronsFilterB[d.target.NId]))) {
                        return  d.color;
                    }else{
                        return  "#434343";
                    }

                })
            ;



            _SimulationController.view.force.links(links);

            _SimulationController.view.force.start();


            this.gConnectLoaded=true;
        },

        updateCalcium: function ()
        {

            var lIndex = _SimulationController.actSimStep % _SimulationData.numSimStepsPerFile;
            _SimulationData.gNeuronsRep.style("fill", function(d) {

                if(!_SimulationFilter.gNeuronsFilterB[d.NId]) {
                    return  "#434343";
                }else if (d.NAct == "E") {
                    return _SimulationData.CaEScale(_SimulationData.gNeuronsDetails[d.NId].Calcium[lIndex]);
                }
                else {
                    return _SimulationData.CaIScale(_SimulationData.gNeuronsDetails[d.NId].Calcium[lIndex]);
                }
            }).style("fill-opacity", function(d) {

                if(!_SimulationFilter.gNeuronsFilterB[d.NId]) {
                    return 0.1;
                }
                else {
                    return 1;
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
