/*
 * Copyright (c) 2017 CCS/GMRV/UPM/URJC.
 *
 * Authors: Juan P. Brito <juanpedro.brito@upm.es>
 * 			Nicusor Cosmin Toader <cosmin.toader.nicu@gmail.com> 
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

