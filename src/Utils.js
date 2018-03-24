/*
 * Copyright (c) 2017 CCS/GMRV/UPM/URJC.
 *
 * Authors: Juan P. Brito <juanpedro.brito@upm.es>
 * 			Nicusor Cosmin Toader <cosmin.toader@urjc.es>
 *
 * This library is free software; you can redistribute it and/or modify it under
 * the terms of the GNU Lesser General Public License version 3.0 as published
 * by the Free Software Foundation.
 *
 * This library is distributed in the hope that it will be useful, but WITHOUT
 * ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS
 * FOR A PARTICULAR PURPOSE.  See the GNU Lesser General Public License for more
 * details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with this library; if not, write to the Free Software Foundation, Inc.,
 * 51 Franklin Street, Fifth Floor, Boston, MA 02110-1301 USA.
 *
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

function dataURLtoBlob(dataurl) {
  var arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1],
    bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], {type: mime});
}

function downloadCanvas(imgData, name) {
  var tempDownloadLink = document.createElement("a");
  document.body.appendChild(tempDownloadLink);
  var blob = dataURLtoBlob(imgData);
  var objurl = URL.createObjectURL(blob);
  tempDownloadLink.download = name + ".png";
  tempDownloadLink.href = objurl;
  tempDownloadLink.click();
  document.body.removeChild(tempDownloadLink);
}

function toColor(num) {
  num >>>= 0;
  var b = num & 0xFF,
    g = (num & 0xFF00) >>> 8,
    r = (num & 0xFF0000) >>> 16;
  return "rgb(" + [r, g, b].join(",") + ")";
}

function cleanRenderArea() {
  d3.selectAll("svg").filter(function () {
    return !this.classList.contains('color')
  }).remove();

  d3.selectAll("canvas").filter(function () {
    return !this.classList.contains('imgCanvas')
  }).remove();
}

function saveAsImage() {
  if ($("#renderArea").has("svg").size() === 0) {
    var canvas = $("#renderArea canvas")[0];
    var canvasdata = canvas.toDataURL({format: 'png', multiplier: 4});

    var pngimg = '<img src="' + canvasdata + '">';
    d3.select("#pngdataurl").html(pngimg);

    downloadCanvas(canvasdata, "snapshot")
  } else {

    d3.select("#renderArea").selectAll("svg")
      .attr("version", 1.1)
      .attr("xmlns", "http://www.w3.org/2000/svg")
      .each(function (d, i) {

        var html = $(this)[0].outerHTML;
        var imgsrc = 'data:image/svg+xml;base64,' + btoa(html);
        var img = '<img src="' + imgsrc + '">';
        d3.select("#svgdataurl").html(img);
        d3.select("#canvas")
          .attr("height", $(this).height())
          .attr("width", $(this).width());

        var canvas = document.querySelector("canvas"),
          context = canvas.getContext("2d");

        var image = new Image;
        image.src = imgsrc;
        image.onload = function () {
          context.clearRect(0, 0, canvas.width, canvas.height);
          context.drawImage(image, 0, 0);

          var canvasdata = canvas.toDataURL("image/png");

          var pngimg = '<img src="' + canvasdata + '">';
          d3.select("#pngdataurl").html(pngimg);

          downloadCanvas(canvasdata, "snapshot" + i)
        };
      });

  }
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
    console.log(xhr.responseText);
  };

  xhr.onerror = function () {

    alert('There was an error making the request.');
    console.log(xhr.responseText);
  };

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
  var values = getConfig();
  setCookie("color", values, 2000);
}

function getConfig() {
  var valores = {
    neuronST: 0, neuronS: 5, excitatoryC: '#e41a1c', inhibitoryC: '#377eb8', axonalC: '#62d14b',
    connST: 0, connS: 5, EEC: '#e41a1c', EIC: '#377eb8', IEC: '#4daf4a', IIC: '#984ea3',
    calciumST: 1, calciumS: 1, caMaxC: '#fcffa4', caMinC: '#000004'
  };

  valores.neuronST = $("#comboScaleTypeNeuron").prop('selectedIndex');
  valores.connST = $("#comboScaleTypeConnection").prop('selectedIndex');
  valores.calciumST = $("#comboScaleTypeCalcium").prop('selectedIndex');
  valores.neuronS = $("#comboScaleNeuron").prop('selectedIndex');
  valores.connS = $("#comboScaleConnection").prop('selectedIndex');
  valores.calciumS = $("#comboScaleCalcium").prop('selectedIndex');
  valores.excitatoryC = $("#dropDownExcitatoryButton").children("span").text();
  valores.inhibitoryC = $("#dropDownInhibitoryButton").children("span").text();
  valores.axonalC = $("#dropDownAxonalButton").children("span").text();
  valores.EEC = $("#dropDownEEButton").children("span").text();
  valores.EIC = $("#dropDownEIButton").children("span").text();
  valores.IEC = $("#dropDownIEButton").children("span").text();
  valores.IIC = $("#dropDownIIButton").children("span").text();
  valores.caMaxC = $("#dropDownCaMaxValueColorButton").children("span").text();
  valores.caMinC = $("#dropDownCaMinValueColorButton").children("span").text();
  return valores;
}

function generateNav() {

  var data = _SingletonConfig.navBar;
  var parentDiv = $("#navButtons");
  parentDiv.empty();
  data.forEach(function (d, i) {
    parentDiv.append('<input class="btnSwitch' + (i === 0 ? ' active' : '') + '" type="button" value="' + d.label +
                    '" onclick="navBar(' + i + ',' + d.viewID + ')"/>');
  })
}

function delCenter(idx) {
  _SimulationData.gNeurons[idx].centerElipse = false;
  $(".ellipseButton").each(function () {
    if ($(this).text() === idx + "") $(this).remove();
  });
  _SimulationController.view.update();
}

function navBar(btnIdx, viewID) {
  var btnsBar = $(".btnSwitch");
  btnsBar.removeClass("active");
  btnsBar.eq(btnIdx).addClass("active");
  _gVisualizerUI.generateView(viewID);
}

function loadCookieColor() {
  var valCookie = getCookie("color");
  if (valCookie != "") {
    var values = JSON.parse(valCookie);
    loadConfig(values);
    console.log(values);
  }

}

function loadConfig(values) {

  $("#comboScaleTypeNeuron").prop('selectedIndex', values.neuronST);
  $('#comboScaleTypeNeuron').trigger('change');
  $("#comboScaleTypeConnection").prop('selectedIndex', values.connST);
  $('#comboScaleTypeConnection').trigger('change');
  $("#comboScaleTypeCalcium").prop('selectedIndex', values.calciumST);
  $('#comboScaleTypeCalcium').trigger('change');
  $("#comboScaleNeuron").prop('selectedIndex', values.neuronS);
  $('#comboScaleNeuron').trigger('change');
  $("#comboScaleConnection").prop('selectedIndex', values.connS);
  $('#comboScaleConnection').trigger('change');
  $("#comboScaleCalcium").prop('selectedIndex', values.calciumS);
  $('#comboScaleCalcium').trigger('change');

  _SingletonConfig.EColor = values.excitatoryC;
  _SingletonConfig.IColor = values.inhibitoryC;
  _SingletonConfig.AColor = values.axonalC;
  _SingletonConfig.EEColor = values.EEC;
  _SingletonConfig.EIColor = values.EIC;
  _SingletonConfig.IEColor = values.IEC;
  _SingletonConfig.IIColor = values.IIC;
  _SingletonConfig.maxCaColor = values.caMaxC;
  _SingletonConfig.minCaColor = values.caMinC;

  var colorElements = [
    {id: "#dropDownInhibitoryButton", color: _SingletonConfig.IColor},
    {id: "#dropDownExcitatoryButton", color: _SingletonConfig.EColor},
    {id: "#dropDownAxonalButton", color: _SingletonConfig.AColor},
    {id: "#dropDownEEButton", color: _SingletonConfig.EEColor},
    {id: "#dropDownEIButton", color: _SingletonConfig.EIColor},
    {id: "#dropDownIEButton", color: _SingletonConfig.IEColor},
    {id: "#dropDownIIButton", color: _SingletonConfig.IIColor},
    {id: "#dropDownCaMinValueColorButton", color: _SingletonConfig.minCaColor},
    {id: "#dropDownCaMaxValueColorButton", color: _SingletonConfig.maxCaColor}
  ];

  colorElements.forEach(function (elem) {
    var selector = $(elem.id);
    selector.children("div").css("background", elem.color);
    selector.children("span").text(elem.color);
  });
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
  for (var i = 0; i < 3; i++) {
    var hexChannel = color[i].toString(16);
    if (hexChannel.length === 1)
      hexChannel = "0" + hexChannel;
    hexColor += hexChannel;
  }
  return hexColor;
}

