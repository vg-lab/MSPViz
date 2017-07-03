/**
 * @brief
 * @author  Juan Pedro Brito Mendez <juanpebm@gmail.com>
 * @date
 * @remarks Do not distribute without further notice.
 */

MSP.MacroscopicViewCircle = function ()
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

    for (i = 0; i < 1000; i++) {
        this.indx.push(i);
    }

    var width = 960,
        height = 500;

    var centerX = width/2,
        centerY = height/2,
        radius = 900,
        coils = 16;

    var width = 960,
        height = 500;

    var centerX = width/2,
        centerY = height/2,
        radius = 900,
        coils = 16;

    // var rotation = 2 * Math.PI;
    // var thetaMax = coils * 2 * Math.PI;
    // var awayStep = radius / thetaMax;
    // var chord = 20;
    //
    // var new_time = [];
    //
    // for ( theta = chord / awayStep; theta <= thetaMax; ) {
    //     away = awayStep * theta;
    //     around = theta + rotation;
    //
    //     x = centerX + Math.cos ( around ) * away;
    //     y = centerY + Math.sin ( around ) * away;
    //
    //     theta += chord / away;
    //
    //     this.posXA.push(x);
    //     this.posYA.push(y);
    // }

    this.idx = 0;

    var step = 2*Math.PI/1000;  // see note 1
    var h = 0;
    var k = 0;
    var r = 5000;

    for(var theta=0;  theta < 2*Math.PI;  theta+=step)
    { var x = h + r*Math.cos(theta);
        var y = k - 0.5 * r*Math.sin(theta);    //note 2.
        this.posXA.push(x);
        this.posYA.push(y);
    }

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

