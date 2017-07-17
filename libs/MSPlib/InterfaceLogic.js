/**
 * @brief
 * @author  Juan Pedro Brito Mendez <juanpebm@gmail.com>
 * @date
 * @remarks Do not distribute without further notice.
 */


//Global vars
_SimulationController = null;
_SimulationData = null;
_SimulationFilter = null;
_ColorPicker = null;
UI.Visualizator = function () {
    this.activeView = null;
    this.simulationFiles = null;
    this.simulationFilesConfig = null;
    this.colorScaleTypes = ['Categorical', 'Diverging', 'Sequential'];
    this.colorScales = [
        [
            {labelInternal: "schemeAccent", label: "schemeAccent", group: "Categorical"},
            {labelInternal: "schemeDark2", label: "Dark2", group: "Categorical"},
            {labelInternal: "schemePaired", label: "Paired", group: "Categorical"},
            {labelInternal: "schemePastel1", label: "Pastel1", group: "Categorical"},
            {labelInternal: "schemePastel2", label: "Pastel2", group: "Categorical"},
            {labelInternal: "schemeSet1", label: "Set1", group: "Categorical"},
            {labelInternal: "schemeSet2", label: "Set2", group: "Categorical"},
            {labelInternal: "schemeSet3", label: "Set3", group: "Categorical"}
        ],

        [
            {labelInternal: "Viridis", label: "Viridis", group: "Diverging"},
            {labelInternal: "Inferno", label: "Inferno", group: "Diverging"},
            {labelInternal: "Magma", label: "Magma", group: "Diverging"},
            {labelInternal: "Plasma", label: "Plasma", group: "Diverging"},
            {labelInternal: "Warm", label: "Warm", group: "Diverging"},
            {labelInternal: "Cool", label: "Cool", group: "Diverging"},
            {labelInternal: "CubehelixDefault", label: "CubehelixDefault", group: "Diverging"},
            {labelInternal: "BrBG", label: "BrBG", group: "Diverging"},
            {labelInternal: "PRGn", label: "PRGn", group: "Diverging"},
            {labelInternal: "PiYG", label: "PiYG", group: "Diverging"},
            {labelInternal: "PuOr", label: "PuOr", group: "Diverging"},
            {labelInternal: "RdBu", label: "RdBu", group: "Diverging"},
            {labelInternal: "RdGy", label: "RdGy", group: "Diverging"},
            {labelInternal: "RdYlBu", label: "RdYlBu", group: "Diverging"},
            {labelInternal: "RdYlGn", label: "RdYlGn", group: "Diverging"},
            {labelInternal: "Spectral", label: "Spectral", group: "Diverging"}
        ],

        [
            {labelInternal: "Greens", label: "Greens", group: "Sequential"},
            {labelInternal: "Greys", label: "Greys", group: "Sequential"},
            {labelInternal: "Oranges", label: "Oranges", group: "Sequential"},
            {labelInternal: "Purples", label: "Purples", group: "Sequential"},
            {labelInternal: "Reds", label: "Reds", group: "Sequential"},
            {labelInternal: "BuGn", label: "BuGn", group: "Sequential"},
            {labelInternal: "BuPu", label: "BuPu", group: "Sequential"},
            {labelInternal: "GnBu", label: "GnBu", group: "Sequential"},
            {labelInternal: "OrRd", label: "OrRd", group: "Sequential"},
            {labelInternal: "PuBuGn", label: "PuBuGn", group: "Sequential"},
            {labelInternal: "PuBu", label: "PuBu", group: "Sequential"},
            {labelInternal: "PuRd", label: "PuRd", group: "Sequential"},
            {labelInternal: "RdPu", label: "RdPu", group: "Sequential"},
            {labelInternal: "YlGnBu", label: "YlGnBu", group: "Sequential"},
            {labelInternal: "YlGn", label: "YlGn", group: "Sequential"},
            {labelInternal: "YlOrBr", label: "YlOrBr", group: "Sequential"},
            {labelInternal: "YlOrRd", label: "YlOrRd", group: "Sequential"}
        ]
    ];

    this.generateUI();

};


