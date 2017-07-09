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
                    $("#jqxConfWindow_ButtonLoadSimulationFiles").prop("disabled",true);

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
                    $("#jqxConfWindow_ButtonLoadSimulationFiles").prop("disabled",false);
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
                    $("#jqxConfWindow_ButtonLoadConfig").prop("disabled",true);

                    alert('Please select one configuration file');
                }
                else {
                    _SigletonConfig.localFilesPath = $('#jqxInputConfigFilesLocalPath').val();
                    self.simulationFilesConfig = files;

                    if (files.length === 1) lFiles = "Num files correct";
                    else                    lFiles = "Select only one configuration file";

                    $("#jqxInputConfigFilesLocalPath").val(lFiles);
                    $("#jqxConfWindow_ButtonLoadConfig").prop("disabled",false);
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

                $("#jqxBottomControls_ButtonSimulate").jqxButton({width: '150', disabled: true});
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

                $("#btnAddID").jqxButton({width: '80', height: '25px'});
                $("#btnAddID").on('click', function (event) {
                    var id = $("#numericImputElipse").jqxNumberInput('val');
                    if (id >= 0 && id < _SimulationData.gNeurons.length)
                        _SimulationData.gNeurons[$("#numericImputElipse").jqxNumberInput('val')].centerElipse = true;
                    $("#listaCentroElipse").append('<li class="listaCentro">' + id + '<button class="btnCentro" onclick="delCenter(' + id + ');">X</button> </li>');
                    _SimulationController.view.update();
                });

                $("#btnAddSelected").jqxButton({width: '180', height: '25px'});
                $("#btnAddSelected").on('click', function (event) {
                    _SimulationFilter.gNeuronsFilter.forEach(function (z) {
                        var d = _SimulationData.gNeurons[z];
                        if (d.selected) {
                            d.centerElipse = true;
                            $("#listaCentroElipse").append('<li class="listaCentro">' + d.NId + '<button class="btnCentro" onclick="delCenter(' + d.NId + ');">X</button> </li>');
                        }
                    });
                    _SimulationController.view.update();
                });

                $("#btnRmSelected").jqxButton({width: '180', height: '25px'});
                $("#btnRmSelected").on('click', function (event) {
                    $("#listaCentroElipse").empty();
                    _SimulationData.gNeurons.forEach(function (d) {
                        d.centerElipse = false;
                    });
                    _SimulationController.view.update();
                });

                $("#rmSelected").jqxButton({width: '180', height: '25px'});
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

                var sourceFilter = [
                    {
                        html: "<div tabIndex=0 style='padding: 1px;'><div>Calcium Conc.</div>",
                        label: "Calcium Concentration",
                        cat: "decimal",
                        type: "Ca",
                        typeFull: "Calcium Conc.",
                        color: "#de9425"
                    },
                    {
                        html: "<div tabIndex=0 style='padding: 1px;'><div>Excitatory Conn.</div>",
                        label: "Excitatory Connections",
                        cat: "real",
                        type: "IConn",
                        typeFull: "Inhibitory Conn.",
                        color: _SigletonConfig.IColor
                    },
                    {
                        html: "<div tabIndex=0 style='padding: 1px;'><div>Inhibitory Conn.</div>",
                        label: "Inhibitory Connections",
                        cat: "real",
                        type: "EConn",
                        typeFull: "Excitatory Conn.",
                        color: _SigletonConfig.EColor
                    },
                    {
                        html: "<div tabIndex=0 style='padding: 1px;'><div>Axonal Conn.</div>",
                        label: "Axonal Connections",
                        cat: "real",
                        type: "AConn",
                        typeFull: "Axonal Conn.",
                        color: _SigletonConfig.AColor
                    }];

                $("#comboBoxTypeFilter").jqxDropDownList({
                    theme: "arctic",
                    selectedIndex: 0,
                    source: sourceFilter,
                    width: 170,
                    height: 25
                });
                $("#comboBoxTypeFilter").on('change', function () {
                    var idx = $("#comboBoxTypeFilter").jqxDropDownList('getSelectedIndex');
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

                $("#btnApplyFilter").jqxButton({width: '110', height: '25'});

                $("#btnApplyFilter").on('click', function () {
                    var idx = $("#comboBoxTypeFilter").jqxDropDownList('getSelectedIndex');
                    var tipo = sourceFilter[idx].type;
                    var color = sourceFilter[idx].color;
                    var tipoCompleto = sourceFilter[idx].typeFull;
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


                var source = [
                    {
                        html: "<div tabIndex=0 style='padding: 1px;'><div>schemeAccent</div>",
                        label: "schemeAccent",
                        group: "Categorical"
                    },
                    {
                        html: "<div tabIndex=0 style='padding: 1px;'><div>schemeDark2</div>",
                        label: "schemeDark2",
                        group: "Categorical"
                    },
                    {
                        html: "<div tabIndex=0 style='padding: 1px;'><div>schemePaired</div>",
                        label: "schemePaired",
                        group: "Categorical"
                    },
                    {
                        html: "<div tabIndex=0 style='padding: 1px;'><div>schemePastel1</div>",
                        label: "schemePastel1",
                        group: "Categorical"
                    },
                    {
                        html: "<div tabIndex=0 style='padding: 1px;'><div>schemePastel2</div>",
                        label: "schemePastel2",
                        group: "Categorical"
                    },
                    {
                        html: "<div tabIndex=0 style='padding: 1px;'><div>schemeSet1</div>",
                        label: "schemeSet1",
                        group: "Categorical"
                    },
                    {
                        html: "<div tabIndex=0 style='padding: 1px;'><div>schemeSet2</div>",
                        label: "schemeSet2",
                        group: "Categorical"
                    },
                    {
                        html: "<div tabIndex=0 style='padding: 1px;'><div>schemeSet3</div>",
                        label: "schemeSet3",
                        group: "Categorical"
                    },
                    {
                        html: "<div tabIndex=0 style='padding: 1px;'><div>Viridis</div>",
                        label: "Viridis",
                        group: "Diverging"
                    },
                    {
                        html: "<div tabIndex=0 style='padding: 1px;'><div>Inferno</div>",
                        label: "Inferno",
                        group: "Diverging"
                    },
                    {html: "<div tabIndex=0 style='padding: 1px;'><div>Magma</div>", label: "Magma", group: "Diverging"},
                    {html: "<div tabIndex=0 style='padding: 1px;'><div>Plasma</div>", label: "Plasma", group: "Diverging"},
                    {html: "<div tabIndex=0 style='padding: 1px;'><div>Warm</div>", label: "Warm", group: "Diverging"},
                    {html: "<div tabIndex=0 style='padding: 1px;'><div>Cool</div>", label: "Cool", group: "Diverging"},
                    {
                        html: "<div tabIndex=0 style='padding: 1px;'><div>Cubehelix</div>",
                        label: "CubehelixDefault",
                        group: "Diverging"
                    },
                    {html: "<div tabIndex=0 style='padding: 1px;'><div>BrBG</div>", label: "BrBG", group: "Diverging"},
                    {html: "<div tabIndex=0 style='padding: 1px;'><div>PRGn</div>", label: "PRGn", group: "Diverging"},
                    {html: "<div tabIndex=0 style='padding: 1px;'><div>PiYG</div>", label: "PiYG", group: "Diverging"},
                    {html: "<div tabIndex=0 style='padding: 1px;'><div>PuOr</div>", label: "PuOr", group: "Diverging"},
                    {html: "<div tabIndex=0 style='padding: 1px;'><div>RdBu</div>", label: "RdBu", group: "Diverging"},
                    {html: "<div tabIndex=0 style='padding: 1px;'><div>RdGy</div>", label: "RdGy", group: "Diverging"},
                    {html: "<div tabIndex=0 style='padding: 1px;'><div>RdYlBu</div>", label: "RdYlBu", group: "Diverging"},
                    {html: "<div tabIndex=0 style='padding: 1px;'><div>RdYlGn</div>", label: "RdYlGn", group: "Diverging"},
                    {
                        html: "<div tabIndex=0 style='padding: 1px;'><div>Spectral</div>",
                        label: "Spectral",
                        group: "Diverging"
                    },
                    {html: "<div tabIndex=0 style='padding: 1px;'><div>Greens</div>", label: "Greens", group: "Sequential"},
                    {html: "<div tabIndex=0 style='padding: 1px;'><div>Greys</div>", label: "Greys", group: "Sequential"},
                    {
                        html: "<div tabIndex=0 style='padding: 1px;'><div>Oranges</div>",
                        label: "Oranges",
                        group: "Sequential"
                    },
                    {
                        html: "<div tabIndex=0 style='padding: 1px;'><div>Purples</div>",
                        label: "Purples",
                        group: "Sequential"
                    },
                    {html: "<div tabIndex=0 style='padding: 1px;'><div>Reds</div>", label: "Reds", group: "Sequential"},
                    {html: "<div tabIndex=0 style='padding: 1px;'><div>BuGn</div>", label: "BuGn", group: "Sequential"},
                    {html: "<div tabIndex=0 style='padding: 1px;'><div>BuPu</div>", label: "BuPu", group: "Sequential"},
                    {html: "<div tabIndex=0 style='padding: 1px;'><div>GnBu</div>", label: "GnBu", group: "Sequential"},
                    {html: "<div tabIndex=0 style='padding: 1px;'><div>OrRd</div>", label: "OrRd", group: "Sequential"},
                    {html: "<div tabIndex=0 style='padding: 1px;'><div>PuBuGn</div>", label: "PuBuGn", group: "Sequential"},
                    {html: "<div tabIndex=0 style='padding: 1px;'><div>PuBu</div>", label: "PuBu", group: "Sequential"},
                    {html: "<div tabIndex=0 style='padding: 1px;'><div>PuRd</div>", label: "PuRd", group: "Sequential"},
                    {html: "<div tabIndex=0 style='padding: 1px;'><div>RdPu</div>", label: "RdPu", group: "Sequential"},
                    {html: "<div tabIndex=0 style='padding: 1px;'><div>YlGnBu</div>", label: "YlGnBu", group: "Sequential"},
                    {html: "<div tabIndex=0 style='padding: 1px;'><div>YlGn</div>", label: "YlGn", group: "Sequential"},
                    {html: "<div tabIndex=0 style='padding: 1px;'><div>YlOrBr</div>", label: "YlOrBr", group: "Sequential"},
                    {
                        html: "<div tabIndex=0 style='padding: 1px;'><div>YlOrRd</div>",
                        label: "YlOrRd",
                        group: "Sequential"
                    }];

                var sourceScale = [
                    {
                        html: "<div tabIndex=0 style='padding: 1px;'><div>Viridis</div>",
                        label: "Viridis",
                        group: "Diverging"
                    },
                    {
                        html: "<div tabIndex=0 style='padding: 1px;'><div>Inferno</div>",
                        label: "Inferno",
                        group: "Diverging"
                    },
                    {html: "<div tabIndex=0 style='padding: 1px;'><div>Magma</div>", label: "Magma", group: "Diverging"},
                    {html: "<div tabIndex=0 style='padding: 1px;'><div>Plasma</div>", label: "Plasma", group: "Diverging"},
                    {html: "<div tabIndex=0 style='padding: 1px;'><div>Warm</div>", label: "Warm", group: "Diverging"},
                    {html: "<div tabIndex=0 style='padding: 1px;'><div>Cool</div>", label: "Cool", group: "Diverging"},
                    {
                        html: "<div tabIndex=0 style='padding: 1px;'><div>Cubehelix</div>",
                        label: "CubehelixDefault",
                        group: "Diverging"
                    },
                    {html: "<div tabIndex=0 style='padding: 1px;'><div>BrBG</div>", label: "BrBG", group: "Diverging"},
                    {html: "<div tabIndex=0 style='padding: 1px;'><div>PRGn</div>", label: "PRGn", group: "Diverging"},
                    {html: "<div tabIndex=0 style='padding: 1px;'><div>PiYG</div>", label: "PiYG", group: "Diverging"},
                    {html: "<div tabIndex=0 style='padding: 1px;'><div>PuOr</div>", label: "PuOr", group: "Diverging"},
                    {html: "<div tabIndex=0 style='padding: 1px;'><div>RdBu</div>", label: "RdBu", group: "Diverging"},
                    {html: "<div tabIndex=0 style='padding: 1px;'><div>RdGy</div>", label: "RdGy", group: "Diverging"},
                    {html: "<div tabIndex=0 style='padding: 1px;'><div>RdYlBu</div>", label: "RdYlBu", group: "Diverging"},
                    {html: "<div tabIndex=0 style='padding: 1px;'><div>RdYlGn</div>", label: "RdYlGn", group: "Diverging"},
                    {
                        html: "<div tabIndex=0 style='padding: 1px;'><div>Spectral</div>",
                        label: "Spectral",
                        group: "Diverging"
                    },
                    {html: "<div tabIndex=0 style='padding: 1px;'><div>Greens</div>", label: "Greens", group: "Sequential"},
                    {html: "<div tabIndex=0 style='padding: 1px;'><div>Greys</div>", label: "Greys", group: "Sequential"},
                    {
                        html: "<div tabIndex=0 style='padding: 1px;'><div>Oranges</div>",
                        label: "Oranges",
                        group: "Sequential"
                    },
                    {
                        html: "<div tabIndex=0 style='padding: 1px;'><div>Purples</div>",
                        label: "Purples",
                        group: "Sequential"
                    },
                    {html: "<div tabIndex=0 style='padding: 1px;'><div>Reds</div>", label: "Reds", group: "Sequential"},
                    {html: "<div tabIndex=0 style='padding: 1px;'><div>BuGn</div>", label: "BuGn", group: "Sequential"},
                    {html: "<div tabIndex=0 style='padding: 1px;'><div>BuPu</div>", label: "BuPu", group: "Sequential"},
                    {html: "<div tabIndex=0 style='padding: 1px;'><div>GnBu</div>", label: "GnBu", group: "Sequential"},
                    {html: "<div tabIndex=0 style='padding: 1px;'><div>OrRd</div>", label: "OrRd", group: "Sequential"},
                    {html: "<div tabIndex=0 style='padding: 1px;'><div>PuBuGn</div>", label: "PuBuGn", group: "Sequential"},
                    {html: "<div tabIndex=0 style='padding: 1px;'><div>PuBu</div>", label: "PuBu", group: "Sequential"},
                    {html: "<div tabIndex=0 style='padding: 1px;'><div>PuRd</div>", label: "PuRd", group: "Sequential"},
                    {html: "<div tabIndex=0 style='padding: 1px;'><div>RdPu</div>", label: "RdPu", group: "Sequential"},
                    {html: "<div tabIndex=0 style='padding: 1px;'><div>YlGnBu</div>", label: "YlGnBu", group: "Sequential"},
                    {html: "<div tabIndex=0 style='padding: 1px;'><div>YlGn</div>", label: "YlGn", group: "Sequential"},
                    {html: "<div tabIndex=0 style='padding: 1px;'><div>YlOrBr</div>", label: "YlOrBr", group: "Sequential"},
                    {
                        html: "<div tabIndex=0 style='padding: 1px;'><div>YlOrRd</div>",
                        label: "YlOrRd",
                        group: "Sequential"
                    }];

                $("#neuronScalePicker").jqxComboBox({
                    theme: "arctic",
                    selectedIndex: 5,
                    source: source,
                    width: 145,
                    height: 16
                });
                $("#neuronScalePicker").on('change', function () {
                    var domColores = [$("#dropDownExcitatoryButton"), $("#dropDownInhibitoryButton"), $("#dropDownAxonalButton")];
                    var propColores = [_SigletonConfig.EColor, _SigletonConfig.IColor, _SigletonConfig.AColor];
                    var colorSelec = $("#neuronScalePicker").jqxComboBox('val');
                    propColores = _ColorPicker.generateColors($("#neuronScalePicker"), domColores, propColores);
                    _SigletonConfig.EColor = propColores[0];
                    _SigletonConfig.IColor = propColores[1];
                    _SigletonConfig.AColor = propColores[2];
                    _SigletonConfig.neuronsScheme = colorSelec;
                    updateCookieColor();
                    if (_SimulationController !== null)
                        _SimulationController.view.updateVisualization()
                });

                $("#connectionsScalePicker").jqxComboBox({
                    theme: "arctic",
                    selectedIndex: 5,
                    source: source,
                    width: 145,
                    height: 16
                });
                $("#connectionsScalePicker").on('change', function () {
                    var domColores = [$("#dropDownEEButton"), $("#dropDownEIButton"), $("#dropDownIEButton"), $("#dropDownIIButton")];
                    var propColores = [_SigletonConfig.EEColor, _SigletonConfig.EIColor, _SigletonConfig.IEColor, _SigletonConfig.IIColor];
                    var colorSelec = $("#connectionsScalePicker").jqxComboBox('val');
                    propColores = _ColorPicker.generateColors($("#connectionsScalePicker"), domColores, propColores);
                    _SigletonConfig.EEColor = propColores[0];
                    _SigletonConfig.EIColor = propColores[1];
                    _SigletonConfig.IEColor = propColores[2];
                    _SigletonConfig.IIColor = propColores[3];
                    _SigletonConfig.connectionsScheme = colorSelec;
                    updateCookieColor();
                    if (_SimulationController !== null)
                        _SimulationController.view.updateVisualization()
                });

                self.generateScaleCalcium();
                $("#calciumScalePicker").jqxComboBox({
                    theme: "arctic",
                    selectedIndex: 1,
                    source: sourceScale,
                    width: 145,
                    height: 16
                });
                $("#calciumScalePicker").on('change', function () {
                    var domColores = [$("#dropDownCaMaxValueColorButton"), $("#dropDownCaMinValueColorButton")];
                    var propColores = [_SigletonConfig.EColor, _SigletonConfig.IColor];
                    var colorSelec = $("#calciumScalePicker").jqxComboBox('val');
                    propColores = _ColorPicker.generateColors($("#calciumScalePicker"), domColores, propColores);
                    _SigletonConfig.maxCaColor = propColores[0];
                    _SigletonConfig.minCaColor = propColores[1];
                    _SigletonConfig.calciumScheme = colorSelec;
                    updateCookieColor();
                    self.generateScaleCalcium();
                    if (_SimulationController !== null) {
                        if (_SimulationController.activeViewID !== 0 && _SimulationController.activeViewID !== 5)
                            self.createSampleBandColor();
                        _SimulationData.recalculateScales();
                        _SimulationController.view.updateVisualization();
                    }
                });

                $("#dropDownInhibitoryButton").jqxDropDownButton({width: 150, height: 22});
                $("#dropDownInhibitoryButton").jqxDropDownButton('setContent', self.getTextElementByColor(new $.jqx.color({hex: _SigletonConfig.IColor.substring(1)})));
                $("#dropDownInhibitoryButton").css("color", _ColorPicker.getTextForColor(d4.color(_SigletonConfig.IColor)));

                $("#dropDownInhibitoryButton").on('click', function () {
                    caller = $("#dropDownInhibitoryButton");
                    $("#popup").show();
                });

                $('#dropDownInhibitoryButton').on('close', function (event) {
                    _SigletonConfig.IColor = _ColorPicker.rgbToHex(_ColorPicker.colorSelecGlobal);
                    updateCookieColor();
                    $("#popup").hide();
                });

                $("#dropDownExcitatoryButton").on('click', function () {
                    caller = $("#dropDownExcitatoryButton");
                    $("#popup").show();
                });

                $('#dropDownExcitatoryButton').on('close', function (event) {
                    _SigletonConfig.EColor = _ColorPicker.rgbToHex(_ColorPicker.colorSelecGlobal);
                    updateCookieColor();
                    $("#popup").hide();
                });

                $("#dropDownAxonalButton").on('click', function () {
                    caller = $("#dropDownAxonalButton");
                    $("#popup").show();
                });

                $('#dropDownAxonalButton').on('close', function (event) {
                    _SigletonConfig.AColor = _ColorPicker.rgbToHex(_ColorPicker.colorSelecGlobal);
                    updateCookieColor();
                    $("#popup").hide();
                });

                $("#dropDownEEButton").on('click', function () {
                    caller = $("#dropDownEEButton");
                    $("#popup").show();
                });
                $('#dropDownEEButton').on('close', function (event) {
                    _SigletonConfig.EEColor = _ColorPicker.rgbToHex(_ColorPicker.colorSelecGlobal);
                    updateCookieColor();
                    $("#popup").hide();
                });

                $("#dropDownEIButton").on('click', function () {
                    caller = $("#dropDownEIButton");
                    $("#popup").show();
                });
                $('#dropDownEIButton').on('close', function (event) {
                    _SigletonConfig.EIColor = _ColorPicker.rgbToHex(_ColorPicker.colorSelecGlobal);
                    updateCookieColor();
                    $("#popup").hide();
                });

                $("#dropDownIEButton").on('click', function () {
                    caller = $("#dropDownIEButton");
                    $("#popup").show();
                });
                $('#dropDownIEButton').on('close', function (event) {
                    _SigletonConfig.IEColor = _ColorPicker.rgbToHex(_ColorPicker.colorSelecGlobal);
                    updateCookieColor();
                    $("#popup").hide();
                });

                $("#dropDownIIButton").on('click', function () {
                    caller = $("#dropDownIIButton");
                    $("#popup").show();
                });
                $('#dropDownIIButton').on('close', function (event) {
                    _SigletonConfig.IIColor = _ColorPicker.rgbToHex(_ColorPicker.colorSelecGlobal);
                    updateCookieColor();
                    $("#popup").hide();
                });

                $("#dropDownCaMinValueColorButton").on('click', function () {
                    caller = $("#dropDownCaMinValueColorButton");
                    $("#popup").show();
                });
                $('#dropDownCaMinValueColorButton').on('close', function (event) {
                    _SigletonConfig.minCaColor = _ColorPicker.rgbToHex(_ColorPicker.colorSelecGlobal);
                    updateCookieColor();
                    $("#popup").hide();
                });

                $("#dropDownCaMaxValueColorButton").on('click', function () {
                    caller = $("#dropDownCaMaxValueColorButton");
                    $("#popup").show();
                });
                $('#dropDownCaMaxValueColorButton').on('close', function (event) {
                    _SigletonConfig.maxCaColor = _ColorPicker.rgbToHex(_ColorPicker.colorSelecGlobal);
                    updateCookieColor();
                    $("#popup").hide();
                });


                $("#dropDownExcitatoryButton").jqxDropDownButton({width: 150, height: 22});
                $("#dropDownExcitatoryButton").jqxDropDownButton('setContent', self.getTextElementByColor(new $.jqx.color({hex: _SigletonConfig.EColor.substring(1)})));
                $("#dropDownExcitatoryButton").css("color", _ColorPicker.getTextForColor(d4.color(_SigletonConfig.EColor)));


                $("#dropDownAxonalButton").jqxDropDownButton({width: 150, height: 22});
                $("#dropDownAxonalButton").jqxDropDownButton('setContent', self.getTextElementByColor(new $.jqx.color({hex: _SigletonConfig.AColor.substring(1)})));
                $("#dropDownAxonalButton").css("color", _ColorPicker.getTextForColor(d4.color(_SigletonConfig.AColor)));


                $("#dropDownEEButton").jqxDropDownButton({width: 150, height: 22});
                $("#dropDownEEButton").jqxDropDownButton('setContent', self.getTextElementByColor(new $.jqx.color({hex: _SigletonConfig.EEColor.substring(1)})));
                $("#dropDownEEButton").css("color", _ColorPicker.getTextForColor(d4.color(_SigletonConfig.EEColor)));
                //EI color picker
                // $("#EIColorPicker").on('colorchange', function (event)
                // 								{
                // 					                    $("#dropDownEIButton").jqxDropDownButton('setContent', self.getTextElementByColor(event.args.color));
                // 					                    _SigletonConfig.EIColor = "#"+event.args.color.hex;
                // 					                });
                // $("#EIColorPicker").jqxColorPicker({ color: "FFA500", colorMode: 'hue', width: 220, height: 220});
                $("#dropDownEIButton").jqxDropDownButton({width: 150, height: 22});
                $("#dropDownEIButton").jqxDropDownButton('setContent', self.getTextElementByColor(new $.jqx.color({hex: _SigletonConfig.EIColor.substring(1)})));
                $("#dropDownEIButton").css("color", _ColorPicker.getTextForColor(d4.color(_SigletonConfig.EIColor)));
                //IE color picker
                // $("#IEColorPicker").on('colorchange', function (event)
                // 									{
                // 				                    $("#dropDownIEButton").jqxDropDownButton('setContent', self.getTextElementByColor(event.args.color));
                // 				                    _SigletonConfig.IEColor = "#"+event.args.color.hex;
                // 				                });
                // $("#IEColorPicker").jqxColorPicker({ color: "8C00FF", colorMode: 'hue', width: 220, height: 220});
                $("#dropDownIEButton").jqxDropDownButton({width: 150, height: 22});
                $("#dropDownIEButton").jqxDropDownButton('setContent', self.getTextElementByColor(new $.jqx.color({hex: _SigletonConfig.IEColor.substring(1)})));
                $("#dropDownIEButton").css("color", _ColorPicker.getTextForColor(d4.color(_SigletonConfig.IEColor)));
                //II color picker
                // $("#IIColorPicker").on('colorchange', function (event)
                // 									{
                // 				                    $("#dropDownIIButton").jqxDropDownButton('setContent', self.getTextElementByColor(event.args.color));
                // 				                    _SigletonConfig.IIColor = "#"+event.args.color.hex;
                // 				                });
                // $("#IIColorPicker").jqxColorPicker({ color: "0000FF", colorMode: 'hue', width: 220, height: 220});
                $("#dropDownIIButton").jqxDropDownButton({width: 150, height: 22});
                $("#dropDownIIButton").jqxDropDownButton('setContent', self.getTextElementByColor(new $.jqx.color({hex: _SigletonConfig.IIColor.substring(1)})));
                $("#dropDownIIButton").css("color", _ColorPicker.getTextForColor(d4.color(_SigletonConfig.IIColor)));
                //Ca min value color picker
                // $("#CaMinValueColorColorPicker").on('colorchange', function (event)
                // 									{
                // 				                    $("#dropDownCaMinValueColorButton").jqxDropDownButton('setContent', self.getTextElementByColor(event.args.color));
                // 				                    _SigletonConfig.minCaColor = "#"+event.args.color.hex;
                // 				                });
                // $("#CaMinValueColorColorPicker").jqxColorPicker({ color: "0000FF", colorMode: 'hue', width: 220, height: 220});
                $("#dropDownCaMinValueColorButton").jqxDropDownButton({width: 150, height: 22});
                $("#dropDownCaMinValueColorButton").jqxDropDownButton('setContent', self.getTextElementByColor(new $.jqx.color({hex: _SigletonConfig.minCaColor.substring(1)})));
                $("#dropDownCaMinValueColorButton").css("color", _ColorPicker.getTextForColor(d4.color(_SigletonConfig.minCaColor)));
                //Ca max value color picker
                // $("#CaMaxValueColorColorPicker").on('colorchange', function (event)
                // 									{
                // 				                    $("#dropDownCaMaxValueColorButton").jqxDropDownButton('setContent', self.getTextElementByColor(event.args.color));
                // 				                    _SigletonConfig.maxCaColor = "#"+event.args.color.hex;
                // 				                });
                // $("#CaMaxValueColorColorPicker").jqxColorPicker({ color: "FF0000", colorMode: 'hue', width: 220, height: 220});
                $("#dropDownCaMaxValueColorButton").jqxDropDownButton({width: 150, height: 22});
                $("#dropDownCaMaxValueColorButton").jqxDropDownButton('setContent', self.getTextElementByColor(new $.jqx.color({hex: _SigletonConfig.maxCaColor.substring(1)})));
                $("#dropDownCaMaxValueColorButton").css("color", _ColorPicker.getTextForColor(d4.color(_SigletonConfig.maxCaColor)));

                $('#jqxMacroVControls_SliderApha').jqxSlider({
                    tooltip: true,
                    mode: 'fixed',
                    width: '150px',
                    showTicks: true,
                    max: 1,
                    showButtons: true,
                    step: 0.01
                });
                $('#jqxMacroVControls_SliderApha').on('slideEnd', function (event) {
                    _SigletonConfig.macroVAlpha = event.args.value;
                });


                $("#jqxRadioButtonCaSetPointFromFile").jqxRadioButton({
                    groupName: '1',
                    width: 190,
                    height: 25,
                    checked: true
                });
                $("#jqxRadioButtonCaSetPointFromNeuronValues").jqxRadioButton({groupName: '1', width: 190, height: 25});
                $("#jqxRadioButtonHSLColorInterpol").jqxRadioButton({
                    groupName: '2',
                    width: 190,
                    height: 25,
                    checked: true
                });
                $("#jqxRadioButtonRGBColorInterpol").jqxRadioButton({groupName: '2', width: 190, height: 25});

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

                $("#jqxRadioButtonHSLColorInterpol").on('change', function (event) {
                    var checked = event.args.checked;
                    if (checked) {
                        _SigletonConfig.ColorInerpolMethod = "HSL";
                    }
                });

                $("#jqxRadioButtonRGBColorInterpol").on('change', function (event) {
                    var checked = event.args.checked;
                    if (checked) {
                        _SigletonConfig.ColorInerpolMethod = "RGB";
                    }
                });

                $("#jqxRadioButtonCaSetPointFromFile").jqxRadioButton('check');
                $("#jqxRadioButtonHSLColorInterpol").jqxRadioButton('check');

                var lCaInterpolMethods = [
                    "Linear",
                    "Log",
                    "Identity",
                    "Power",
                    "Quantize",
                    "Quantile"
                ];

                $("#dropDownCaInterpolMethodButton").jqxComboBox({
                    source: lCaInterpolMethods,
                    selectedIndex: 0,
                    width: '100px',
                    height: '25',
                    disabled: "true"
                });

                var lSEViewrSelector = [
                    "All",
                    "Vacants only",
                    "Connected only",
                ];

                $("#dropDownSynapticElementsToViewButton").jqxComboBox({
                    source: lSEViewrSelector,
                    selectedIndex: 0,
                    width: '150px',
                    height: '25'
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

                //-->>Global View controls
                $("#jqxRadioButtonGlobalVBarrs").jqxRadioButton({width: 250, height: 25, checked: true});
                $("#jqxRadioButtonGlobalVFuncts").jqxRadioButton({width: 250, height: 25});

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
        document.getElementById("sideNav").style.left = "2.5%";
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
        if (_SigletonConfig.svg != null) {
            d3.select("svg")
                .remove();
        }

        _SigletonConfig.svg = d3.select("#renderArea")
            .append("svg:svg")
            .text("Text de texto")
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

            return true;

        }
        else {
            window.alert("Please, load simulation files first.");
            return false;
        }
    },
    resize: function () {
        var self = this;
        _SigletonConfig.height = $(window).height() - $("#jqxBottomControls").height() - $("#colorSampleBand").height();
        _SigletonConfig.width = $(window).width() - $("#icon-bar").width();
        if (_SimulationController !== null) {
            _SimulationController.view.resize();
            _SimulationController.view.updateVisualization();
            if (_SimulationController.activeViewID !== 0 && _SimulationController.activeViewID !== 5)
                self.createSampleBandColor();
        }
        var width = ($('#control1').width() + $('#control2').width() + $('#control4').width() + $('#control5').width()) * 1.1;
        $('#jqxBottomControls_SliderTimeline').jqxSlider('width', 0);
        $('#jqxBottomControls_SliderTimeline').jqxSlider('width', $('#controles').width() - width);
    },
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

        $("#jqxBottomControls_ButtonSimulate").jqxButton({disabled: true});

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

        $("#jqxBottomControls_ButtonSimulate").jqxButton({disabled: pVal});
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
        d4.select("#colorSampleBand").selectAll("svg").remove();
        var svgContainer = d4.select("#colorSampleBand").append("svg")
            .attr("x", 0).attr("y", 20)
            .attr("width", _SigletonConfig.width)
            .attr("height", 60)
            .attr("class", "color");

        var z = d4.scaleSequential(d4["interpolate" + _SigletonConfig.calciumScheme]);

        var lg = svgContainer.append("defs").append("linearGradient")
            .attr("id", "mygrad2")
            .attr("x1", "0%")
            .attr("x2", "100%")
            .attr("y1", "0%")
            .attr("y2", "0%")
        ;
        for (var i = 0; i <= 20; i++) {
            lg.append("stop")
                .attr("offset", (i * 5) + "%")
                .style("stop-color", z(i / 20))
                .style("stop-opacity", 1);
        }

        var rectangle = svgContainer.append("rect")
            .attr("id", "boix2")
            .attr("height", 20)
            .attr("y", 22)
            .attr("x", 10)
            .attr("width", _SigletonConfig.width - 20)
            .attr("fill", "url(#mygrad2)");

        var x = d3.scale.linear().range([0, _SigletonConfig.width - 20]).domain([_SimulationData.minICalciumValue, _SimulationData.maxICalciumValue]);
        var xE = d3.scale.linear().range([0, _SigletonConfig.width - 20]).domain([_SimulationData.minECalciumValue, _SimulationData.maxECalciumValue]);
        var xAxis = d3.svg.axis().scale(x).orient("bottom").tickValues(x.ticks().concat(x.domain())).tickSize(-10);
        var xAxisE = d3.svg.axis().scale(xE).orient("top").tickValues(xE.ticks().concat(xE.domain())).tickSize(-10);

        svgContainer.append("g")
            .attr("class", "x axis E")
            .attr("transform", "translate(10,45)")
            .call(xAxis);

        svgContainer.append("g")
            .attr("class", "x axis I")
            .attr("transform", "translate(10,18)")
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