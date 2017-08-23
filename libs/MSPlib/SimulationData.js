/**
 * @brief
 * @author  Juan Pedro Brito Mendez <juanpebm@gmail.com>
 * @date
 * @remarks Do not distribute without further notice.
 */

MSP.SimulationData = function () {
    this.steps = 0;
    this.timeInterval = 0;

    //Extreme calciums values
    this.maxCalciumEValue = 0;
    this.minCalciumEValue = 0;
    this.maxCalciumIValue = 0;
    this.minCalciumIValue = 0;
    this.maxCalciumTValue = 0;
    this.minCalciumTValue = 0;

    //Extreme calciums values from File
    this.maxFileCalciumEValue = 0;
    this.minFileCalciumEValue = 0;
    this.maxFileCalciumIValue = 0;
    this.minFileCalciumIValue = 0;
    this.maxFileCalciumTValue = 0;
    this.minFileCalciumTValue = 0;

    //Extreme values of global connections
    this.maxTEConn = 0;
    this.minTIConn = 0;
    this.maxEEConn = 0;
    this.minEIConn = 0;
    this.maxIEConn = 0;
    this.minIIConn = 0;

    //Number of global connections
    this.TEConn = [];
    this.TIConn = [];
    this.EEConn = [];
    this.EIConn = [];
    this.IEConn = [];
    this.IIConn = [];

    this.AESe = [];
    this.AISe = [];

    this.gNeurons = [];
    this.gNeuronsRep = [];
    this.gConnectivity = [];

    this.drawEEConn = true;
    this.drawEIConn = true;
    this.drawIEConn = true;
    this.drawIIConn = true;

    /* Global Vars */
    this.DefaultLocalNeuronInformationFile = "LocalNeuronInformation.json";
    this.DefaultGlobalSimulationParamsFile = "GlobalSimulationParams.json";
    this.DefaultConnectivityFile = "Connectivity.json";

    this.stdSimulationFileNames = ["_SimulationFiles.json.scf"
        , "LocalNeuronCommonInfo.json"
        , "LocalNeuronInfo_0.json"
        , "GlobalSimulationParamsV2.json"
        , "GlobalParams_0.json"
        , "Connectivity_0.json"];

    this.stdSimulationFileIds = ["LocalNeuronCommonInfo"
        , "LocalNeuronInfo"
        , "GlobalSimulationParams"
        , "GlobalParams"
        , "Connectivity"];


    this.gLocalNeuronInformationFile = "";
    this.gGlobalSimulationParamsFile = "";
    this.gConnectivityFile = "";

    this.CaIScale = null;
    this.CaEScale = null;

    this.requester = null;

    this.gNeurons = null;
    this.gNeuronsDetails = null;

    //Info par ala recarga de datos
    this.totalSimulationSteps = null;
    this.numSimStepsPerFile = null;
    this.bufferSimulationSteps = null;
    this.actFile = 0;

    this.neuronsDetailsBuffer = null;
    this.connectivityBuffer = null;
    this.SEContainerBuffer = null;

    this.SimulationId = null;
    this.ServerPath = "./content/Simulations/";

    this.SimulationLoadType = ["Local", "Server", "WebDav"];
    this.actualSimulationLoadType = null;
    this.WebDavCascadeLoad = false;
    this.numFilesLoaded = 0;
};

