

//Namespaces
var MSP = MSP || {}; //MSP model DE
var UI = UI || {};

function removeA(arr) 
{
	var what, a = arguments, L = a.length, ax;
	while (L > 1 && arr.length) 
	{
		what = a[--L];
		while ((ax= arr.indexOf(what)) !== -1) 
		{
            arr.splice(ax, 1);
        }
    }
    return arr;
}

function isDefined( variable) { return (typeof(window[variable]) != "undefined");}

d3.selection.prototype.moveToFront = function() 
{
	return this.each(function()
					{
						this.parentNode.appendChild(this);
					});
};

function saveAsImage()
{	
	  var html = d3.select("svg")
					.attr("version", 1.1)
					.attr("xmlns", "http://www.w3.org/2000/svg")
					        .node().parentNode.innerHTML;
	 
	  var imgsrc = 'data:image/svg+xml;base64,'+ btoa(html);
	  var img = '<img src="'+imgsrc+'">'; 
	  d3.select("#svgdataurl").html(img);
	 
	  var canvas = document.querySelector("canvas"),
	  context = canvas.getContext("2d");
	 
	  var image = new Image;
	  image.src = imgsrc;
	  image.onload = function() 
	  {
		  context.drawImage(image, 0, 0);
	 
		  var canvasdata = canvas.toDataURL("image/png");
	 
		  var pngimg = '<img src="'+canvasdata+'">'; 
		  d3.select("#pngdataurl").html(pngimg);
	 
		  var a = document.createElement("a");
		  a.download = "sample.png";
		  a.href = canvasdata;
		  a.click();
	  };
	  delete image;
}

function make_base_auth(user, password) 
{
    var tok = user + ':' + password;
    var hash = btoa(tok);
    return "Basic " + hash;
}


//Create the XHR object.
function createCORSRequest(method, url) 
{
	var xhr = new XMLHttpRequest();

	if ("withCredentials" in xhr) 
	{
		// XHR for Chrome/Firefox/Opera/Safari.
		xhr.open(method, url, true);
	} else if (typeof XDomainRequest != "undefined") 
			{
				// XDomainRequest for IE.
				xhr = new XDomainRequest();
				xhr.open(method, url);
			} 
			else 
			{
				// CORS not supported.
				xhr = null;
			}
	return xhr;
}

//Helper method to parse the title tag from the response.
function getTitle(text) 
{
	return text.match('<title>(.*)?</title>')[1];
}

//Make the actual CORS request.
function makeCorsRequest(pURL) 
{
	
	// All HTML5 Rocks properties support CORS.
	var  	url 	= pURL;
	var  	method 	= "GET";	
	var 	xhr 	= new XMLHttpRequest();

	if ("withCredentials" in xhr) 
	{
		// XHR for Chrome/Firefox/Opera/Safari.
		xhr.open(method, url, true);
	} else if (typeof XDomainRequest != "undefined") 
			{
				// XDomainRequest for IE.
				xhr = new XDomainRequest();
				xhr.open(method, url);
			} 
			else 
			{
				// CORS not supported.
				xhr = null;
			}
	//return xhr;
	//////////////////////////////////////////////////
		
	if (!xhr) 
	{
		alert('CORS not supported');
		return;
	}

	// Response handlers.
	xhr.onload = function() 
	{
//		var text = xhr.responseText;
//		var title = getTitle(text);
//		alert('Response from CORS request to ' + url + ': ' + title);
		
		console.log(xhr.responseText);
		
		//_GlobalSimulationParams.LoadSimulation(url);		
	};

	xhr.onerror = 	function() 
	{
		
		alert('There was an error making the request.');
		console.log(xhr.responseText);
	};

	//xhr.send();
	return xhr;
}
