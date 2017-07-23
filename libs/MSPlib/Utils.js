/**
 * @brief
 * @author  Juan Pedro Brito Mendez <juanpebm@gmail.com>
 * @date
 * @remarks Do not distribute without further notice.
 */

//Namespaces
var MSP = MSP || {};
var UI = UI || {};

function removeA(arr) {
    var what, a = arguments, L = a.length, ax;
    while (L > 1 && arr.length) {
        what = a[--L];
        while ((ax = arr.indexOf(what)) !== -1) {
            arr.splice(ax, 1);
        }
    }
    return arr;
}

function isDefined(variable) {
    return (typeof(window[variable]) != "undefined");
}

d3.selection.prototype.moveToFront = function () {
    return this.each(function () {
        this.parentNode.appendChild(this);
    });
};

function saveAsImage() {
    var html = d3.select("svg")
        .attr("version", 1.1)
        .attr("xmlns", "http://www.w3.org/2000/svg")
        .node().parentNode.innerHTML;

    var imgsrc = 'data:image/svg+xml;base64,' + btoa(html);
    var img = '<img src="' + imgsrc + '">';
    d3.select("#svgdataurl").html(img);

    var canvas = document.querySelector("canvas"),
        context = canvas.getContext("2d");

    var image = new Image;
    image.src = imgsrc;
    image.onload = function () {
        context.drawImage(image, 0, 0);

        var canvasdata = canvas.toDataURL("image/png");

        var pngimg = '<img src="' + canvasdata + '">';
        d3.select("#pngdataurl").html(pngimg);

        var a = document.createElement("a");
        a.download = "sample.png";
        a.href = canvasdata;
        a.click();
    };
    delete image;

//// Canvasg	
//	  var html = d3.select("svg")
//				.attr("version", 1.1)
//				.attr("xmlns", "http://www.w3.org/2000/svg")
//				        .node().parentNode.innerHTML;
//	
//	//	// the canvg call that takes the svg xml and converts it to a canvas
//	//	canvg('canvas', $("#svg").html());
//	  
//	// the canvas calls to output a png
//	  var imgsrc = 'data:image/svg+xml;base64,'+ btoa(html);
//	  var img = '<img src="'+imgsrc+'">'; 
//	  
//	  canvg(document.getElementById('canvas'), img);
//
//	  var c = document.getElementById('canvas');
//	  var ctx = c.getContext('2d');
////	  ctx.drawSvg(html, 0, 0, 1024, 768);
//	  
////	  //Export to file
////	  var canvas = document.getElementById("canvas");
////	  var imgExp    = canvas.toDataURL("image/png");
////	  document.write('<img src="'+imgExp+'"/>');

    // Otro canvasg
//	//document.createElement('canvas')
//	var svg = $("#svg").html();
//	
//	var c = document.getElementById('canvas');		
//	c.width = 1024;
//	c.height = 768;
//	document.getElementById('canvas').innerHTML = '';
//	document.getElementById('canvas').appendChild(c);
//	
//	canvg(c, svg, { log: true, renderCallback: function (dom) {
//		if (typeof FlashCanvas != "undefined") 
//		{
//			document.getElementById('svg').innerHTML = 'svg not supported';
//		} else 
//		{
//			var svg = (new XMLSerializer()).serializeToString(dom);
//			document.getElementById('svg').innerHTML = svg;
//			if (overrideTextBox) 
//			{
//				document.getElementById('input').value = svg;
//				overrideTextBox = false;
//			}
//		}
//	}});

}

function make_base_auth(user, password) {
    var tok = user + ':' + password;
    var hash = btoa(tok);
    return "Basic " + hash;
}


//Create the XHR object.
function createCORSRequest(method, url) {
    var xhr = new XMLHttpRequest();

    if ("withCredentials" in xhr) {
        // XHR for Chrome/Firefox/Opera/Safari.
        xhr.open(method, url, true);
    } else if (typeof XDomainRequest != "undefined") {
        // XDomainRequest for IE.
        xhr = new XDomainRequest();
        xhr.open(method, url);
    }
    else {
        // CORS not supported.
        xhr = null;
    }
    return xhr;
}