UI.Visualizator.prototype = {
    constructor: UI.Visualizator,
    generateUI: function () {
        var self = this;

        //Dont reload the files form the same place in Chrome
        document.getElementById('fileDialog').addEventListener('change',
            function (evt) //selectFiles()
            {
                var files = document.getElementById('fileDialog').files;

                if ((!files.length) || (files.length !== 6)) {
                    self.simulationFiles = null;

                    $("#jqxInputSimulationFilesLocalPath").val(" ");
                    $("#jqxConfWindow_ButtonLoadSimulationFiles").prop("disabled", true);

                    alert('Please select the 6 simulation files!');
                }
                else {
                    _SigletonConfig.localFilesPath = $('#jqxInputSimulationFilesLocalPath').val();
                    self.simulationFiles = {};

                    for (var i = 0; i < 6; ++i)
                        self.simulationFiles[String(files[i].name)] = files[i];

                    if (files.length === 6) lFiles = "Num files correct";
                    else                    lFiles = "Select the 6 minimum simulation files";

                    $("#jqxInputSimulationFilesLocalPath").val(lFiles);
                    $("#jqxConfWindow_ButtonLoadSimulationFiles").prop("disabled", false);
                }
            }
            , false)
        ;

        document.getElementById('fileDialogConfig').addEventListener('change',
            function (evt) //selectFiles()
            {
                var files = document.getElementById('fileDialogConfig').files;

                if ((!files.length) || (files.length !== 1)) {
                    self.simulationFilesConfig = null;

                    $("#jqxInputConfigFilesLocalPath").val(" ");
                    $("#jqxConfWindow_ButtonLoadConfig").prop("disabled", true);

                    alert('Please select one configuration file');
                }
                else {
                    _SigletonConfig.localFilesPath = $('#jqxInputConfigFilesLocalPath').val();
                    self.simulationFilesConfig = files;

                    if (files.length === 1) lFiles = "Num files correct";
                    else                    lFiles = "Select only one configuration file";

                    $("#jqxInputConfigFilesLocalPath").val(lFiles);
                    $("#jqxConfWindow_ButtonLoadConfig").prop("disabled", false);
                }
            }
            , false)
        ;

        $(document).ready(function () {
                var color = getCookie("color");


                $("#jqxConfWindow_ButtonSelectConfig").on('click', function (event) {
                    self.loadLocalConfiguration()
                });


                $("#jqxConfWindow_ButtonLoadConfig").on('click', function (event) {
                    self.loadLocalConfigurationFiles();
                });

                $("#jqxConfWindow_ButtonSaveConfig").on('click', function (event) {
                    saveConfig();
                });


                _ColorPicker = new MSP.ColorPicker();
                _ColorPicker.generateColorPicker();
                // Logic of the interface


                //Navbar view buttons
                $("#navViewGlobal").on('click', function () {
                    if (self.generateView(0)) self.navBarSelectView(0);
                });

                $("#navViewMacro").on('click', function () {
                    if (self.generateView(7)) self.navBarSelectView(1);
                });

                $("#navViewMap").on('click', function () {
                    if (self.generateView(8)) self.navBarSelectView(2);
                });

                $("#navViewMicro").on('click', function () {
                    if (self.generateView(2)) self.navBarSelectView(3);
                });

                $("#navViewMicroDetail").on('click', function () {
                    if (self.generateView(3)) self.navBarSelectView(4);
                });

                $("#navInfoHelp").on('click', function () {
                    self.showInfo();
                });

                $("#navOptionsFile").on('click', function () {
                    self.openNav();
                    self.openTab('fileTab', 0)
                });

                $("#navOptionsColor").on('click', function () {
                    self.openNav();
                    self.openTab('colorTab', 1)
                });

                $("#navOptionsGlobal").on('click', function () {
                    self.openNav();
                    self.openTab('globalConfTab', 2)
                });

                $("#navOptionsConfig").on('click', function () {
                    self.openNav();
                    self.openTab('config', 3)
                });

                $("#navOptionsFilter").on('click', function () {
                    self.openNav();
                    self.openTab('filterTab', 4)
                });

                $("#navOptionsSort").on('click', function () {
                    self.openNav();
                    self.openTab('sortTab', 5)
                });

                $("#navClose").on('click', function () {
                    self.closeNav();
                });

                $("#jqxBottomControls_ButtonSimulate").on('click', function (event) {
                    self.simulate(!_SimulationController.pause);
                });


                $('#jqxBottomControls_SliderTimeline').jqxSlider({
                    tooltip: true,
                    mode: 'fixed',
                    width: '700px',
                    showTicks: false,
                    max: 1000,
                    showButtons: false,
                    disabled: true
                });

                $('#jqxBottomControls_SliderTimeline').on('slideStart', function (event) {
                    _SimulationController.stopVisualization();
                });
                $('#jqxBottomControls_SliderTimeline').on('slideEnd', function (event) {
                    self.updateSimulationFromTimeline();
                });

                $("#jqxBottomControls_NumericInputStep").jqxNumberInput({
                    width: '100px', height: '25px', inputMode: 'simple'
                    , spinButtons: true, decimalDigits: 0, min: 0, disabled: true
                });
                $('#jqxBottomControls_NumericInputStep').on('change', function (event) {
                    self.updateSimulationFromStep();
                });

                $("#numericImputID").jqxNumberInput({
                    width: '100px', height: '25px', inputMode: 'simple'
                    , spinButtons: true, decimalDigits: 0, min: 0
                });
                $('#numericImputID').on('change', function (event) {
                    _SimulationController.view.updateID($("#numericImputID").jqxNumberInput('val'));
                });

                $("#numericBarElements").jqxNumberInput({
                    width: '160px', height: '25px', inputMode: 'simple'
                    , spinButtons: true, decimalDigits: 0, min: 1, max: 20, value: 15
                });
                $('#numericBarElements').on('change', function (event) {
                    _SimulationController.view.graph.numBars = $("#numericBarElements").jqxNumberInput('val');
                    _SimulationController.view.graph.updateGraph();
                });

                $("#numericImputElipse").jqxNumberInput({
                    width: '100px', height: '25px', inputMode: 'simple'
                    , spinButtons: true, decimalDigits: 0, min: 0
                });

                $("#btnAddID").on('click', function (event) {
                    var id = $("#numericImputElipse").jqxNumberInput('val');
                    if (id >= 0 && id < _SimulationData.gNeurons.length)
                        _SimulationData.gNeurons[$("#numericImputElipse").jqxNumberInput('val')].centerElipse = true;
                    $("#listaCentroElipse").append('<button class="btnCentro" onclick="delCenter(' + id + ');">' + id + '</button>');
                    _SimulationController.view.update();
                });

                $("#btnAddSelected").on('click', function (event) {
                    _SimulationFilter.gNeuronsFilter.forEach(function (z) {
                        var d = _SimulationData.gNeurons[z];
                        if (d.selected) {
                            d.centerElipse = true;
                            $("#listaCentroElipse").append('<button class="btnCentro" onclick="delCenter(' + d.NId + ');">' + d.NId + '</button>');
                        }
                    });
                    _SimulationController.view.update();
                });


                $("#btnRmSelected").on('click', function (event) {
                    $("#listaCentroElipse").empty();
                    _SimulationData.gNeurons.forEach(function (d) {
                        d.centerElipse = false;
                    });
                    _SimulationController.view.update();
                });


                $("#rmSelected").on('click', function (event) {
                    _SimulationFilter.gNeuronsFilter.forEach(function (z) {
                        var d = _SimulationData.gNeurons[z];
                        if (d.selected && d.centerElipse) {
                            d.centerElipse = false;
                            delCenter(z);
                        }
                    });
                    _SimulationController.view.update();
                });


                $("#jqxBottomControls_ProgressBar").jqxProgressBar({width: 375, height: 50, value: 0, showText: true});
                $("#jqxBottomControls_ProgressBar").hide();


                $("#jqxConfWindow_ButtonSelectSimulationFiles").on('click', function (event) {
                    self.loadLocalSimulation();
                });

                $("#jqxConfWindow_ButtonLoadSimulationFiles").on('click', function (event) {
                    self.loadLocalFiles();
                });

//			             $("#jqxInputLocalFile").jqxInput({placeHolder: "Local neuron information file", height: 25, width: 250, minLength: 1, disabled: true});
//			             $("#jqxInputGlobalFile").jqxInput({placeHolder: "Global scene information file", height: 25, width: 250, minLength: 1, disabled: true});
//			             $("#jqxInputConnectivityFile").jqxInput({placeHolder: "Conectivity file", height: 25, width: 250, minLength: 1, disabled: true});
//			             $("#jqxInputSimulationConfigFile").jqxInput({placeHolder: "Local simulation config file", height: 25, width: 250, minLength: 1, disabled: true});


                $("#jqxWindow__ButtonLoadRemoteSimulationFromServer").on('click', function (event) {

                    var lSimName = $("#jqxWindow_RemoteSimulationId").val();
                    var lSimNameLength = lSimName.length;
                    if (lSimNameLength > 0) {
                        self.loadRemoteSimulationFromServer(lSimName);
                        self.navBarSelectView(0);
                    }
                    else
                        window.alert("Please, select a valid simulation id.");
                });

                //Boton de conectar (De momento además se traerá los datos)
                $("#jqxWindow_ButtonLoadRemoteSimulationFromDCache").on('click', function (event) {

                    var serversPath = ["Nop"
                        , "www.mitestensimca1000.es:2880/data/world-writable/Simulations"
                        , "Nop"
                        , "Nop"];

                    var lItem = $("#jqxWindow_LoadRemoteSimulation_ComboRemoteServers").selectedIndex;
                    var lUserLenght = $("#jqxWindow_LoadRemoteSimulation_inputUser").val().length;
                    var lPassLenght = $("#jqxWindow_LoadRemoteSimulation_inputPass").val().length;
                    //console.log("--->>>>"+lItem +" "+lUserLenght+" "+lPassLenght);
                    if (
                        (lItem > 0)
                        && (lUserLenght > 0)
                        && (lPassLenght > 0)) {
                        console.log("Cargando simulacion remota");
                        self.loadRemoteSimulationFromDCache(serversPath[$("#jqxWindow_LoadRemoteSimulation_ComboRemoteServers").selectedIndex]
                            , $("#jqxWindow_LoadRemoteSimulation_id").val()
                            , $("#jqxWindow_LoadRemoteSimulation_inputUser").val()
                            , $("#jqxWindow_LoadRemoteSimulation_inputPass").val()
                        );
                    }


                });

                /////////////////////////////////////////////////////////////////////////////////
                /* Auto Resize */
                self.resize();
                $(window).resize(function () {
                    self.resize();
                });
                /* Auto Resize */

                $("#chkOutgoingConn").jqxCheckBox({width: 80, height: 25, checked: true});
                $("#chkOutgoingConn").bind('change', function (event) {
                    _SigletonConfig.outgoingConn = event.args.checked;
                    _SimulationController.view.updateVisualization();
                });

                $("#chkIncomingConn").jqxCheckBox({width: 80, height: 25, checked: true});
                $("#chkIncomingConn").bind('change', function (event) {
                    _SigletonConfig.incomingConn = event.args.checked;
                    _SimulationController.view.updateVisualization();
                });

                /* Filter */
                $("#chkNeuronType1").jqxCheckBox({width: 80, height: 25, checked: true});
                $("#chkNeuronType2").jqxCheckBox({width: 80, height: 25, checked: true});

                var sourceFilter = [{label: "Calcium Concentration", cat: "decimal", type: "Ca", color: "#de9425"},
                    {label: "Excitatory Connections", cat: "real", type: "IConn", color: _SigletonConfig.IColor},
                    {label: "Inhibitory Connections", cat: "real", type: "EConn", color: _SigletonConfig.EColor},
                    {label: "Axonal Connections", cat: "real", type: "AConn", color: _SigletonConfig.AColor}];

                sourceFilter.forEach(function (elem, i) {
                    $("#comboBoxTypeFilter").append($('<option>', {
                        value: i,
                        text: elem.label
                    }));
                });

                $("#comboBoxTypeFilter").on('change', function () {
                    var idx = $("#comboBoxTypeFilter").prop('selectedIndex');
                    if (sourceFilter[idx].cat === "decimal") {
                        $("#caMinRangeFilter").jqxNumberInput('decimalDigits', 10);
                        $("#caMaxRangeFilter").jqxNumberInput('decimalDigits', 10);
                    } else {
                        $("#caMinRangeFilter").jqxNumberInput('decimalDigits', 0);
                        $("#caMaxRangeFilter").jqxNumberInput('decimalDigits', 0);
                    }
                    $("#caMinRangeFilter").jqxNumberInput('val', 0);
                    $("#caMaxRangeFilter").jqxNumberInput('val', 0);
                });

                $("#caMinRangeFilter").jqxNumberInput({
                    width: '130px',
                    height: '25px',
                    inputMode: 'simple',
                    spinButtons: true,
                    decimalDigits: 10,
                    min: 0
                });

                $("#caMaxRangeFilter").jqxNumberInput({
                    width: '130px',
                    height: '25px',
                    inputMode: 'simple',
                    spinButtons: true,
                    decimalDigits: 10,
                    min: 0
                });

                $("#btnApplyFilter").on('click', function () {
                    var idx = $("#comboBoxTypeFilter").prop('selectedIndex');
                    var tipo = sourceFilter[idx].type;
                    var color = sourceFilter[idx].color;
                    var tipoCompleto = sourceFilter[idx].label;
                    var filtro = {
                        type: tipo, min: $("#caMinRangeFilter").val(), max: $("#caMaxRangeFilter").val(),
                        excitatory: $("#chkNeuronType1").val(), inhibitory: $("#chkNeuronType2").val()
                    };
                    idx = _SimulationFilter.filters.length;
                    _SimulationFilter.filters.push(filtro);

                    $("#listaFiltros").append('<div class="filtro"><div class="filterTitle" style="background-color:' + color + '"><span class="filterTitleText">' + tipoCompleto + '</span><button class="btnFiltro">X</button> </div>' +
                        '<div><span class="filterTitleSecondary">Applies to:</span><div class="filterContent">' + (filtro.excitatory ? '<div class="filterE"></div>' : "") + (filtro.inhibitory ? '<div class="filterI"></div>' : "") + '</div></div>' +
                        '<div><span class="filterTitleSecondary">Min:</span><span >' + (filtro.min) + '</span></div>' +
                        '<div><span class="filterTitleSecondary">Max:</span><span>' + (filtro.max) + '</span></div></div>');
                    $(".btnFiltro").last().on('click', function () {
                        self.deleteFilter($(this.parentNode).parent());
                    })
                });

                /* Filter */

                /* Sort */
                $("#jqxCheckBoxMixNeurons").jqxCheckBox({width: 140, height: 25, checked: true}).css("margin-top", "10px");
                $("#jqxCheckBoxMixNeurons").on('change', function (event) {
                    _SimulationFilter.orderMix = event.args.checked;
                    self.updateSimulationFromTimeline();

                });

                $("#jqxCheckBoxInverseSort").jqxCheckBox({width: 140, height: 25, checked: false})
                $("#jqxCheckBoxInverseSort").on('change', function (event) {
                    _SimulationFilter.inverseOrder = event.args.checked;
                    self.updateSimulationFromTimeline();
                });

                $("#jqxRadioNoSort").jqxRadioButton({width: 140, height: 25, groupName: "sort", checked: true});
                $("#jqxRadioNoSort").on('change', function () {
                    _SimulationFilter.order = "none";
                    self.updateSimulationFromTimeline();

                });

                $("#jqxRadioSortByCa").jqxRadioButton({width: 140, height: 25, groupName: "sort"});
                $("#jqxRadioSortByCa").on('change', function () {
                    _SimulationFilter.order = "calcium";
                    self.updateSimulationFromTimeline();

                });

                $("#jqxRadioSortEConn").jqxRadioButton({width: 140, height: 25, groupName: "sort"});
                $("#jqxRadioSortEConn").on('change', function () {
                    _SimulationFilter.order = "econn";
                    self.updateSimulationFromTimeline();

                });

                $("#jqxRadioSortIConn").jqxRadioButton({width: 140, height: 25, groupName: "sort"});
                $("#jqxRadioSortIConn").on('change', function () {
                    _SimulationFilter.order = "iconn";
                    self.updateSimulationFromTimeline();

                });

                $("#jqxRadioSortAConn").jqxRadioButton({width: 140, height: 25, groupName: "sort"});
                $("#jqxRadioSortAConn").on('change', function () {
                    _SimulationFilter.order = "aconn";
                    self.updateSimulationFromTimeline();

                });
                /* Sort */

                self.createColorCombos("#comboScaleTypeNeuron", "#comboScaleNeuron");

                $("#comboScaleNeuron").on('change', function () {
                    var colorDOMObject = [$("#dropDownExcitatoryButton"), $("#dropDownInhibitoryButton"), $("#dropDownAxonalButton")];
                    var colorConfig = [_SigletonConfig.EColor, _SigletonConfig.IColor, _SigletonConfig.AColor];
                    var idxSaleType = $("#comboScaleTypeNeuron").prop('selectedIndex');
                    var idxColorSale = $("#comboScaleNeuron").prop('selectedIndex');
                    var colorScale = self.colorScales[idxSaleType][idxColorSale].labelInternal;
                    var colorScaleType = $("#comboScaleTypeNeuron option:selected").text();
                    var isCategorical = colorScaleType === "Categorical";

                    colorConfig = _ColorPicker.generateColors(colorScale, colorDOMObject, colorConfig, isCategorical);
                    _SigletonConfig.EColor = colorConfig[0];
                    _SigletonConfig.IColor = colorConfig[1];
                    _SigletonConfig.AColor = colorConfig[2];
                    _SigletonConfig.neuronsScheme = colorScale;
                    updateCookieColor();
                    if (_SimulationController !== null)
                        _SimulationController.view.updateVisualization()
                });


                $('#comboScaleTypeNeuron').on('change', function () {
                    $("#comboScaleNeuron").empty();
                    self.colorScales[$("#comboScaleTypeNeuron").prop('selectedIndex')].forEach(function (elem, i) {
                        $('#comboScaleNeuron').append($('<option>', {
                            value: i,
                            text: elem.label
                        }));
                    });
                    $('#comboScaleNeuron').trigger("change");
                });


                self.createColorCombos("#comboScaleTypeConnection", "#comboScaleConnection");

                $("#comboScaleConnection").on('change', function () {
                    var colorDOMObject = [$("#dropDownEEButton"), $("#dropDownEIButton"), $("#dropDownIEButton"), $("#dropDownIIButton")];
                    var colorConfig = [_SigletonConfig.EEColor, _SigletonConfig.EIColor, _SigletonConfig.IEColor, _SigletonConfig.IIColor];
                    var idxSaleType = $("#comboScaleTypeConnection").prop('selectedIndex');
                    var idxColorSale = $("#comboScaleConnection").prop('selectedIndex');
                    var colorScale = self.colorScales[idxSaleType][idxColorSale].labelInternal;
                    var colorScaleType = $("#comboScaleTypeConnection option:selected").text();
                    var isCategorical = colorScaleType === "Categorical";

                    colorConfig = _ColorPicker.generateColors(colorScale, colorDOMObject, colorConfig, isCategorical);
                    _SigletonConfig.EEColor = colorConfig[0];
                    _SigletonConfig.EIColor = colorConfig[1];
                    _SigletonConfig.IEColor = colorConfig[2];
                    _SigletonConfig.IIColor = colorConfig[3];
                    _SigletonConfig.connectionsScheme = colorScale;

                    updateCookieColor();
                    if (_SimulationController !== null)
                        _SimulationController.view.updateVisualization();
                });


                $('#comboScaleTypeConnection').on('change', function () {
                    $("#comboScaleConnection").empty();
                    self.colorScales[$("#comboScaleTypeConnection").prop('selectedIndex')].forEach(function (elem, i) {
                        $('#comboScaleConnection').append($('<option>', {
                            value: i,
                            text: elem.label
                        }));
                    });
                    $('#comboScaleConnection').trigger("change");
                });

                self.generateScaleCalcium();


                self.createColorCombos("#comboScaleTypeCalcium", "#comboScaleCalcium");

                $("#comboScaleCalcium").on('change', function () {
                    var colorDOMObject = [$("#dropDownCaMaxValueColorButton"), $("#dropDownCaMinValueColorButton")];
                    var colorConfig = [_SigletonConfig.EColor, _SigletonConfig.IColor];
                    var idxSaleType = $("#comboScaleTypeCalcium").prop('selectedIndex');
                    var idxColorSale = $("#comboScaleCalcium").prop('selectedIndex');
                    var colorScale = self.colorScales[idxSaleType][idxColorSale].labelInternal;
                    var colorScaleType = $("#comboScaleTypeCalcium option:selected").text();
                    var isCategorical = colorScaleType === "Categorical";

                    colorConfig = _ColorPicker.generateColors(colorScale, colorDOMObject, colorConfig, isCategorical);
                    _SigletonConfig.maxCaColor = colorConfig[0];
                    _SigletonConfig.minCaColor = colorConfig[1];
                    _SigletonConfig.calciumScheme = colorScale;
                    updateCookieColor();
                    self.generateScaleCalcium();
                    if (_SimulationController !== null) {
                        if (_SimulationController.activeViewID !== 0 && _SimulationController.activeViewID !== 5)
                            self.createSampleBandColor();
                        _SimulationData.recalculateScales();
                        _SimulationController.view.updateVisualization();
                    }
                });


                $('#comboScaleTypeCalcium').on('change', function () {
                    $("#comboScaleCalcium").empty();
                    self.colorScales[$("#comboScaleTypeCalcium").prop('selectedIndex')].forEach(function (elem, i) {
                        $('#comboScaleCalcium').append($('<option>', {
                            value: i,
                            text: elem.label
                        }));
                    });
                    $('#comboScaleCalcium').trigger("change");
                });


                $("#dropDownInhibitoryButton").on('click', self.selectColor);
                $("#dropDownExcitatoryButton").on('click', self.selectColor);
                $("#dropDownAxonalButton").on('click', self.selectColor);
                $("#dropDownEEButton").on('click', self.selectColor);
                $("#dropDownEIButton").on('click', self.selectColor);
                $("#dropDownIEButton").on('click', self.selectColor);
                $("#dropDownIIButton").on('click', self.selectColor);
                $("#dropDownCaMinValueColorButton").on('click', self.selectColor);
                $("#dropDownCaMaxValueColorButton").on('click', self.selectColor);


                $("#dropDownInhibitoryButton").children("div").css("background", _SigletonConfig.IColor);
                $("#dropDownInhibitoryButton").children("span").text(_SigletonConfig.IColor);

                $("#dropDownExcitatoryButton").children("div").css("background", _SigletonConfig.EColor);
                $("#dropDownExcitatoryButton").children("span").text(_SigletonConfig.EColor);

                $("#dropDownAxonalButton").children("div").css("background", _SigletonConfig.AColor);
                $("#dropDownAxonalButton").children("span").text(_SigletonConfig.AColor);

                $("#dropDownEEButton").children("div").css("background", _SigletonConfig.EEColor);
                $("#dropDownEEButton").children("span").text(_SigletonConfig.EEColor);
                //EI color picker
                $("#dropDownEIButton").children("div").css("background", _SigletonConfig.EIColor);
                $("#dropDownEIButton").children("span").text(_SigletonConfig.EIColor);
                //IE color picker
                $("#dropDownIEButton").children("div").css("background", _SigletonConfig.IEColor);
                $("#dropDownIEButton").children("span").text(_SigletonConfig.IEColor);
                //II color picker
                $("#dropDownIIButton").children("div").css("background", _SigletonConfig.IIColor);
                $("#dropDownIIButton").children("span").text(_SigletonConfig.IIColor);
                //Ca min value color picker
                $("#dropDownCaMinValueColorButton").children("div").css("background", _SigletonConfig.minCaColor);
                $("#dropDownCaMinValueColorButton").children("span").text(_SigletonConfig.minCaColor);
                //Ca max value color picker
                $("#dropDownCaMaxValueColorButton").children("div").css("background", _SigletonConfig.maxCaColor);
                $("#dropDownCaMaxValueColorButton").children("span").text(_SigletonConfig.maxCaColor);


                $("#jqxMacroVControls_SliderApha").jqxNumberInput({
                    width: '100px', height: '25px', inputMode: 'simple'
                    , spinButtons: true, decimalDigits: 2, min: 0, max: 1
                });
                $('#jqxMacroVControls_SliderApha').val(_SigletonConfig.macroVAlpha);
                $('#jqxMacroVControls_SliderApha').on('change', function (event) {
                    _SigletonConfig.macroVAlpha = $('#jqxMacroVControls_SliderApha').val();
                });


                $("#jqxRadioButtonCaSetPointFromFile").jqxRadioButton({
                    groupName: '1',
                    width: 190,
                    height: 25,
                    checked: true
                });
                $("#jqxRadioButtonCaSetPointFromNeuronValues").jqxRadioButton({groupName: '1', width: 190, height: 25});


                $("#jqxRadioButtonCaSetPointFromFile").on('change', function (event) {
                    var checked = event.args.checked;
                    if (checked) {
                        _SigletonConfig.CaMaxMinValueTypes = 0;
                    }
                });

                $("#jqxRadioButtonCaSetPointFromNeuronValues").on('change', function (event) {
                    var checked = event.args.checked;
                    if (checked) {
                        _SigletonConfig.CaMaxMinValueTypes = 1;
                    }
                });


                $("#jqxRadioButtonCaSetPointFromFile").jqxRadioButton('check');


                var lSEViewrSelector = [
                    "All",
                    "Vacants only",
                    "Connected only"
                ];

                lSEViewrSelector.forEach(function (elem, i) {
                    $('#dropDownSynapticElementsToViewButton').append($('<option>', {
                        value: i,
                        text: elem
                    }));
                });

                $("#dropDownSynapticElementsToViewButton").on("change", function (event) {
                    _SigletonConfig.SEViewSelector = event.args.index;
                });

                $("#jqxNumericInput_SimulationVelocity").jqxNumberInput({
                    width: '100px', height: '25px', inputMode: 'simple'
                    , spinButtons: true, decimalDigits: 0, min: 0
                });
                $('#jqxNumericInput_SimulationVelocity').val(200);
                $('#jqxNumericInput_SimulationVelocity').on('change', function (event) {
                    _SimulationController.setVisualizationInterval($('#jqxNumericInput_SimulationVelocity').val());
                });

                //-->>MacroView controls
                $("#jqxCheckBox_EEConnect").jqxCheckBox({width: 140, height: 25, checked: true}).css("margin-top", "10px");
                $("#jqxCheckBox_EEConnect").on('change', function (event) {
                    _SimulationData.drawEEConn = event.args.checked;
                });

                $("#jqxCheckBox_EIConnect").jqxCheckBox({width: 140, height: 25, checked: true});
                $("#jqxCheckBox_EIConnect").on('change', function (event) {
                    _SimulationData.drawEIConn = event.args.checked;
                });

                $("#jqxCheckBox_IEConnect").jqxCheckBox({width: 140, height: 25, checked: true});
                $("#jqxCheckBox_IEConnect").on('change', function (event) {
                    _SimulationData.drawIEConn = event.args.checked;
                });

                $("#jqxCheckBox_IIConnect").jqxCheckBox({width: 140, height: 25, checked: true});
                $("#jqxCheckBox_IIConnect").on('change', function (event) {
                    _SimulationData.drawIIConn = event.args.checked;
                });


                /*                $("#jqxConfWindow_ButtonUpdateView").jqxButton({ width: '150'});
                 $("#jqxConfWindow_ButtonUpdateView").on('click', function (event) {

                 _SimulationData.recalculateScales(_SigletonConfig.minCaColor
                 ,_SigletonConfig.maxCaColor
                 ,_SigletonConfig.ColorInerpolMethod);
                 //Recalc scales for the cheeses, only in MicroView
                 if (_SimulationController.view.MSPViewType=="MicroV")
                 _SimulationController.view.reclculateSEScales();

                 self.updateSimulationFromTimeline();
                 });*/


                $('#jqxWindow_ImgExporter').jqxWindow({
                    showCollapseButton: true,
                    maxHeight: 1280,
                    maxWidth: 1024,
                    minHeight: 200,
                    minWidth: 200,
                    height: 480,
                    width: 700
                    ,
                    'resizable': true,
                    'draggable': true,
                    autoOpen: false,
                    initContent: function () {
                    }
                });

                $('#jqxWindow_Info').jqxWindow({
                    showCollapseButton: true,
                    maxHeight: 1280,
                    maxWidth: 1024,
                    minHeight: 200,
                    minWidth: 200,
                    height: 480,
                    width: 700
                    ,
                    'resizable': true,
                    'draggable': true,
                    autoOpen: false,
                    initContent: function () {


                    }
                });

                //Generate the initial canvas
                self.generateCanvas("MSPViz");
            }
        );
        //Borrar solo para testeo.
        loadCookieColor();
    },
    selectColor: function () {
        caller = $(this);
        $("#popup").css({"visibility": "visible"});
    }
    ,
    generateScaleCalcium: function () {

        d4.select("#calciumColorScale").selectAll("svg").remove();
        var colorRange = d4["interpolate" + _SigletonConfig.calciumScheme];
        var svgContainer = d4.select("#calciumColorScale").append("svg")
            .attr("x", 0).attr("y", 0)
            .attr("width", 150)
            .attr("height", 25)
            .attr("class", "color");

        var lg = svgContainer.append("defs").append("linearGradient")
            .attr("id", "gradient")
            .attr("x1", "0%")
            .attr("x2", "100%")
            .attr("y1", "0%")
            .attr("y2", "0%");

        for (var i = 0; i <= 20; i++) {
            lg.append("stop")
                .attr("offset", (i * 5) + "%")
                .style("stop-color", colorRange(i / 20))
                .style("stop-opacity", 1);
        }

        var rectangle = svgContainer.append("rect")
            .attr("id", "colorGradient")
            .attr("height", 25)
            .attr("y", 0)
            .attr("cursor", "pointer")
            .attr("width", 150)
            .attr("fill", "url(#gradient)");
    },
    openNav: function () {
        var spacing = Math.max($(window).width() * 0.025, 48);
        $("#sideNav").css("left", spacing);
    },
    closeNav: function () {
        document.getElementById("sideNav").style.left = "-14%";
        document.getElementById("closeTabs").src = "./content/images/menu.png";
        var x = document.getElementsByClassName("tabs");
        for (i = 0; i < x.length; i++)
            x[i].style.display = "none";


        var y = document.getElementsByClassName("navOptionsButton");
        for (i = 0; i < y.length; i++) {
            $(".navOptionsButton").eq(i).removeClass("active");
            $(".navOptionsButton img").eq(i).attr("src", $(".navOptionsButton img").eq(i).attr("src").replace("B.png", ".png"));
        }
    },
    openTab: function (tabName, z) {
        var tabNames = ["File", "Color preferences", "Global Configuration", "View Configuration", "Filter data", "Sort Data"];
        if ($(".navOptionsButton").eq(z).attr('class') === "navOptionsButton active") {
            this.closeNav();
            return false;
        }

        $("#optionsTitle").text(tabNames[z]);
        var i;
        var x = document.getElementsByClassName("tabs");
        for (i = 0; i < x.length; i++)
            x[i].style.display = "none";


        var y = document.getElementsByClassName("navOptionsButton");
        for (i = 0; i < y.length; i++) {
            $(".navOptionsButton").eq(i).removeClass("active");
            $(".navOptionsButton img").eq(i).attr("src", $(".navOptionsButton img").eq(i).attr("src").replace("B.png", ".png"));
        }

        $(".navOptionsButton").eq(z).addClass("active");
        $(".navOptionsButton img").eq(z).attr("src", $(".navOptionsButton img").eq(z).attr("src").replace(".png", "") + "B.png");
        if (tabName === 'config') {
            var id = _SimulationController.activeViewID;
            if (id === 1 || id === 4 || id === 5 || id === 6 || id === 7) {
                document.getElementById('macroViewTab').style.display = "flex";

                if (id === 4)
                    document.getElementById('macroViewElipseTab').style.display = "flex";

            }
            else if (id === 2) {
                document.getElementById('microViewTab').style.display = "flex";
            }
            else if (id === 3) {
                document.getElementById('detailedMicroViewTab').style.display = "flex";
            }
            else if (id === 0) {
                document.getElementById('gloablViewTab').style.display = "flex";
            }
            else {

            }
        } else {
            document.getElementById(tabName).style.display = "flex";
        }
        document.getElementById("closeTabs").src = "./content/images/close.png"
    },
    navBarSelectView: function (z) {
        var i;
        var y = document.getElementsByClassName("navViewButton");
        for (i = 0; i < y.length; i++) {
            $(".navViewButton").eq(i).removeClass("active");
            //$(".navViewButton img").eq(i).attr("src",$(".navViewButton img").eq(i).attr("src").replace("B.png", ".png"));
        }

        $(".navViewButton").eq(z).addClass("active");
        //$(".navViewButton img").eq(z).attr("src",$(".navViewButton img").eq(z).attr("src").match(/[^\.]+/) + "B.png");
    },
    getTextElementByColor: function (color) {
        if (color == 'transparent' || color.hex == "") {
            return $("<div style='text-shadow: none; position: relative; padding-bottom: 2px; margin-top: 2px;'>transparent</div>");
        }
        var element = $("<div style='text-shadow: none; position: relative; padding-bottom: 2px; margin-top: 2px;'>#" + color.hex + "</div>");
        element.css('background', "#" + color.hex);
        element.addClass('jqx-rc-all');
        return element;
    },
    generateCanvas: function (pMssg) {
        d3.selectAll("svg").filter(function () {
            return !this.classList.contains('color')
        }).remove();

        _SigletonConfig.svg = d3.select("#renderArea")
            .append("svg")
            .attr("width", _SigletonConfig.width)
            .attr("height", _SigletonConfig.height)
        ;

        var lScale = 5;
        var lText = "MSPViz";

        if (pMssg != undefined) lText = pMssg;

        _SigletonConfig.svg.append("text")         			// append text
            .style("fill", "black")   			// fill the text with the colour black
            .attr("x", _SigletonConfig.width / 2) // set x position of left side of text
            .attr("y", _SigletonConfig.height / 2)// set y position of bottom of text
            .attr("dy", ".35em")           		// set offset y position
            .attr("text-anchor", "middle") 		// set anchor y justification
            .style("font-size", "68px")
            .text(lText);          				// define the text to display
    },
    generateView: function (pViewId) {
        if (_SimulationController != null) {


            $("#idSelector").css('display', 'none');
            _SimulationController.activeViewID = pViewId;
            switch (pViewId) {
                case 0:
                    $("#colorSampleBand").empty();
                    if (this.activeView != null) delete this.activeView;
                    this.activeView = null;
                    this.activeView = new MSP.GlobalConnectionsView();
                    this.activeView.generateGlobalConnectionsView();

                    break;
                case 1:
                    if (this.activeView != null) delete this.activeView;
                    this.activeView = null;
                    this.activeView = new MSP.MacroscopicViewGrid();
                    this.activeView.generateMacroscopicViewGrid();
                    break;
                case 4:
                    if (this.activeView != null) delete this.activeView;
                    this.activeView = null;
                    this.activeView = new MSP.MacroscopicViewElipse();
                    this.activeView.generateMacroscopicViewElipse();
                    break;
                case 5:
                    if (this.activeView != null) delete this.activeView;
                    this.activeView = null;
                    this.activeView = new MSP.GlobalConnectionsViewGraph();
                    this.activeView.generateGlobalConnectionsViewGraph();
                    break;

                case 6:
                    if (this.activeView != null) delete this.activeView;
                    this.activeView = null;
                    this.activeView = new MSP.MacroscopicViewForce();
                    this.activeView.generateMacroscopicViewForce();
                    break;
                case 7:
                    if (this.activeView != null) delete this.activeView;
                    this.activeView = null;
                    this.activeView = new MSP.MacroscopicViewCanvas();
                    this.activeView.generateMacroscopicViewCanvas();
                    break;
                case 8:
                    if (this.activeView != null) delete this.activeView;
                    this.activeView = null;
                    this.activeView = new MSP.MacroscopicViewGrid();
                    this.activeView.generateMacroscopicViewGrid();
                    break;
                case 2:
                    //Constraint
                    if (_SigletonConfig.gSelectionIds.length > 0) {
                        if (this.activeView != null) delete this.activeView;
                        this.activeView = null;
                        this.activeView = new MSP.MicroscopicView();
                        this.activeView.generateMicroscopicView();
                    }
                    else {
                        window.alert("Please, select some neurons in Macroscopic View");
                        return false
                    }
                    break;
                case 3:
                    if (_SigletonConfig.neuronSelected != -1) {
                        if (this.activeView != null) delete this.activeView;
                        this.activeView = null;
                        this.activeView = new MSP.DetailMicroscopicView();
                        this.activeView.generateDetailMicroscopicView();
                        $("#idSelector").css('display', 'inline');
                    }
                    else {
                        var neuronID = prompt("Please, enter a neuron ID", "1");

                        if (neuronID == null || neuronID == "") {
                            return false
                        } else {
                            _SigletonConfig.neuronSelected = neuronID;
                            if (this.activeView != null) delete this.activeView;
                            this.activeView = null;
                            this.activeView = new MSP.DetailMicroscopicView();
                            this.activeView.generateDetailMicroscopicView();
                            $("#idSelector").css('display', 'inline');
                        }

                    }

                    break;
                default:
                    break;
            }

            _SimulationController.setView(this.activeView);

            console.log("********Generando vista y concreteSimulationStep");
            _SimulationController.concreteSimulationStep(_SimulationController.actSimStep);

            this.resize();
            $("#jqxBottomControls").css("visibility", "visible");
            return true;

        }
        else {
            window.alert("Please, load simulation files first.");
            return false;
        }
    },
    resize: function () {
        var self = this;
        $('#jqxBottomControls_SliderTimeline').jqxSlider('width', 0);
        _SigletonConfig.height = $(window).height() - $("#jqxBottomControls").height() - $("#colorSampleBand").height();
        _SigletonConfig.width = $(window).width() - $("#icon-bar").width();
        if (_SimulationController !== null) {
            _SimulationController.view.resize();
            _SimulationController.view.updateVisualization();
            if (_SimulationController.activeViewID !== 0 && _SimulationController.activeViewID !== 5)
                self.createSampleBandColor();
        }
        else {
            this.generateCanvas("MSPViz");
        }
        var width = ($('#control1').width() + $('#control2').width() + $('#control4').width() + $('#control5').width()) * 1.1;
        $('#jqxBottomControls_SliderTimeline').jqxSlider('width', $('#controles').width() - width);
        _ColorPicker.resize();
    }, createColorCombos: function (idComboType, idComboScheme) {

        this.colorScaleTypes.forEach(function (elem, i) {
            $(idComboType).append($('<option>', {
                value: i,
                text: elem
            }));
        });

        this.colorScales[0].forEach(function (elem, i) {
            $(idComboScheme).append($('<option>', {
                value: i,
                text: elem.label
            }));
        });

    }
    ,
    showPreferences: function () {

    },
    showInfo: function () {
        $('#jqxWindow_Info').jqxWindow('open');
    },
    showLoadSimulation: function () {

    },
    showLoadRemoteSimulationFromServer: function () {

    },
    showLoadRemoteSimulationFromDCache: function () {

    },
    updateSimulationFromTimeline: function () {
        var lValue = $('#jqxBottomControls_SliderTimeline').jqxSlider('val');
        $('#jqxBottomControls_NumericInputStep').val(lValue);

        _SimulationController.actSimStep = lValue;
        _SimulationController.concreteSimulationStep(_SimulationController.actSimStep);
    },
    updateSimulationFromStep: function () {
        var lValue = $('#jqxBottomControls_NumericInputStep').jqxNumberInput('val');
        $('#jqxBottomControls_SliderTimeline').val(lValue);

        _SimulationController.actSimStep = lValue;
        _SimulationController.concreteSimulationStep(_SimulationController.actSimStep);
    },
    changeTheme: function () {
        _SigletonConfig.theme = "custom";


    },
    loadLocalSimulation: function () {
        $("#fileDialog").click();
        //this.loadLocalFiles();
    },
    loadLocalConfiguration: function () {
        $("#fileDialogConfig").click();
        //this.loadLocalFiles();
    },
    loadLocalFiles: function () {
        var self = this;

        if (Object.keys(self.simulationFiles).length == 6) {
            this.generateCanvas("Loading simulation ...");

            if (_SimulationData != null) delete _SimulationData;
            _SimulationData = new MSP.SimulationData();
            _SimulationFilter = new MSP.SimulationFilter();

            _SimulationData.LoadLocalSimulation(self.simulationFiles);

            if (_SimulationController != null) delete _SimulationController;
            _SimulationController = new MSP.SimulationController();

            _SigletonConfig.recalculatePosScales();
        }
        else {
            alert("Please, select the 6 minimal simulation files");
        }
    },
    loadLocalConfigurationFiles: function () {
        var self = this;
        var config = null;
        if (Object.keys(self.simulationFilesConfig).length == 1) {
            this.generateCanvas("Loading configuration ...");
            var readerSimulationFiles = new FileReader();
            readerSimulationFiles.onloadend = function (evt) {
                config = JSON.parse(readerSimulationFiles.result);
                loadConfig(config);
                self.generateCanvas("Configuration loaded.");

            };
            readerSimulationFiles.readAsText(new Blob(self.simulationFilesConfig), "utf-8");


        }
        else {
            alert("Please, select the 6 minimal simulation files");
        }
    },
    loadRemoteSimulationFromServer: function (pSimulationId) {
        var self = this;

        if (pSimulationId.length != 0) {
            this.generateCanvas("Loading simulation from server");

            if (_SimulationData != null) delete _SimulationData;
            _SimulationData = new MSP.SimulationData();
            _SimulationFilter = new MSP.SimulationFilter();

            _SimulationData.loadRemoteSimulationFromServer(pSimulationId);

            if (_SimulationController != null) delete _SimulationController;
            _SimulationController = new MSP.SimulationController();

            _SigletonConfig.recalculatePosScales();

        }
        else {
            alert("Please, select valid simulation id.");
        }

    },
    loadRemoteSimulationFromDCache: function (address, simId, user, pass) {
        this.generateCanvas("Loading simulation from DCache");

        if (_SimulationData != null) delete _SimulationData;
        _SimulationData = new MSP.SimulationData();
        _SimulationFilter = new MSP.SimulationFilter();

        _SimulationData.loadRemoteSimulationFromDCache(address, simId, user, pass);

        if (_SimulationController != null) delete _SimulationController;
        _SimulationController = new MSP.SimulationController();

        _SigletonConfig.recalculatePosScales();
    },
    resetSimulation: function () {
        this.generateCanvas("MSPViz");

        if (_SimulationData != null) delete _SimulationData;
        if (_SimulationController != null) delete _SimulationController;
        if (this.activeView != null) delete this.activeView;

        _SimulationData = null;
        _SimulationController = null;
        this.activeView = null;

        $("#jqxBottomControls_ButtonSimulate").prop('disabled', true);

        $('#jqxBottomControls_SliderTimeline').jqxSlider({disabled: true});
        $("#jqxBottomControls_NumericInputStep").jqxNumberInput({disabled: true});
    },
    simulate: function (value) {
        if (_SimulationController != null)
            if (!value)
                _SimulationController.startVisualization();
            else
                _SimulationController.stopVisualization();
    },
    stopSimulation: function () {
        if (_SimulationController != null)
            _SimulationController.stopVisualization();
    },
    disableUI: function (pVal) {

        $("#jqxBottomControls_ButtonSimulate").prop('disabled', pVal);
        $('#jqxBottomControls_SliderTimeline').jqxSlider({disabled: pVal});
        $("#jqxBottomControls_NumericInputStep").jqxNumberInput({disabled: pVal});

        if (!pVal) {
            this.generateView(0);
        }

    },
    updateSampleBandColor: function (interpolator) {

        z = d4.scaleSequential(d4["interpolate" + interpolator]);
        d4.select("#mygrad2")
            .selectAll("stop")
            .each(function (d, i) {
                d4.select(this).style("stop-color", z(i / 20));

            });
        if (typeof _SimulationController !== "undefined")
            _SimulationController.view.updateVisualization();
    },
    saveImageToSVG: function () {
        $('#jqxWindow_ImgExporter').jqxWindow('open');
        saveAsImage();
    },
    createSampleBandColor: function () {

        var windowHeight = $(window).height();
        var windowWidth = $(window).width();
        var heightSVG = $(window).height() * 0.06;
        var marginAxis = windowHeight * 0.002;
        var scaleYPos = windowHeight * 0.02;
        var scaleHeight = heightSVG / 3;
        var marginSide = windowWidth * 0.01;
        var tickSize = heightSVG / 9;

        d4.select("#colorSampleBand").selectAll("svg").remove();

        var svgContainer = d4.select("#colorSampleBand").append("svg")
            .attr("width", _SigletonConfig.width)
            .attr("height", heightSVG)
            .attr("class", "color");

        var z = d4.scaleSequential(d4["interpolate" + _SigletonConfig.calciumScheme]);

        var gradient = svgContainer.append("defs").append("linearGradient")
            .attr("id", "scaleGradient")
            .attr("x1", "0%")
            .attr("x2", "100%")
            .attr("y1", "0%")
            .attr("y2", "0%");

        for (var i = 0; i <= 20; i++) {
            gradient.append("stop")
                .attr("offset", (i * 5) + "%")
                .style("stop-color", z(i / 20))
                .style("stop-opacity", 1);
        }

        svgContainer.append("rect")
            .attr("id", "colorScale")
            .attr("height", scaleHeight)
            .attr("y", scaleYPos)
            .attr("x", marginSide)
            .attr("width", _SigletonConfig.width - marginSide * 2)
            .attr("fill", "url(#scaleGradient)");

        var xI = d3.scale.linear()
            .range([0, _SigletonConfig.width - marginSide * 2])
            .domain([_SimulationData.minICalciumValue, _SimulationData.maxICalciumValue]);

        var xE = d3.scale.linear()
            .range([0, _SigletonConfig.width - marginSide * 2])
            .domain([_SimulationData.minECalciumValue, _SimulationData.maxECalciumValue]);

        var xAxisI = d3.svg.axis()
            .scale(xI)
            .orient("bottom")
            .tickValues(xI.ticks().concat(xI.domain()))
            .tickSize(-tickSize);

        var xAxisE = d3.svg.axis()
            .scale(xE)
            .orient("top")
            .tickValues(xE.ticks().concat(xE.domain()))
            .tickSize(-tickSize);

        svgContainer.append("g")
            .attr("class", "x axis E")
            .attr("transform", "translate(" + marginSide + "," + (scaleYPos + scaleHeight + marginAxis) + ")")
            .call(xAxisI);

        svgContainer.append("g")
            .attr("class", "x axis I")
            .attr("transform", "translate(" + marginSide + "," + (scaleYPos - marginAxis) + ")")
            .call(xAxisE);

        $(".x.axis.I text").first().css("text-anchor", "start");
        $(".x.axis.E text").first().css("text-anchor", "start");
        $(".x.axis.I text").last().css("text-anchor", "end");
        $(".x.axis.E text").last().css("text-anchor", "end");

    },
    deleteFilter: function (currentElem) {
        var elem = $(".filtro");
        for (var i = 0; i < elem.length; i++) {
            if (elem.eq(i).is(currentElem)) {
                _SimulationFilter.filters.splice(i, 1);
                $("#listaFiltros").children()[i].remove();
            }
        }


    }
};

//Generate the interface
_gVisualizatorUI = new UI.Visualizator();
//# sourceURL=InterfaceLogic.js