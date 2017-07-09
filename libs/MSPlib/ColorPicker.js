MSP.ColorPicker = function ()
{
    this.source = [
        {html: "<div tabIndex=0 style='padding: 1px;'><div>schemeAccent</div>", label: "schemeAccent", group: "Categorical" },
        {html: "<div tabIndex=0 style='padding: 1px;'><div>schemeDark2</div>", label: "schemeDark2", group: "Categorical" },
        {html: "<div tabIndex=0 style='padding: 1px;'><div>schemePaired</div>", label: "schemePaired", group: "Categorical" },
        {html: "<div tabIndex=0 style='padding: 1px;'><div>schemePastel1</div>", label: "schemePastel1", group: "Categorical" },
        {html: "<div tabIndex=0 style='padding: 1px;'><div>schemePastel2</div>", label: "schemePastel2", group: "Categorical" },
        {html: "<div tabIndex=0 style='padding: 1px;'><div>schemeSet1</div>", label: "schemeSet1", group: "Categorical" },
        {html: "<div tabIndex=0 style='padding: 1px;'><div>schemeSet2</div>", label: "schemeSet2", group: "Categorical" },
        {html: "<div tabIndex=0 style='padding: 1px;'><div>schemeSet3</div>", label: "schemeSet3", group: "Categorical" },
        {html: "<div tabIndex=0 style='padding: 1px;'><div>Viridis</div>", label: "Viridis", group: "Diverging" },
        {html: "<div tabIndex=0 style='padding: 1px;'><div>Inferno</div>", label: "Inferno", group: "Diverging" },
        {html: "<div tabIndex=0 style='padding: 1px;'><div>Magma</div>", label: "Magma", group: "Diverging" },
        {html: "<div tabIndex=0 style='padding: 1px;'><div>Plasma</div>", label: "Plasma", group: "Diverging" },
        {html: "<div tabIndex=0 style='padding: 1px;'><div>Warm</div>", label: "Warm", group: "Diverging" },
        {html: "<div tabIndex=0 style='padding: 1px;'><div>Cool</div>", label: "Cool", group: "Diverging" },
        {html: "<div tabIndex=0 style='padding: 1px;'><div>Cubehelix</div>", label: "CubehelixDefault", group: "Diverging" },
        {html: "<div tabIndex=0 style='padding: 1px;'><div>BrBG</div>", label: "BrBG", group: "Diverging" },
        {html: "<div tabIndex=0 style='padding: 1px;'><div>PRGn</div>", label: "PRGn", group: "Diverging" },
        {html: "<div tabIndex=0 style='padding: 1px;'><div>PiYG</div>", label: "PiYG", group: "Diverging" },
        {html: "<div tabIndex=0 style='padding: 1px;'><div>PuOr</div>", label: "PuOr", group: "Diverging" },
        {html: "<div tabIndex=0 style='padding: 1px;'><div>RdBu</div>", label: "RdBu", group: "Diverging" },
        {html: "<div tabIndex=0 style='padding: 1px;'><div>RdGy</div>", label: "RdGy", group: "Diverging" },
        {html: "<div tabIndex=0 style='padding: 1px;'><div>RdYlBu</div>", label: "RdYlBu", group: "Diverging" },
        {html: "<div tabIndex=0 style='padding: 1px;'><div>RdYlGn</div>", label: "RdYlGn", group: "Diverging" },
        {html: "<div tabIndex=0 style='padding: 1px;'><div>Spectral</div>", label: "Spectral", group: "Diverging" },
        {html: "<div tabIndex=0 style='padding: 1px;'><div>Greens</div>", label: "Greens", group: "Sequential" },
        {html: "<div tabIndex=0 style='padding: 1px;'><div>Greys</div>", label: "Greys", group: "Sequential" },
        {html: "<div tabIndex=0 style='padding: 1px;'><div>Oranges</div>", label: "Oranges", group: "Sequential" },
        {html: "<div tabIndex=0 style='padding: 1px;'><div>Purples</div>", label: "Purples", group: "Sequential" },
        {html: "<div tabIndex=0 style='padding: 1px;'><div>Reds</div>", label: "Reds", group: "Sequential" },
        {html: "<div tabIndex=0 style='padding: 1px;'><div>BuGn</div>", label: "BuGn", group: "Sequential" },
        {html: "<div tabIndex=0 style='padding: 1px;'><div>BuPu</div>", label: "BuPu", group: "Sequential" },
        {html: "<div tabIndex=0 style='padding: 1px;'><div>GnBu</div>", label: "GnBu", group: "Sequential" },
        {html: "<div tabIndex=0 style='padding: 1px;'><div>OrRd</div>", label: "OrRd", group: "Sequential" },
        {html: "<div tabIndex=0 style='padding: 1px;'><div>PuBuGn</div>", label: "PuBuGn", group: "Sequential" },
        {html: "<div tabIndex=0 style='padding: 1px;'><div>PuBu</div>", label: "PuBu", group: "Sequential" },
        {html: "<div tabIndex=0 style='padding: 1px;'><div>PuRd</div>", label: "PuRd", group: "Sequential" },
        {html: "<div tabIndex=0 style='padding: 1px;'><div>RdPu</div>", label: "RdPu", group: "Sequential" },
        {html: "<div tabIndex=0 style='padding: 1px;'><div>YlGnBu</div>", label: "YlGnBu", group: "Sequential" },
        {html: "<div tabIndex=0 style='padding: 1px;'><div>YlGn</div>", label: "YlGn", group: "Sequential" },
        {html: "<div tabIndex=0 style='padding: 1px;'><div>YlOrBr</div>", label: "YlOrBr", group: "Sequential" },
        {html: "<div tabIndex=0 style='padding: 1px;'><div>YlOrRd</div>", label: "YlOrRd", group: "Sequential" }];

    this.widthPane = 300;
    this.colorSelec = "";
    this.colorRange = null;
    this.colorSelecGlobal ="";
    this.linea = null;
    this.triangulo = null;
    this.svgContainer = null;
};