//Helper method to parse the title tag from the response.
function getTitle(text) {
    return text.match('<title>(.*)?</title>')[1];
}

//Make the actual CORS request.
function makeCorsRequest(pURL) {

    // All HTML5 Rocks properties support CORS.
    var url = pURL;
    var method = "GET";
    var xhr = new XMLHttpRequest();

    if ("withCredentials" in xhr) {
        // XHR for Chrome/Firefox/Opera/Safari.
        xhr.open(method, url, true);
    } else if (typeof XDomainRequest != "undefined") {
        // XDomainRequest for IE.
        xhr = new XDomainRequest();
        xhr.open(method, url);
    }
    else {
        // CORS not supported.
        xhr = null;
    }
    //return xhr;
    //////////////////////////////////////////////////

    if (!xhr) {
        alert('CORS not supported');
        return;
    }

    // Response handlers.
    xhr.onload = function () {
//		var text = xhr.responseText;
//		var title = getTitle(text);
//		alert('Response from CORS request to ' + url + ': ' + title);

        console.log(xhr.responseText);

        //_GlobalSimulationParams.LoadSimulation(url);
    };

    xhr.onerror = function () {

        alert('There was an error making the request.');
        console.log(xhr.responseText);
    };

    //xhr.send();
    return xhr;
}


function setCookie(cname, cvalue, exdays) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
    var expires = "expires=" + d.toUTCString();
    document.cookie = cname + "=" + JSON.stringify(cvalue) + ";" + expires + ";path=/";
}

function getCookie(cname) {
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}

function updateCookieColor() {
    var valores = getConfig();
    setCookie("color", valores, 2000);
}

function getConfig() {
    var valores = {
        neuronST: 0, neuronS: 5, excitatoryC: '#e41a1c', inhibitoryC: '#377eb8',
        connST: 0, connS: 5, EEC: '#e41a1c', EIC: '#377eb8', IEC: '#4daf4a', IIC: '#984ea3',
        calciumST: 1, calciumS: 1, caMaxC: '#000004', caMinC: '#fcffa4'
    };

    valores.neuronST = $("#comboScaleTypeNeuron").prop('selectedIndex');
    valores.connST = $("#comboScaleTypeConnection").prop('selectedIndex');
    valores.calciumST = $("#comboScaleTypeCalcium").prop('selectedIndex');
    valores.neuronS = $("#comboScaleNeuron").prop('selectedIndex');
    valores.connS = $("#comboScaleConnection").prop('selectedIndex');
    valores.calciumS = $("#comboScaleCalcium").prop('selectedIndex');
    valores.excitatoryC = $("#dropDownExcitatoryButton").children("span").text();
    valores.inhibitoryC = $("#dropDownInhibitoryButton").children("span").text();
    valores.EEC = $("#dropDownEEButton").children("span").text();
    valores.EIC = $("#dropDownEIButton").children("span").text();
    valores.IEC = $("#dropDownIEButton").children("span").text();
    valores.IIC = $("#dropDownIIButton").children("span").text();
    valores.caaxC = $("#dropDownCaMinValueColorButton").children("span").text();
    valores.caMinC = $("#dropDownCaMaxValueColorButton").children("span").text();
    return valores;
}

function generateNav() {

    var data = _SigletonConfig.navBar;
    var divPadre = $("#navButtons");
    divPadre.empty();
    data.forEach(function (d, i) {
        divPadre.append('<input class="btnSwitch' + (i === 0 ? ' active' : '') + '" type="button" value="' + d.label + '" onclick="navBar(' + i + ',' + d.viewID + ')"/>');
    })


}

function delCenter(idx) {
    _SimulationData.gNeurons[idx].centerElipse = false;
    $(".btnCentro").each(function () {
        if ($(this).text() === idx+"") $(this).remove();
    });
    _SimulationController.view.update();
}


