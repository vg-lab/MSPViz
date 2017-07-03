
 /**
 * @brief
 * @author  Juan Pedro Brito Mendez <juanpebm@gmail.com>
 * @date
 * @remarks Do not distribute without further notice.
 */

JAWDL = function (pUrl, pPort, pProtocol, pUser, pPass)
{
	//Subdivision of pies
	this.folderUrl 	= 	pUrl;
	this.port 		= 	pPort;
	this.protocol 	= 	pProtocol;
	this.user 		= 	pUser;
	this.pass 		= 	pPass;	
};

JAWDL.prototype = 
{	
	constructor: JAWDL,

	prepareURL: function (pURL, pOp) 
	{
		var lURLWellFormed=pURL;
		
		 if (!lURLWellFormed.endsWith("/")) {
			 lURLWellFormed += "/";
		 }
		 lURLWellFormed += pOp;
	
		return lURLWellFormed 
	},

	getProperties: function (pFiletype, callback) 
	{
		var lUrl =  this.prepareURL(this.protocol + "://" + this.folderUrl, '');
		
		$.ajax({
			type: 'PROPFIND',
			url: lUrl,
			dataType: pFiletype,
			success: function(resp) 
			{
				if( callback ) {
					callback(resp);
				}
			},
			error: function(resp) 
			{
				alert("Sorry, an error occured getting server properties.");
			}
		});
	},
	
	loadFiles : function() 
	{		
		var lUrl =  this.prepareURL(this.protocol + "://" + this.folderUrl, "/_DAV/PROPFIND?fields=name,getcontenttype");

		$.getJSON(lUrl, function(response)
					{
						// response is an array of objects
						for( i=1; i<response.length; i++) 
						{ // i=1 because first result is current folder
							fileName 	= response[i].name;
							contentType = response[i].getcontenttype;
							// do something with it
							
							console.log(fileName + " "+ contentType);
						}
					});
	},

	getFile: function (pFile, pFiletype, callback) 
	{
		var lUrl =  this.prepareURL(this.protocol + "://" + this.folderUrl, '');
		
		console.log("Path-->"+lUrl+pFile);
		$.ajax({
			type: 'GET',
			url: lUrl+pFile
			/*
			,headers: 
			{
				"Authorization":"Basic " + btoa("dcacheuser" + ":" + "1234")
			}
			*/
			/*
			,beforeSend: function ( xhr ) 
			{
				xhr.setRequestHeader("Authorization","Basic " + btoa("dcacheuser" + ":" + "1234"));
			}
			*/
			/*
			,username: 'dcacheuser'
			,password: '1234'			
			,xhrFields: 
			{
				withCredentials: true
			}
			*/				
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

	createFolder: function (pFolderName, callback) 
	{
		var lUrl =  this.prepareURL(this.protocol + "://" + this.folderUrl, '_DAV/MKCOL');		 
		 
		 $.ajax({
			 type: 'POST',
			 url: lUrl,
			 data: {
				 name: pFolderName
			 },
			 dataType: "json",
			 success: function(resp) 
			 {
				 if (callback) 
				 {
					 callback(name, resp);
				 }
			 },
			 error: function() 
			 {
				 alert('There was a problem creating the folder');
			 }
		 });
	},

	//Not woriking
	createFile: function (pFile, pFiletype, callback) 
	{
		var lUrl =  this.prepareURL(this.protocol + "://" + this.folderUrl, '');
		
		$.ajax({
			type: 'POST',
			url: lUrl+pFile,
			dataType: pFiletype,
			data : "Prueba de concepto",
			success: function(resp) 
			{
				if( callback ) 
				{
					callback(resp);
				}
			},
			error: function(resp) 
			{
				alert("Sorry, an error occured creating " + url+href + ". Please check your internet connection");
			}
		});
	},


	deleteFile: function (pFile, pFiletype, callback) 
	{
		var lUrl =  this.prepareURL(this.protocol + "://" + this.folderUrl, '');
		
		$.ajax({
			type: 'DELETE',
			url: lUrl+pFile,
			dataType: pFiletype,
			success: function(resp) 
					{
						if( callback ) 
						{
							callback();
						}
					},
			error: function(resp) 
					{
						alert("Sorry, an error occured deleting " + lUrl+'/'+pFile + ". Please check your internet connection");
					}
		});
	},

	
	initAjaxUploads: function(ajaxUploadCompleteHandler) 
	{
		var button = $('#doUpload');
		log("initAjaxUploads", button, ajaxUploadCompleteHandler);
		try {
			new AjaxUpload(button,{
				action: '_DAV/PUT',
				name: 'picd',
				autoSubmit: true,
				responseType: 'json',
				onSubmit : function(file, ext){
					$("span", button).text('Upload...');
					this.disable();
				},
				onComplete: function(file, response){
					$("span", button).text('Upload again');
					this.enable();
					for( i=0; i<response.length; i++ ) {
						var f = response[i];
						if( ajaxUploadCompleteHandler ) {
							var f2 = {
								name: f.originalName, 
								type: f.contentType
							};
							ajaxUploadCompleteHandler(f2);
						} else {
							log(" no callback");
						}
					}
				}          
			});
		} catch(e) {
			log("exception", e);
		}
	}	
	
};