MSP.ColorPicker.prototype = {

    constructor: MSP.ColorPicker

    ,generateColorPicker : function ()
    {
        $("#numSetps").jqxNumberInput({theme: "arctic", width: '40px', height: '25px', digits: 2,min:2,max:20, inputMode: 'simple',decimalDigits: 0, spinButtons: true,groupSize:0, value:10 });
        $("#genericColorPicker").jqxColorPicker({ color: "0000FF", colorMode: 'hue', width: 316, height: 200});
        $("#comboBox").jqxComboBox({theme: "arctic", source: this.source, width: 136, height: 25,autoComplete: true,closeDelay: 50,openDelay: 50,placeHolder: "Select scheme"});

        this.colorRange = d4.scaleSequential(d4.interpolateViridis);

        var svgContainer = d4.select("#color").append("svg")
            .attr("x",10).attr("y",20)
            .attr("width", 310)
            .attr("height", 90)
            .attr("class","color");
        this.svgContainer = svgContainer;

        var lg = svgContainer.append("defs").append("linearGradient")
            .attr("id", "gradient")
            .attr("x1", "0%")
            .attr("x2", "100%")
            .attr("y1", "0%")
            .attr("y2", "0%");

        for(var i = 0; i<=20; i++) {
            lg.append("stop")
                .attr("offset", (i*5)+"%")
                .style("stop-color", this.colorRange(i/20))
                .style("stop-opacity", 1);
        }

        this.generateBlocks();

        this.generateScale();

        $('#comboBox').on('change', function() {
           var colorSelec = $("#comboBox").jqxComboBox('val');
            if($("#comboBox").jqxComboBox('getSelectedItem').group==='Categorical')
                _ColorPicker.categorical(colorSelec);
            else
                _ColorPicker.update(colorSelec);
            _ColorPicker.updatePick();
        });

        $('#numSetps').on('change', function() {_ColorPicker.generateBlocks();});



    },generateScale: function()
    {
        var self = _ColorPicker;
        self.svgContainer.attr("height",90);
        var draag = d4.drag().on('drag', self.moveBarColor);
        if(d4.select("#colorGradient").empty()) {
            var rectangle = self.svgContainer.append("rect")
                .attr("id", "colorGradient")
                .attr("height", 40)
                .attr("y", 32)
                .attr("cursor", "pointer")
                .attr("width", this.widthPane)
                .attr("fill", "url(#gradient)");
            rectangle.on("click",self.moveBarColor).on("drag", self.moveBarColor).on("dragend", self.moveBarColor);
        }

        if(d4.select("#linea").empty()) {
            self.linea = self.svgContainer.append("rect")
                .attr("x", 150)
                .attr("id", "linea")
                .attr("y", 32)
                .attr('fill', '#fff')
                .attr("height", 40)
                .attr("width", 1)
                .attr("cursor", "move")
                .call(draag);
        }
        if(d4.select("#indicador").empty()) {
            self.triangulo = self.svgContainer.append("rect")
                .attr("x", 145)
                .attr("id", "indicador")
                .attr("y", 72)
                .attr("width", 10)
                .attr("height", 10)
                .attr("cursor", "move")
                .attr("fill", "black").call(draag);

            self.triangulo.append("g");
        }

    }


    ,generateBlocks : function()
    {
        var self = _ColorPicker;
        var isCategorical= false;
        if($("#comboBox").jqxComboBox('getSelectedItem')!==null)   isCategorical = $("#comboBox").jqxComboBox('getSelectedItem').group==='Categorical';

        var scheme = $("#comboBox").jqxComboBox('val');
        if(scheme==="") scheme="Viridis";
        if(isCategorical)
            self.colorRange = d4[scheme];
        else
            self.colorRange = d4["interpolate"+scheme];

        var numCuad = $("#numSetps").jqxNumberInput('val');
        if(self.colorRange.length < numCuad && isCategorical) numCuad = self.colorRange.length;
        d4.selectAll('.cuadritos').remove();
        var ancho = (self.widthPane - ((numCuad-1)*2))/numCuad;
        for(var i = 0; i<=(numCuad-1); i++) {
            var color;
            if(isCategorical)
                color = self.colorRange[i];
            else
                color = self.colorRange(i/(numCuad-1));
            self.svgContainer.append("rect")
                .attr("class","cuadritos")
                .attr("x", (i*(ancho+2)))
                .attr("width", ancho)
                .attr("height", 30)
                .attr("i", i)
                .attr("fill",color)
                .attr("cursor","pointer")
                .on("click", self.colorchange);
        }

    },  categorical : function(scheme){
        d4.select('#colorGradient').remove();
        d4.select('#indicador').remove();
        d4.select('#linea').remove();
        var self = _ColorPicker;
        self.svgContainer.attr("height",45);
        self.generateBlocks();

    }
    ,update: function(color){

        var self = _ColorPicker;
        self.generateScale();
        self.colorRange = d4.scaleSequential(d4["interpolate"+color]);
        d4.select("#gradient")
            .selectAll("stop")
            .each(function(d,i) {
                d4.select(this).style("stop-color", self.colorRange(i/20));

            });
        var numCuad = $("#numSetps").jqxNumberInput('val');
        self.generateBlocks();
        d4.select("#colorGradient").attr("fill","url(#gradient)");
    }
    ,updatePick: function(){

        if(!d4.select("#linea").empty()) {
            var color = d4.color(_ColorPicker.colorRange(d4.select("#linea").attr('x')/_ColorPicker.widthPane));
            $("#genericColorPicker").jqxColorPicker('setColor', _ColorPicker.rgbToHex(color));
            var a = 1 - ( 0.299 * color.r + 0.587 * color.g + 0.114 * color.b)/255;
            var colorText  = "white";
            if (a < 0.5) colorText = "black";
            _ColorPicker.linea.attr('fill', colorText);
        }
    },
    colorchange: function(){
        var numCuad = $("#numSetps").jqxNumberInput('val');
        var self = _ColorPicker;
        var color = d4.color(d4.select(this).attr("fill"));
        var x = d4.select(this).attr("i");
        var a = 1 - ( 0.299 * color.r + 0.587 * color.g + 0.114 * color.b)/255;
        var colorText  = "white";
        if (a < 0.5) colorText = "black";
        self.linea.attr('fill', colorText);
        self.linea.attr('x', x*(self.widthPane/(numCuad-1)));
        self.triangulo.attr('x', x*(self.widthPane/(numCuad-1))-4);
        colorSelec = color;
        $("#genericColorPicker").jqxColorPicker('setColor', self.rgbToHex(color));

    }
    ,
    hide: function () {
        $("#popup").hide();
    }
    , accept: function()
    {
        var self = _ColorPicker;
        var color = $("#genericColorPicker").jqxColorPicker('getColor').hex;
        self.colorSelecGlobal = d4.color('#'+color);
        $("#popup").hide();
        var elem = $("#"+(caller.attr("id"))+" .jqx-rc-all");
        elem.css('background', self.colorSelecGlobal);
        elem.text(this.rgbToHex( self.colorSelecGlobal));
        var a = 1 - ( 0.299 * self.colorSelecGlobal.r + 0.587 *  self.colorSelecGlobal.g + 0.114 *  self.colorSelecGlobal.b)/255;
        var colorText  = "white";
        if (a < 0.5) colorText = "black";
        elem.css("color",colorText);
    }
    , moveBarColor: function()
    {
        var self = _ColorPicker;
        var coordinate = d4.mouse(this);
        var x = coordinate[0];
        if(x>=0 && x<=self.widthPane) {
            var color = d4.color(self.colorRange(x/self.widthPane));
            if ((1 - ( 0.299 * color.r + 0.587 * color.g + 0.114 * color.b)/255) < 0.5)
                self.linea.attr('fill', "black");
            else
                self.linea.attr('fill', "white");

            self.linea.attr('x', x);
            self.triangulo.attr('x', x-5);

            $("#genericColorPicker").jqxColorPicker('setColor', self.rgbToHex(color));
        }
    }
    , componentToHex: function(c)
    {
        var hex = c.toString(16);
        return hex.length === 1 ? "0" + hex : hex;

    }
    , rgbToHex: function(color)
    {
        return "#" + this.componentToHex(color.r) + this.componentToHex(color.g) + this.componentToHex(color.b);
    }
    , getTextForColor: function(color)
    {
        if ((1 - ( 0.299 * color.r + 0.587 * color.g + 0.114 * color.b)/255) < 0.5)
            return "#000";
        else
            return "#FFF";
    }
    , generateColors : function(combo,domElem,colores)
    {
        var scheme = combo.jqxComboBox('val');
        var isCategorical= false;
        if(combo.jqxComboBox('getSelectedItem')!==null)   isCategorical = combo.jqxComboBox('getSelectedItem').group==='Categorical';

        var z = null;
        if(isCategorical)
            z = d4[scheme];
        else
            z = d4["interpolate"+scheme];


        for(var i=0; i<domElem.length;i++) {
            var color;
            if(isCategorical)
                color = d4.color(z[i]);
            else
                color = d4.color(z(i/(domElem.length-1)));

            var elem = $("#"+(domElem[i].attr("id"))+" .jqx-rc-all")
            elem.css('background',color);
            elem.text(_ColorPicker.rgbToHex(color));
            var a = 1 - ( 0.299 * color.r + 0.587 * color.g + 0.114 * color.b)/255;
            var colorText  = "white";
            if (a < 0.5) colorText = "black";
            elem.css("color",colorText);
            colores[i]=_ColorPicker.rgbToHex(color);
        }

        return colores;
    }
};