function navBar(btnIdx, viewID) {
    var btnsBar = $(".btnSwitch");
    btnsBar.removeClass("active");
    btnsBar.eq(btnIdx).addClass("active");
    _gVisualizatorUI.generateView(viewID);
}

function loadCookieColor() {
    var valCookie = getCookie("color");
    if (valCookie != "") {
        var valores = JSON.parse(valCookie);
        $("#comboScaleTypeNeuron").prop('selectedIndex', valores.neuronST);
        $('#comboScaleTypeNeuron').trigger('change');
        $("#comboScaleTypeConnection").prop('selectedIndex', valores.connST);
        $('#comboScaleTypeConnection').trigger('change');
        $("#comboScaleTypeCalcium").prop('selectedIndex', valores.calciumST);
        $('#comboScaleTypeCalcium').trigger('change');
        $("#comboScaleNeuron").prop('selectedIndex', valores.neuronS);
        $('#comboScaleNeuron').trigger('change');
        $("#comboScaleConnection").prop('selectedIndex', valores.connS);
        $('#comboScaleConnection').trigger('change');
        $("#comboScaleCalcium").prop('selectedIndex', valores.calciumS);
        $('#comboScaleCalcium').trigger('change');
        $("#dropDownExcitatoryButton").children("span").text(valores.excitatoryC);
        $("#dropDownInhibitoryButton").children("span").text(valores.inhibitoryC);
        $("#dropDownEEButton").children("span").text(valores.EEC);
        $("#dropDownEIButton").children("span").text(valores.EIC);
        $("#dropDownIEButton").children("span").text(valores.IEC);
        $("#dropDownIIButton").children("span").text(valores.IIC);
        $("#dropDownCaMinValueColorButton").children("span").text(valores.caMaxC);
        $("#dropDownCaMaxValueColorButton").children("span").text(valores.caMinC);
        console.log(valores);
    }

}

function loadConfig(valores) {

    $("#comboScaleTypeNeuron").prop('selectedIndex', valores.neuronST);
    $('#comboScaleTypeNeuron').trigger('change');
    $("#comboScaleTypeConnection").prop('selectedIndex', valores.connST);
    $('#comboScaleTypeConnection').trigger('change');
    $("#comboScaleTypeCalcium").prop('selectedIndex', valores.calciumST);
    $('#comboScaleTypeCalcium').trigger('change');
    $("#comboScaleNeuron").prop('selectedIndex', valores.neuronS);
    $('#comboScaleNeuron').trigger('change');
    $("#comboScaleConnection").prop('selectedIndex', valores.connS);
    $('#comboScaleConnection').trigger('change');
    $("#comboScaleCalcium").prop('selectedIndex', valores.calciumS);
    $('#comboScaleCalcium').trigger('change');
    $("#dropDownExcitatoryButton").children("span").text(valores.excitatoryC);
    $("#dropDownInhibitoryButton").children("span").text(valores.inhibitoryC);
    $("#dropDownEEButton").children("span").text(valores.EEC);
    $("#dropDownEIButton").children("span").text(valores.EIC);
    $("#dropDownIEButton").children("span").text(valores.IEC);
    $("#dropDownIIButton").children("span").text(valores.IIC);
    $("#dropDownCaMinValueColorButton").children("span").text(valores.caMaxC);
    $("#dropDownCaMaxValueColorButton").children("span").text(valores.caMinC);
    updateCookieColor();
}

function saveConfig() {
    var textToSave = JSON.stringify(getConfig());
    var hiddenElement = document.createElement('a');
    hiddenElement.href = 'data:attachment/text,' + encodeURI(textToSave);
    hiddenElement.target = '_blank';
    hiddenElement.download = 'config.json';
    hiddenElement.click();
}

function rgbToHex(color) {
    var hexColor = "#";
    for(var i =0 ; i< 3; i++){
        var hexChannel = color[i].toString(16);
        if(hexChannel.length === 1)
            hexChannel = "0" + hexChannel;
        hexColor += hexChannel;
    }
    return hexColor;
}
//# sourceURL=Utils.js