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

JAWDL = function (pUrl, pPort, pProtocol, pUser, pPass) {
  this.folderUrl = pUrl;
  this.port = pPort;
  this.protocol = pProtocol;
  this.user = pUser;
  this.pass = pPass;
};

JAWDL.prototype = {
    constructor: JAWDL,

    prepareURL: function (pURL, pOp) {
      var lURLWellFormed = pURL;

      if (!lURLWellFormed.endsWith("/")) {
        lURLWellFormed += "/";
      }
      lURLWellFormed += pOp;

      return lURLWellFormed
    },

    getProperties: function (pFiletype, callback) {
      var lUrl = this.prepareURL(this.protocol + "://" + this.folderUrl, '');

      $.ajax({
        type: 'PROPFIND',
        url: lUrl,
        dataType: pFiletype,
        success: function (resp) {
          if (callback) {
            callback(resp);
          }
        },
        error: function (resp) {
          alert("Sorry, an error occured getting server properties.");
        }
      });
    },

    loadFiles: function () {
      var lUrl = this.prepareURL(this.protocol + "://" + this.folderUrl, "/_DAV/PROPFIND?fields=name,getcontenttype");

      $.getJSON(lUrl, function (response) {
        for (i = 1; i < response.length; i++) {
          fileName = response[i].name;
          contentType = response[i].getcontenttype;
          // do something with it

          console.log(fileName + " " + contentType);
        }
      });
    },

    getFile: function (pFile, pFiletype, callback) {
      var lUrl = this.prepareURL(this.protocol + "://" + this.folderUrl, '');

      console.log("Path-->" + lUrl + pFile);
      $.ajax({
        type: 'GET',
        url: lUrl + pFile
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
        , dataType: pFiletype,

        success: function (resp) {
          if (callback) {
            callback(resp);
          }
        },
        error: function (resp) {
          console.debug("failed", resp);
          alert("Sorry, an error occured getting " + url + pFile + ". Please check your internet connection");
        }
      });
    },

    createFolder: function (pFolderName, callback) {
      var lUrl = this.prepareURL(this.protocol + "://" + this.folderUrl, '_DAV/MKCOL');

      $.ajax({
        type: 'POST',
        url: lUrl,
        data: {
          name: pFolderName
        },
        dataType: "json",
        success: function (resp) {
          if (callback) {
            callback(name, resp);
          }
        },
        error: function () {
          alert('There was a problem creating the folder');
        }
      });
    },

    //Not woriking
    createFile: function (pFile, pFiletype, callback) {
      var lUrl = this.prepareURL(this.protocol + "://" + this.folderUrl, '');

      $.ajax({
        type: 'POST',
        url: lUrl + pFile,
        dataType: pFiletype,
        data: "Prueba de concepto",
        success: function (resp) {
          if (callback) {
            callback(resp);
          }
        },
        error: function (resp) {
          alert("Sorry, an error occured creating " + url + href + ". Please check your internet connection");
        }
      });
    },


    deleteFile: function (pFile, pFiletype, callback) {
      var lUrl = this.prepareURL(this.protocol + "://" + this.folderUrl, '');

      $.ajax({
        type: 'DELETE',
        url: lUrl + pFile,
        dataType: pFiletype,
        success: function (resp) {
          if (callback) {
            callback();
          }
        },
        error: function (resp) {
          alert("Sorry, an error occured deleting " + lUrl + '/' + pFile + ". Please check your internet connection");
        }
      });
    },

    initAjaxUploads: function (ajaxUploadCompleteHandler) {
      var button = $('#doUpload');
      log("initAjaxUploads", button, ajaxUploadCompleteHandler);
      try {
        new AjaxUpload(button, {
          action: '_DAV/PUT',
          name: 'picd',
          autoSubmit: true,
          responseType: 'json',
          onSubmit: function (file, ext) {
            $("span", button).text('Upload...');
            this.disable();
          },
          onComplete: function (file, response) {
            $("span", button).text('Upload again');
            this.enable();
            for (i = 0; i < response.length; i++) {
              var f = response[i];
              if (ajaxUploadCompleteHandler) {
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
      } catch (e) {
        log("exception", e);
      }
    }

  };
