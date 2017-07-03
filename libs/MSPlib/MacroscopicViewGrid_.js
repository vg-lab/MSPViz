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

    this.MSPViewType="MacroV";
    this.x=0;
    this.posXA = [];
    this.posYA = [];
    this.indx = [];
    this.numNeurons = _SimulationData.gNeurons.length;
    var width = _SigletonConfig.width;
    var height = _SigletonConfig.height-20;
    this.lado = Math.sqrt((width*height)/this.numNeurons);
    this.enX = Math.floor(width/this.lado);
    this.enY = Math.floor(height/this.lado);
    var sign = 1;
    var valor = 20;
    for (var i = 0; i <= 2000; i++) {
        this.posXA.push((i%this.enX)*(this.lado)+10);
    }

    var j = 1;
    var val = 10;
    while(j<=2000){
        this.posYA.push(val);
        if(j%this.enX===0){
            val+=(this.lado);
        }
        j++;
    }
    this.idx = 0;


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

function paint(arr) {

}

MSP.MacroscopicViewGrid.prototype =
    {
        constructor: MSP.MacroscopicViewGrid

        ,init :function ()
    {

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
        this.createSampleBandColor(_SigletonConfig.calciumScheme);

        var self=this;
        self.idx = 0;

        this.zoombehavior = d3.behavior.zoom()
            .x(_SigletonConfig.zoomXScale)
            .y(_SigletonConfig.zoomYScale)
            .scaleExtent([0.5, Infinity])
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
            .attr("height", _SigletonConfig.height-65)
            .call(self.zoombehavior)
            .append("g");

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
            .on("mousedown", function(d)
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
             .attr("refY", 5)					//Desplayamiento en Y, e snecesario 5 unidades ya que no se ha centrado en el 00, sino en el 0,5     .attr("markerUnits", "strokeWidth") //Define las coordenadas para  markerWidth y markerHeight
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
    },
        sortNeuronsByCa: function () {
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
        },
        unSortNeuronsByCa: function () {
            var self = _SimulationController.view;
            self.idx = 0;
            _SimulationData.gNeuronsRep.attr("transform", function (d) {

                    d.PosX = self.posXA[self.idx];
                    d.PosY = self.posYA[self.idx];
                    self.idx += 1;
                    return "translate(" + d.PosX + "," + d.PosY + ")";
                }
            )
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

            if(_SigletonConfig.sorted) this.sortNeuronsByCa();
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
        var mover1 = function(){
            var coordinate = d4.mouse(this);
            var valor =  rectangle2.attr("x");

            if(coordinate[0]>10 && coordinate[0]<valor ) {
                rectangle.attr("x", coordinate[0]);
                rectangle.attr("width",valor - coordinate[0]);
                rectangle1.attr("x", coordinate[0]);

            }

        };
        var mover2 = function(){
            var coordinate = d4.mouse(this);
            var valor =  rectangle1.attr("x");
            if(coordinate[0]<(_SigletonConfig.width - 10) && coordinate[0]>valor ) {
                rectangle.attr("width", coordinate[0]-valor);
                rectangle2.attr("x", coordinate[0]);

            }

        };

        var cambiar1 = function(){
            var coordinate = d4.mouse(this);
            var valor =  rectangle1.attr("x");
            var valor2 =  rectangle2.attr("x");
                self.removeNods(xInverted(valor),xInverted(valor2));
        };



        var draag = d4.drag().on('drag',mover1).on('end',cambiar1);
        var draag2 = d4.drag().on('drag', mover2).on('end', cambiar1);

        var svgContainer = d4.select("#colorSampleBand").append("svg")
            .attr("x",0).attr("y",20)
            .attr("width", _SigletonConfig.width)
            .attr("height", 60);
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
            .attr("height", 20)
            .attr("y", 22)
            .attr("x", 10)
            .attr("width", _SigletonConfig.width-20)
            .attr("fill","url(#mygrad2)");

        var rectangle1 = svgContainer.append("rect")
            .attr("id","boix3")
            .attr("height", 25)
            .attr("y", 22)
            .attr("x", 10)
            .attr("width", 3)
            .call(draag);

        var rectangle2 = svgContainer.append("rect")
            .attr("id","boix4")
            .attr("height", 25)
            .attr("y", 22)
            .attr("x", _SigletonConfig.width-10)
            .attr("width", 3)
            .call(draag2);

        for(var i=0;i<_SimulationData.gNeurons.length;++i)
        {
            if (_SimulationData.gNeurons[i].NAct=="E")
            {
                if (_SimulationData.maxECalciumValue<_SimulationData.gNeurons[i].SetPoint)
                    _SimulationData.maxECalciumValue=_SimulationData.gNeurons[i].SetPoint;
            }
            else
            {
                if (_SimulationData.maxICalciumValue<_SimulationData.gNeurons[i].SetPoint)
                    _SimulationData.maxICalciumValue=_SimulationData.gNeurons[i].SetPoint;
            }
        }

        var x = d3.scale.linear().range([ 0, _SigletonConfig.width-20]).domain([_SimulationData.minICalciumValue, _SimulationData.maxICalciumValue]);
        var xInverted = d3.scale.linear().range([_SimulationData.minICalciumValue, _SimulationData.maxICalciumValue]).domain([ 10, _SigletonConfig.width-10]);
        var xAxis = d3.svg.axis().scale(x).orient("top").tickSize(-10);

        svgContainer.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(10,20)")
            .call(xAxis);
    }, removeNods: function(start, end)
    {
        var lIndex = _SimulationController.actSimStep % _SimulationData.numSimStepsPerFile;
        var self = _SimulationController.view;
        self.idx = 0;
        d3.selectAll(".puntos").remove();
        _SimulationData.gNeuronsRep = _SigletonConfig.svg.selectAll(".puntos")
            .data(_SimulationData.gNeurons)
            .enter()
            .append("path")
            .filter(function(d) {
                return _SimulationData.gNeuronsDetails[d.NId].Calcium[lIndex] > start && _SimulationData.gNeuronsDetails[d.NId].Calcium[lIndex] < end})
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
        _SimulationData.recalculateScales2(start,end);
        self.updateVisualization();
    }
    };
