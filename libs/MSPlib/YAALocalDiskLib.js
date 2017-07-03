
 /**
 * @brief
 * @author  Juan Pedro Brito Mendez <juanpebm@gmail.com>
 * @date
 * @remarks Do not distribute without further notice.
 */

YAALocalDiskLib = function (pUrl, pProtocol)
{
	//Subdivision of pies
	this.folderUrl 	= 	pUrl;
	this.protocol 	= 	pProtocol;
};

YAALocalDiskLib.prototype = 
{	
	constructor: YAALocalDiskLib,

	prepareURL: function (pURL, pOp) 
	{
		var lURLWellFormed=pURL;
		
		 if (!lURLWellFormed.endsWith("/")) {
			 lURLWellFormed += "/";
		 }

		 return lURLWellFormed;
	},
	
	getFile: function (pFile, pFiletype, callback) 
	{
		var lUrl =  this.prepareURL(this.protocol + ":///" + this.folderUrl, '');
		
		console.log("Path-->"+lUrl+pFile);
		$.ajax({
			type: 'GET',
			url: lUrl+pFile
			,dataType: pFiletype,
			
			success: function(resp) 
			{
				if( callback ) {
					callback(resp);
				}
			},
			error: function(resp) 
			{
				console.debug("failed", resp);
				alert("Sorry, an error occured getting " + url+pFile + ". Please check your internet connection");
			}
		});
	},
};