MSP.MacroscopicViewCircle.prototype =
    {
        constructor: MSP.MacroscopicViewCircle

        ,generateMacroscopicViewCircle :function ()
    {

        _SigletonConfig.gSelectionIds=[];

        d3.select("svg")
            .remove();

        d3.selectAll("canvas")
            .remove();
        this.createSampleBandColor(_SigletonConfig.calciumScheme);

        var self=this;
        self.idx = 0;
        var lIndex = _SimulationController.actSimStep % _SimulationData.numSimStepsPerFile;
        /* var mi = sortWithIndeces(_SimulationData.gNeuronsDetails[lIndex].Calcium);
         for (var i = 0; i < 1000; i++) {
         _SimulationData.gNeurons[i].NId = mi.sortIndices[i];
         }*/
        this.zoombehavior = d3.behavior.zoom()
            .x(_SigletonConfig.zoomXScale)
            .y(_SigletonConfig.zoomYScale)
            .scaleExtent([0.01, 10])
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
            .append("g")
            .call(self.zoombehavior)
            .append("g")
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
            .attr("class","puntos")
            .attr("d", d3.svg.symbol()
                .type(function(d)
                    {
                        if (d.NAct == "E")	return "triangle-up";
                        else				return "circle";
                    }
                ).size(function(d)
                {
                    if (d.NAct == "E")	return 50;
                    else				return 68;
                })
            )
            .attr("transform", function(d)
                {

                    d.PosX = self.posXA[self.idx];
                    d.PosY = self.posYA[self.idx];
                    self.idx+=1
                    return "translate(" + d.PosX + "," + d.PosY + ")";
                }
            )
            .style("fill", "rgb(255,255,255)")
            .style("stroke-width", 2)
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
                var lIndex = _SimulationController.actSimStep % _SimulationData.numSimStepsPerFile;

                d3.select("#tooltip")
                    .style("left", xPos + "px")
                    .style("top", yPos+ "px")
                    .text(
                        "Id:" + d.NId
                        + " CaC=" + _SimulationData.gNeuronsDetails[d.NId].Calcium[lIndex]
                    );

                d3.select("#tooltip").classed("hidden",false);

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
            .attr("refX", 50)					//Desplayamiento en X, q es en el eje en el que se ha definido.
            .attr("refY", 5)					//Desplayamiento en Y, e snecesario 5 unidades ya que no se ha centrado en el 00, sino en el 0,5
            .attr("markerUnits", "strokeWidth") //Define las coordenadas para  markerWidth y markerHeight
            .attr("markerWidth",  20)			//Represents the width of the viewport into which the marker is to be fitted when it is rendered.
            .attr("markerHeight", 8)			//Represents the height of the viewport into which the marker is to be fitted when it is rendered.
            .attr("orient", "auto")
            .append("svg:path")
            .attr("d","M 0 0 L 20 5 L 0 10 z")
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
            .attr("fill", "#BBBBBB")
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
            var self=this;

            var lIndex = _SimulationController.actSimStep % _SimulationData.numSimStepsPerFile;
            var sorted = sortWithIndeces(_SimulationData.gNeuronsDetails[lIndex].Calcium).sortIndices;
            var posXA2 =self.posXA.slice(0);
            var posYA2 =self.posYA.slice(0);
            for(var i = 0; i<self.posXA.length;i++){
                posXA2[sorted[i]] = self.posXA[i];
                posYA2[sorted[i]] = self.posYA[i];
            }
            self.idx = 0;
            /*
            _SimulationData.gNeuronsRep = _SigletonConfig.svg
                .selectAll(".puntos")
                .data(_SimulationData.gNeurons)
                .transition()
                .duration(function(d)
                {
                    return _SimulationController.UpdateVelocity;
                })
                .ease("linear")
                .attr("transform", function(d)
                    {

                        d.PosX = self.posXA[self.idx];
                        d.PosY = self.posYA[self.idx];
                        self.idx+=1;
                        return "translate(" + d.PosX + "," + d.PosY + ")";
                    }
                )

            ;*/


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
            var lIndex = _SimulationController.actSimStep % _SimulationData.numSimStepsPerFile;
            var calcios = [];
            for(var i = 0; i<_SimulationData.gNeuronsDetails.length;i++)
                calcios.push(_SimulationData.gNeuronsDetails[i].Calcium[lIndex])
            var sorted = sortWithIndeces(calcios).sortIndices;
            var posXA2 =this.posXA.slice(0);
            var posYA2 =this.posYA.slice(0);
            for(var i = 0; i<sorted.length;i++){
                posXA2[sorted[i]] = this.posXA[i];
                posYA2[sorted[i]] = this.posYA[i];
            }
            var self = this;
            this.idx = 0;
            _SimulationData.gNeuronsRep.style("fill", function(d)
            {
                //console.log("ULTIMO PINTADO:"+d.NId);

                if (d.NAct == "E")
                {

                    //var lVal = _SimulationData.CaEScale(d.Calcium[_SimulationController.actSimStep]);
                    var lVal = _SimulationData.CaEScale(_SimulationData.gNeuronsDetails[d.NId].Calcium[lIndex]);
                    return lVal;
                }
                else
                {
                    //var lVal = _SimulationData.CaIScale(d.Calcium[_SimulationController.actSimStep]);
                    var lVal = _SimulationData.CaIScale(_SimulationData.gNeuronsDetails[d.NId].Calcium[lIndex]);
                    return lVal;
                }
            });/*.attr("transform", function(d)
                {

                    d.PosX = posXA2[self.idx];
                    d.PosY = posYA2[self.idx];
                    self.idx+=1;
                    return "translate(" + d.PosX + "," + d.PosY + ")";
                }
            );*/
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
        ,createSampleBandColor: function(interpolator)
    {

        var svgContainer = d4.select("#colorSampleBand").append("svg")
            .attr("x",10).attr("y",20)
            .attr("width", _SigletonConfig.width)
            .attr("height", 20);
        var z = d4.scaleSequential(d4["interpolate"+interpolator]);
        var lg = svgContainer.append("defs").append("linearGradient")
            .attr("id", "mygrad2")//id of the gradient
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
            .attr("height", 90)
            .attr("y", 0)
            .attr("width", _SigletonConfig.width)
            .attr("fill","url(#mygrad2)");

    }
    };