//Methods
MSP.SimulationData.prototype =
    {
        constructor: MSP.SimulationData

        , calculateMaxMinValues: function () {
        this.maxTEConn = Math.max.apply(Math, this.TEConn);
        this.minTEConn = Math.min.apply(Math, this.TEConn);

        this.maxTIConn = Math.max.apply(Math, this.TIConn);
        this.minTIConn = Math.min.apply(Math, this.TIConn);

        this.maxEEConn = Math.max.apply(Math, this.EEConn);
        this.minEEConn = Math.min.apply(Math, this.EEConn);

        this.maxEIConn = Math.max.apply(Math, this.EIConn);
        this.minEIConn = Math.min.apply(Math, this.EIConn);

        this.maxIEConn = Math.max.apply(Math, this.IEConn);
        this.minIEConn = Math.min.apply(Math, this.IEConn);

        this.maxIIConn = Math.max.apply(Math, this.IIConn);
        this.minIIConn = Math.min.apply(Math, this.IIConn);
    },

        calculateAllSynapticElements: function () {
            var self = this;
            var lAESeTmp = 0;
            var lAISeTmp = 0;

            //All the sim steps
            for (var j = 0; j < self.numSimStepsPerFile; ++j) {
                //All the neurons
                lAESeTmp = 0;
                lAISeTmp = 0;
                for (var i = 0; i < self.gNeuronsDetails.length; ++i) {
                    lAESeTmp += self.gNeuronsDetails[i].DeSeEA[j];
                    lAISeTmp += self.gNeuronsDetails[i].DeSeIA[j];

                    if (self.gNeurons[i].NAct == "E") {
                        lAESeTmp += self.gNeuronsDetails[i].AxSeA[j];
                    }
                    else {
                        lAISeTmp += self.gNeuronsDetails[i].AxSeA[j];
                    }
                }
                this.AESe.push(lAESeTmp);
                this.AISe.push(lAISeTmp);
            }

            this.maxAESe = 0;
            this.maxAISe = 0;
            for (var i = 0; i < this.AESe.length; i++) {
                if (this.maxAESe < this.AESe[i]) this.maxAESe = this.AESe[i];
                if (this.maxAISe < this.AISe[i]) this.maxAISe = this.AISe[i];
            }
        },

        LoadLocalSimulation: function (pFiles) {
            var self = this;

            self.actualSimulationLoadType = self.SimulationLoadType[0];

            var pathToFiles = ["_SimulationFiles.json.scf"
                , "LocalNeuronCommonInfo.json"
                , "LocalNeuronInfo_0.json"
                , "GlobalSimulationParamsV2.json"
                , "GlobalParams_0.json"
                , "Connectivity_0.json"];

            var lProgres = 1;
            $("#jqxBottomControls_ProgressBar").jqxProgressBar({value: lProgres});

            _gVisualizatorUI.disableUI(true);

            //.cfg simulation file
            var readerSimulationFiles = new FileReader();
            readerSimulationFiles.onloadend = function (evt) {
                lProgres += 9;
                $("#jqxBottomControls_ProgressBar").jqxProgressBar({value: lProgres});

                self.cfgSimulationFiles = JSON.parse(readerSimulationFiles.result);
                self.actFile = 0;

                //LocalInfo
                var readerLocalNeuronCommonInfo = new FileReader();
                readerLocalNeuronCommonInfo.onloadend = function (evt) {
                    lProgres += 20;
                    $("#jqxBottomControls_ProgressBar").jqxProgressBar({value: lProgres});

                    self.gNeurons = JSON.parse(readerLocalNeuronCommonInfo.result);

                    //Global info file 0
                    var readerLocalNeuronInfo = new FileReader();
                    readerLocalNeuronInfo.onloadend = function (evt) {
                        lProgres += 20;
                        $("#jqxBottomControls_ProgressBar").jqxProgressBar({value: lProgres});

                        self.gNeuronsDetails = JSON.parse(readerLocalNeuronInfo.result);
                    };
                    var blobLocalNeuronInfo = pFiles[pathToFiles[2]];
                    readerLocalNeuronInfo.readAsText(blobLocalNeuronInfo, "utf-8");

                    //GlobalInfo
                    var readerGlobalSimulationParams = new FileReader();
                    readerGlobalSimulationParams.onloadend = function (evt) {
                        lProgres += 20;
                        $("#jqxBottomControls_ProgressBar").jqxProgressBar({value: lProgres});

                        var jsonGSP = JSON.parse(readerGlobalSimulationParams.result);

                        //Load global params
                        self.steps = jsonGSP.simSteps;

                        //###Calculated from file, but no setpoint file
                        self.maxFileECalciumValue = jsonGSP.maxECalciumValue;
                        self.minFileECalciumValue = jsonGSP.minECalciumValue;
                        self.maxFileICalciumValue = jsonGSP.maxICalciumValue;
                        self.minFileICalciumValue = jsonGSP.minICalciumValue;

                        //Global calcium values
                        self.minCalciumValue = jsonGSP.minCalciumValue;
                        self.maxCalciumValue = jsonGSP.maxCalciumValue;

                        self.totalSimulationSteps = jsonGSP.totalSimulationSteps;
                        self.numSimStepsPerFile = jsonGSP.numSimStepsPerFile;
                        self.bufferSimulationSteps = jsonGSP.bufferSimulationSteps;

                        //Global info file 0
                        var readerGlobalParams = new FileReader();
                        readerGlobalParams.onloadend = function (evt) {
                            lProgres += 10;
                            $("#jqxBottomControls_ProgressBar").jqxProgressBar({value: lProgres});

                            var jsonGP = JSON.parse(readerGlobalParams.result);

                            _SimulationData.TEConn = jsonGP['TEConn'];
                            _SimulationData.TIConn = jsonGP['TIConn'];
                            _SimulationData.EEConn = jsonGP['EEConn'];
                            _SimulationData.EIConn = jsonGP['EIConn'];
                            _SimulationData.IEConn = jsonGP['IEConn'];
                            _SimulationData.IIConn = jsonGP['IIConn'];

                            //Calculate max and min values
                            self.calculateMaxMinValues();

                            //Calculate the scales
                            self.recalculateScales(_SigletonConfig.minCaColor
                                , _SigletonConfig.maxCaColor
                                , _SigletonConfig.ColorInerpolMethod);

                            //Recalculate positions
                            self.recalculatePositions();
                            while (self.gNeuronsDetails.length < self.gNeurons.length) {
                            }
                            self.calculateAllSynapticElements();
                        };
                        var blobreaderGlobalParams = pFiles[pathToFiles[4]];
                        readerGlobalParams.readAsText(blobreaderGlobalParams, "utf-8");

                    };
                    var blobGlobalSimulationParams = pFiles[pathToFiles[3]];
                    readerGlobalSimulationParams.readAsText(blobGlobalSimulationParams, "utf-8");

                    //Conectivity
                    var readerConnectivity = new FileReader();
                    readerConnectivity.onloadend = function (evt) {
                        //self.gConnectivity = jsonC;
                        self.gConnectivity = JSON.parse(readerConnectivity.result);

                        lProgres += 20;
                        $("#jqxBottomControls_ProgressBar").jqxProgressBar({value: lProgres});

                        self.loadSimulationEnd();
                    };
                    var blobConnectivity = pFiles[pathToFiles[5]];
                    readerConnectivity.readAsText(blobConnectivity, "utf-8");
                };
                var blobLocalNeuronCommonInfo = pFiles[pathToFiles[1]];
                readerLocalNeuronCommonInfo.readAsText(blobLocalNeuronCommonInfo, "utf-8");
            };
            var blobSimulationFiles = pFiles["_SimulationFiles.json.scf"];
            console.log("Fichero a importar: " + pFiles["_SimulationFiles.json.scf"]);
            readerSimulationFiles.readAsText(blobSimulationFiles, "utf-8");
        },

        //############################################
        loadRemoteSimulationFromServer: function (pSimulationId) {
            //console.log("Intentando calcular el total de SE");
            $("#jqxBottomControls_ProgressBar").show();
            _SigletonConfig.auxTmpThis = this;
            var self = _SigletonConfig.auxTmpThis;

            self.actualSimulationLoadType = self.SimulationLoadType[1];

            this.SimulationId = pSimulationId;
            var lpathToFiles = this.ServerPath + pSimulationId + "/";

            self.updateProgressBar();

            //.cfg simulation file
            d3.json(lpathToFiles + "_SimulationFiles.json.scf", function (error, jsonCFG) {
                if (error) return alarm("Impossible to load _SimulationFiles.json.scf file");
                self.cfgSimulationFiles = jsonCFG;
                self.numFilesLoaded++;
                self.updateProgressBar();
                self.actFile = 0;

                //LocalInfo
                d3.json(lpathToFiles + self.cfgSimulationFiles["LocalNeuronCommonInfo"], function (error, jsonLNCI) {
                    if (error) return alarm("Impossible to load LocalNeuronCommonInfo file");

                    self.gNeurons = jsonLNCI;
                    self.numFilesLoaded++;
                    self.updateProgressBar();
                    self.loadSimulationEnd();
                });

                //Global info file 0
                d3.json(lpathToFiles + self.cfgSimulationFiles["LocalNeuronInfo"][0], function (error, jsonLNI0) {
                    if (error) return alarm("Impossible to load LocalNeuronInfo file");

                    self.gNeuronsDetails = jsonLNI0;

                    //console.log("Intentando calcular el total de SE");
                    self.calculateAllSynapticElements();
                    self.numFilesLoaded++;
                    self.updateProgressBar();
                    self.loadSimulationEnd();

                    //Global info file 0
                    d3.json(lpathToFiles + self.cfgSimulationFiles["GlobalParams"][0], function (error, jsonGP) {
                        if (error) return alarm("Impossible to load GlobalParams file");

                        _SimulationData.TEConn = jsonGP['TEConn'];
                        _SimulationData.TIConn = jsonGP['TIConn'];
                        _SimulationData.EEConn = jsonGP['EEConn'];
                        _SimulationData.EIConn = jsonGP['EIConn'];
                        _SimulationData.IEConn = jsonGP['IEConn'];
                        _SimulationData.IIConn = jsonGP['IIConn'];

                        //Calculate max and min values
                        self.calculateMaxMinValues();

                        //Calculate the scales
                        self.recalculateScales(_SigletonConfig.minCaColor
                            , _SigletonConfig.maxCaColor
                            , _SigletonConfig.ColorInerpolMethod);

                        //Recalculate positions
                        self.recalculatePositions();
                        self.numFilesLoaded++;
                        self.updateProgressBar();
                        self.loadSimulationEnd();
                    });
                });

                //GlobalInfo
                d3.json(lpathToFiles + self.cfgSimulationFiles["GlobalSimulationParams"], function (error, jsonGSP) {
                    if (error) return alarm("Impossible to load GlobalSimulationParams file");

                    //Load global params
                    self.steps = jsonGSP.simSteps;

                    //###Calculated from file, but no setpoint file
                    self.maxFileECalciumValue = jsonGSP.maxECalciumValue;
                    self.minFileECalciumValue = jsonGSP.minECalciumValue;
                    self.maxFileICalciumValue = jsonGSP.maxICalciumValue;
                    self.minFileICalciumValue = jsonGSP.minICalciumValue;

                    //Global calcium values
                    self.minCalciumValue = jsonGSP.minCalciumValue;
                    self.maxCalciumValue = jsonGSP.maxCalciumValue;

                    self.totalSimulationSteps = jsonGSP.totalSimulationSteps;
                    self.numSimStepsPerFile = jsonGSP.numSimStepsPerFile;
                    self.bufferSimulationSteps = jsonGSP.bufferSimulationSteps;
                    self.numFilesLoaded++;
                    self.updateProgressBar();
                    self.loadSimulationEnd();
                });

                //Conectivity
                d3.json(lpathToFiles + self.cfgSimulationFiles['Connectivity'][0], function (error, jsonC) {
                    if (error) return alarm("Impossible to load Connectivity file");

                    self.gConnectivity = jsonC;
                    self.numFilesLoaded++;
                    self.updateProgressBar();
                    self.loadSimulationEnd();

                });

            });

        },
        updateProgressBar: function () {
            $("#jqxBottomControls_ProgressBar").jqxProgressBar({value: this.numFilesLoaded*(100/this.stdSimulationFileNames.length)});
        },
        loadSimulationEnd: function () {
            if (this.numFilesLoaded === this.stdSimulationFileNames.length) {
                _gVisualizatorUI.generateView(0);
                _gVisualizatorUI.disableUI(false);
                $("#jqxBottomControls_ProgressBar").hide();
                $("#jqxBottomControls_SliderTimeline").jqxSlider('max',_SimulationData.steps.length-1);
                $("#jqxBottomControls_SliderTimeline").jqxSlider('val',0);
                $("#jqxBottomControls_NumericInputStep").jqxNumberInput('max',_SimulationData.steps.length-1);
                $("#numericImputID").jqxNumberInput('max',_SimulationData.gNeurons.length-1);
            }
        },
        loadRemoteSimulationFromServerInmediatly: function (pFileId) {
            _SigletonConfig.auxTmpThis = this;
            var self = _SigletonConfig.auxTmpThis;

            var lpathToFiles = this.ServerPath + this.SimulationId + "/";

            var lProgres = 1;
            $("#jqxBottomControls_ProgressBar").jqxProgressBar({value: lProgres});

            self.actFile = pFileId;

            //LocalInfo
            d3.json(lpathToFiles + self.cfgSimulationFiles["LocalNeuronInfo"][pFileId], function (error, jsonLNI0) {
                if (error) return alarm("Impossible to load LocalNeuronInfo file");

                lProgres += 33;
                $("#jqxBottomControls_ProgressBar").jqxProgressBar({value: lProgres});

                self.gNeuronsDetails = jsonLNI0;

                //Global info file 0
                d3.json(lpathToFiles + self.cfgSimulationFiles["GlobalParams"][pFileId], function (error, jsonGP) {
                    if (error) return alarm("Impossible to load GlobalParams file");

                    lProgres += 33;
                    $("#jqxBottomControls_ProgressBar").jqxProgressBar({value: lProgres});

                    _SimulationData.TEConn = jsonGP['TEConn'];
                    _SimulationData.TIConn = jsonGP['TIConn'];
                    _SimulationData.EEConn = jsonGP['EEConn'];
                    _SimulationData.EIConn = jsonGP['EIConn'];
                    _SimulationData.IEConn = jsonGP['IEConn'];
                    _SimulationData.IIConn = jsonGP['IIConn'];

//				//Calculate max and min values
//				self.calculateMaxMinValues();
//
//				//Calculate the scales
//				self.recalculateScales(_SigletonConfig.minCaColor
//										,_SigletonConfig.maxCaColor
//	 									,_SigletonConfig.ColorInerpolMethod);
//
//				//Recalculate positions
//				self.recalculatePositions();

                    //Conectivity
                    d3.json(lpathToFiles + self.cfgSimulationFiles['Connectivity'][pFileId], function (error, jsonC) {
                        if (error) return alarm("Impossible to load Connectivity file");

                        self.gConnectivity = jsonC;
                        lProgres += 33;
                        $("#jqxBottomControls_ProgressBar").jqxProgressBar({value: lProgres});

                        //Reactivate the UI
                        //_gVisualizatorUI.disableUI(false);
                        _SimulationController.view.updateVisualization();
                    });
                });

            });


        },

        LoadServerSimulationDataFiles: function (pFileId, pForceSwap) {
            _SigletonConfig.auxTmpThis = this;
            var self = _SigletonConfig.auxTmpThis;

            var lProgres = 1;
            $("#jqxBottomControls_ProgressBar").jqxProgressBar({value: lProgres});

            var pathToFiles = this.ServerPath + this.SimulationId + "/";

            var lNextFile = pFileId;

            //Global info file 0
            d3.json(pathToFiles + self.cfgSimulationFiles["LocalNeuronInfo"][lNextFile], function (error, jsonLNI0) {
                if (error) return alarm("Impossible to load LocalNeuronInfo file");

                lProgres += 33;
                $("#jqxBottomControls_ProgressBar").jqxProgressBar({value: lProgres});

                self.neuronsDetailsBuffer = jsonLNI0;

                //Global info file 0
                d3.json(pathToFiles + self.cfgSimulationFiles["GlobalParams"][lNextFile], function (error, jsonGP) {
                    if (error) return alarm("Impossible to load GlobalParams file");

                    lProgres += 33;
                    $("#jqxBottomControls_ProgressBar").jqxProgressBar({value: lProgres});

                    self.SEContainerBuffer = jsonGP;

                    //Conectivity
                    d3.json(pathToFiles + self.cfgSimulationFiles['Connectivity'][lNextFile], function (error, jsonC) {
                        if (error) return alarm("Impossible to load Connectivity file");

                        self.connectivityBuffer = jsonC;

                        lProgres += 33;
                        $("#jqxBottomControls_ProgressBar").jqxProgressBar({value: lProgres});

                        if (pForceSwap) _SimulationData.swapSimulationInfo();
                    });
                });

                //console.log("Justo antes de pintar");
                _SimulationController.view.updateVisualization();
            });
        },

        loadRemoteSimulationFromDCache: function (pathToFiles, simId, pUser, pPass) {
            var self = this;
            _SigletonConfig.auxTmpThis = this;

            self.actualSimulationLoadType = self.SimulationLoadType[2];
            self.WebDavCascadeLoad = true;

            var lPathToFile = pathToFiles + "/" + simId;

            var lProgres = 1;
            $("#jqxBottomControls_ProgressBar").jqxProgressBar({value: lProgres});

            _gVisualizatorUI.disableUI(true);

            //self.requester 	= new YAAWebDavLib(lPathToFile, '2880', 'http', pUser, pPass);
            self.requester = new JAWDL(lPathToFile, '2880', 'http', pUser, pPass);

            //Due to asyncronous requests, we need to perform the request in cascade.
            self.requester.getFile(self.stdSimulationFileNames[0], "json", self.callBackLoadWebDavSimulationConfigFile);
        },


        callBackLoadWebDavSimulationConfigFile: function (data) {
            //var self = this;
            var self = _SigletonConfig.auxTmpThis;

            self.cfgSimulationFiles = data;
            self.actFile = 0;

            //console.log("Object: "+self.cfgSimulationFiles);

            console.log("Object: " + self.stdSimulationFileNames[1]);

            var lProgres = $("#jqxBottomControls_ProgressBar").jqxProgressBar('val') + 10;
            $("#jqxBottomControls_ProgressBar").jqxProgressBar({value: lProgres});

            if (self.WebDavCascadeLoad) self.requester.getFile(self.cfgSimulationFiles[String(self.stdSimulationFileIds[0])], "json", self.callBackLoadWebDavLocalNeuronCommonInfo);
        },

        callBackLoadWebDavLocalNeuronCommonInfo: function (data) {
            var self = _SigletonConfig.auxTmpThis;

            self.gNeurons = data;

            var lProgres = $("#jqxBottomControls_ProgressBar").jqxProgressBar('val') + 33;
            $("#jqxBottomControls_ProgressBar").jqxProgressBar({value: lProgres});

            if (self.WebDavCascadeLoad) self.requester.getFile(self.cfgSimulationFiles[String(self.stdSimulationFileIds[1])][self.actFile], "json", self.callBackLoadWebDavLocalNeuronInformation);
        },

        callBackLoadWebDavLocalNeuronInformation: function (data) {
            var self = _SigletonConfig.auxTmpThis;

            self.gNeuronsDetails = data;

            var lProgres = $("#jqxBottomControls_ProgressBar").jqxProgressBar('val') + 33;
            $("#jqxBottomControls_ProgressBar").jqxProgressBar({value: lProgres});

            if (self.WebDavCascadeLoad) self.requester.getFile(self.cfgSimulationFiles[String(self.stdSimulationFileIds[2])], "json", self.callBackLoadWebDavGlobalSimulationParams);
        },

        callBackLoadWebDavGlobalSimulationParams: function (data) {
            //var self = this;
            var self = _SigletonConfig.auxTmpThis;

            var jsonGlobalNData = data;

            var lProgres = $("#jqxBottomControls_ProgressBar").jqxProgressBar('val') + 33;
            $("#jqxBottomControls_ProgressBar").jqxProgressBar({value: lProgres});

            //Load global params
            self.steps = jsonGlobalNData.simSteps;

            //###Calculated from file, but no setpoint file
            self.maxFileECalciumValue = jsonGlobalNData.maxECalciumValue;
            self.minFileECalciumValue = jsonGlobalNData.minECalciumValue;
            self.maxFileICalciumValue = jsonGlobalNData.maxICalciumValue;
            self.minFileICalciumValue = jsonGlobalNData.minICalciumValue;

            //Global calcium values
            self.minCalciumValue = jsonGlobalNData.minCalciumValue;
            self.maxCalciumValue = jsonGlobalNData.maxCalciumValue;

            self.totalSimulationSteps = jsonGlobalNData.totalSimulationSteps;
            self.numSimStepsPerFile = jsonGlobalNData.numSimStepsPerFile;
            self.bufferSimulationSteps = jsonGlobalNData.bufferSimulationSteps;


            if (self.WebDavCascadeLoad) self.requester.getFile(self.cfgSimulationFiles[String(self.stdSimulationFileIds[3])][self.actFile], "json", self.callBackLoadWebDavGlobalParams);
        },

        callBackLoadWebDavGlobalParams: function (data) {
            //var self = this;
            var self = _SigletonConfig.auxTmpThis;

            var jsonGlobalNData = data;

            var lProgres = $("#jqxBottomControls_ProgressBar").jqxProgressBar('val') + 33;
            $("#jqxBottomControls_ProgressBar").jqxProgressBar({value: lProgres});

            self.TEConn = jsonGlobalNData.TEConn;
            self.TIConn = jsonGlobalNData.TIConn;
            self.EEConn = jsonGlobalNData.EEConn;
            self.EIConn = jsonGlobalNData.EIConn;
            self.IEConn = jsonGlobalNData.IEConn;
            self.IIConn = jsonGlobalNData.IIConn;

            if (self.WebDavCascadeLoad) self.requester.getFile(self.cfgSimulationFiles[String(self.stdSimulationFileIds[4])][self.actFile], "json", self.callBackLoadWebDavConnectivity);
        },

        callBackLoadWebDavConnectivity: function (data) {
            //var self = this;
            var self = _SigletonConfig.auxTmpThis;

            self.gConnectivity = data;
            var lProgres = $("#jqxBottomControls_ProgressBar").jqxProgressBar('val') + 33;
            $("#jqxBottomControls_ProgressBar").jqxProgressBar({value: lProgres});

            //Calculate max and min values
            self.calculateMaxMinValues();

            //Calculate the scales
            self.recalculateScales(_SigletonConfig.minCaColor
                , _SigletonConfig.maxCaColor
                , _SigletonConfig.ColorInerpolMethod);

            //Recalculate positions
            self.recalculatePositions();

            self.WebDavCascadeLoad = false;

            //Reactivate the UI
            _gVisualizatorUI.disableUI(false);

        },

        callBackLoadWebDavConnectivitySimple: function (data) {
            //var self = this;
            var self = _SigletonConfig.auxTmpThis;

            self.gConnectivity = data;
            var lProgres = $("#jqxBottomControls_ProgressBar").jqxProgressBar('val') + 33;
            $("#jqxBottomControls_ProgressBar").jqxProgressBar({value: lProgres});

            //##########
            _SimulationController.view.updateVisualization();
        },


        loadSimulationFromWebDavInmediatly: function (pFileId) {
            _SigletonConfig.auxTmpThis = this;
            var self = _SigletonConfig.auxTmpThis;

            var lProgres = 1;
            $("#jqxBottomControls_ProgressBar").jqxProgressBar({value: lProgres});

            //Autodecide files
            self.actFile = pFileId;
            self.WebDavCascadeLoad = false;

            self.requester.getFile(self.cfgSimulationFiles[String(self.stdSimulationFileIds[1])][pFileId], "json", self.callBackLoadWebDavLocalNeuronInformation);
            self.requester.getFile(self.cfgSimulationFiles[String(self.stdSimulationFileIds[3])][pFileId], "json", self.callBackLoadWebDavGlobalParams);
            self.requester.getFile(self.cfgSimulationFiles[String(self.stdSimulationFileIds[4])][pFileId], "json", self.callBackLoadWebDavConnectivitySimple);

        },

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    callBackLoadWebDavLocalNeuronInformationBuffered: function (data) {
        var self = _SigletonConfig.auxTmpThis;

        self.neuronsDetailsBuffer = data;

        var lProgres = $("#jqxBottomControls_ProgressBar").jqxProgressBar('val') + 34;
        $("#jqxBottomControls_ProgressBar").jqxProgressBar({value: lProgres});
    },

    callBackLoadWebDavGlobalParamsBuffered: function (data) {
        //var self = this;
        var self = _SigletonConfig.auxTmpThis;

        self.SEContainerBuffer = data;
        var lProgres = $("#jqxBottomControls_ProgressBar").jqxProgressBar('val') + 33;
        $("#jqxBottomControls_ProgressBar").jqxProgressBar({value: lProgres});
    },

    callBackLoadWebDavConnectivityBuffered: function (data) {
        //var self = this;
        var self = _SigletonConfig.auxTmpThis;

        self.connectivityBuffer = data;
        var lProgres = $("#jqxBottomControls_ProgressBar").jqxProgressBar('val') + 33;
        $("#jqxBottomControls_ProgressBar").jqxProgressBar({value: lProgres});
    },

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    LoadWebDavSimulationDataFiles: function (pFileId) {
        _SigletonConfig.auxTmpThis = this;
        var self = _SigletonConfig.auxTmpThis;

        var lProgres = 1;
        $("#jqxBottomControls_ProgressBar").jqxProgressBar({value: lProgres});

        //Autodecide files
        self.requester.getFile(self.cfgSimulationFiles[String(self.stdSimulationFileIds[1])][pFileId], "json", self.callBackLoadWebDavLocalNeuronInformationBuffered);
        self.requester.getFile(self.cfgSimulationFiles[String(self.stdSimulationFileIds[3])][pFileId], "json", self.callBackLoadWebDavGlobalParamsBuffered);
        self.requester.getFile(self.cfgSimulationFiles[String(self.stdSimulationFileIds[4])][pFileId], "json", self.callBackLoadWebDavConnectivityBuffered);
    },


    swapSimulationInfo: function () {
        console.log("-->>>Swapping buffer");

        this.gNeuronsDetails = this.neuronsDetailsBuffer;
        this.gConnectivity = this.connectivityBuffer;

        _SimulationData.TEConn = this.SEContainerBuffer['TEConn'];
        _SimulationData.TIConn = this.SEContainerBuffer['TIConn'];
        _SimulationData.EEConn = this.SEContainerBuffer['EEConn'];
        _SimulationData.EIConn = this.SEContainerBuffer['EIConn'];
        _SimulationData.IEConn = this.SEContainerBuffer['IEConn'];
        _SimulationData.IIConn = this.SEContainerBuffer['IIConn'];

        this.SEContainerBuffer['TEConn']
            = this.SEContainerBuffer['TIConn']
            = this.SEContainerBuffer['EEConn']
            = this.SEContainerBuffer['EIConn']
            = this.SEContainerBuffer['IEConn']
            = this.SEContainerBuffer['IIConn'] = [];

        this.actFile = Math.floor(_SimulationController.actSimStep / this.numSimStepsPerFile);
    },

    recalculateScales: function (pColorMin, pColorMax, pColorType) {
        var self = this;

        //TODO: Add another minMax function, SetPoints dont make sense (always the same)
        if (_SigletonConfig.CaMaxMinValueTypes == 0) {
            console.log("Ca. from set points");

            self.minECalciumValue = 0;
            self.minICalciumValue = 0;
            self.maxECalciumValue = 0;
            self.maxICalciumValue = 0;

            for (var i = 0; i < self.gNeurons.length; ++i) {
                if (self.gNeurons[i].NAct == "E") {
                    if (self.maxECalciumValue < self.gNeurons[i].SetPoint)
                        self.maxECalciumValue = self.gNeurons[i].SetPoint;
                }
                else {
                    if (self.maxICalciumValue < self.gNeurons[i].SetPoint)
                        self.maxICalciumValue = self.gNeurons[i].SetPoint;
                }
            }

            //#### Nyapa!!! Se pued ehacer en el bucle anterior, but theri is no time
            for (var i = 0; i < self.gNeurons.length; ++i) {
                if (self.gNeurons[i].NAct == "E") {
                    if (self.maxECalciumValue!=self.gNeurons[i].SetPoint)
                        window.alert("Different setPoint Ca values in setPoint files for E Neuron");
                }
                else {
                    if (self.maxICalciumValue != self.gNeurons[i].SetPoint)
                        window.alert("Different setPoint Ca values in setPoint files for I Neuron");
                }
            }

        }
        else {
//			console.log("Ca. from Neuron values");
            self.maxECalciumValue = self.maxFileECalciumValue;
            self.minECalciumValue = self.minFileECalciumValue;
            self.maxICalciumValue = self.maxFileICalciumValue;
            self.minICalciumValue = self.minFileICalciumValue;
        }

        this.CaIScale = d4.scaleSequential(d4["interpolate" + _SigletonConfig.calciumScheme]).domain([this.minICalciumValue, this.maxICalciumValue]);
        this.CaEScale = d4.scaleSequential(d4["interpolate" + _SigletonConfig.calciumScheme]).domain([this.minECalciumValue, this.maxECalciumValue]);
    }
    , recalculatePositions: function () {
    //Recalculate positions
    var lNewXPos = 0;
    var lNewYPos = 0;
    var self = this;

    for (var i = 0; i < _SimulationData.gNeurons.length; ++i) {
        lNewXPos = _SigletonConfig.xScale(self.gNeurons[i].PosX);
        lNewYPos = _SigletonConfig.yScale(self.gNeurons[i].PosY);

        self.gNeurons[i].PosX = lNewXPos;
        self.gNeurons[i].PosY = lNewYPos;
    }
}
    , updateSchema: function (interpolator) {
    this.CaIScale = d4.scaleSequential(d4["interpolate" + interpolator]).domain([this.minICalciumValue, this.maxICalciumValue]);
    this.CaEScale = d4.scaleSequential(d4["interpolate" + interpolator]).domain([this.minECalciumValue, this.maxECalciumValue]);
}
};

