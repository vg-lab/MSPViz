 /**
 * @brief
 * @author  Juan Pedro Brito Mendez <juanpebm@gmail.com>
 * @date
 * @remarks Do not distribute without further notice.
 */


//Global vars
_SimulationController 	= 	null;
_SimulationData = 	null;

UI.Visualizator = function()
{
	this.activeView 		= null;		
	this.simulationFiles 	= null;
	
	this.generateUI();
};

UI.Visualizator.prototype = 
{	
	constructor: UI.Visualizator
	
	,generateUI: function()
	{
		var self = this;
		
		//Dont reload the files form the same place in Chrome
		document.getElementById('fileDialog').addEventListener('change',
		function (evt) //selectFiles()
		 {
		    var files = document.getElementById('fileDialog').files;
		    
		    var lOrderOfFiles = ["LocalNeuronInformation.json", "GlobalSimulationParams.json","Connectivity.json"];
		    var lOrederedFiles=[];
		    
		    if ( (!files.length) || (files.length!=3) )
		    {
		    	self.simulationFiles = null;

		    	$("#jqxInputLocalFile").jqxInput({placeHolder: ""});
		    	$("#jqxInputGlobalFile").jqxInput({placeHolder: ""});
		    	$("#jqxInputConnectivityFile").jqxInput({placeHolder: ""});
		    	
		    	$("#jqxConfWindow_ButtonLoadSimulationFiles").jqxButton({ disabled: true});
		    	
		    	alert('Please select the 3 simulation files: ... !');
		    }
		    else 
		    {
		    	for (var i=0;i<3;++i)
		    		for (var j=0;j<3;++j)
		    			if (escape(files[j].name)==lOrderOfFiles[i])
		    				lOrederedFiles.push(files[j]);

			    if ( lOrederedFiles.length==3 )
			    {
			    	self.simulationFiles = lOrederedFiles;

			    	$("#jqxInputLocalFile").jqxInput({placeHolder: self.simulationFiles[0].name});
			    	$("#jqxInputGlobalFile").jqxInput({placeHolder: self.simulationFiles[1].name});
			    	$("#jqxInputConnectivityFile").jqxInput({placeHolder: self.simulationFiles[2].name});
			    	
			    	$("#jqxConfWindow_ButtonLoadSimulationFiles").jqxButton({ disabled: false});
			    }
			    else
			    {
			    	self.simulationFiles = null;

			    	$("#jqxInputLocalFile").jqxInput({placeHolder: ""});
			    	$("#jqxInputGlobalFile").jqxInput({placeHolder: ""});
			    	$("#jqxInputConnectivityFile").jqxInput({placeHolder: ""});
			    	
			    	$("#jqxConfWindow_ButtonLoadSimulationFiles").jqxButton({ disabled: true});
			    	
			    	alert('XXX Please select the 3 simulation files: LocalNeuronInformation.json, GlobalSimulationParams.json and Connectivity.json !');
			    }
		    }				
		 }
		,false)
		;
		
	    $(document).ready(	function () 
			{	    	
	             // Logic of the interface
	             $("#jqxMenu").jqxMenu({ width: _SigletonConfig.width , height: "30px"
	             						,animationShowDuration: 300, animationHideDuration: 200, animationShowDelay: 200
	             						,enableHover: true, autoOpen: false
	             						//, theme: lTheme
	             						});			             
	             $("#jqxMenu").css('visibility', 'visible');
                 $("#jqxMenu").on('itemclick', function (event)
                    	{
                    		//Spaces at the end ...
    				    	var element =  $(event.args).text().trim();

    					    switch(element) 
    					    {
    						    case "File":

    						    	break;
    						    case "Open local simulation":
    						    	self.showLoadSimulation();
    					        	break;
    						    case "Reset Visualizator":
    						    	self.resetSimulation();
    						    	break;    					        	
    						    case "Take a snapshot":
    						    	self.saveImageToSVG();
    					        	break;
    						    case "Preferences":
    						    	self.showPreferences();
    					        	break;
    						    case "Global Connections View":
    						    	self.generateView(0);
    					        	break;    					        	    					        	
    						    case "Macroscopic View":
    						    	self.generateView(1);
    					        	break;
    						    case "Microscopic View":
    						    	self.generateView(2);
    					        	break;
    						    case "Detail Microscopic View":
    						    	self.generateView(3);
    					        	break;    					        	    					        	
    						    case "About":
    						    	self.showInfo();
    					        	break;
    						    default:
    						        //console.log("Unrecognized option!");
    					}
                    });
	             
	             $("#jqxBottomControls_ButtonSimulate").jqxButton({ width: '150', disabled:true });
	             $("#jqxBottomControls_ButtonSimulate").on('click', function (event) {
	            	 self.Simulate();
	             });
	             
	             $("#jqxBottomControls_ButtonStopSimulation").jqxButton({ width: '150', disabled:true });	             
	             $("#jqxBottomControls_ButtonStopSimulation").on('click', function (event) {
	            	 self.stopSimulation();
	             });
	             
	             $('#jqxBottomControls_SliderTimeline').jqxSlider({ tooltip: true, mode: 'fixed', width:'400px', showTicks: false, max: 1000, showButtons: false, disabled:true });

	             $('#jqxBottomControls_SliderTimeline').on('slideStart', function (event) { 
	            	 _SimulationController.stopVisualization();
	             }); 	             
	             $('#jqxBottomControls_SliderTimeline').on('slideEnd', function (event) { 
	            	 self.updateSimulationFromTimeline();
	             }); 
	             
	             $("#jqxBottomControls_NumericInputStep").jqxNumberInput({ width: '100px', height: '25px', inputMode: 'simple'
	            	 								, spinButtons: true, decimalDigits: 0, min:0, disabled:true});
	             $('#jqxBottomControls_NumericInputStep').on('change', function (event) {
	            	 self.updateSimulationFromStep();
	             });
	             	             
	             $("#jqxBottomControls_ProgressBar").jqxProgressBar({ width: 275, height: 25, value: 0, showText:true});
	             
				$('#jqxWindow_LoadSimulation').jqxWindow({
				    showCollapseButton: true, maxHeight: 200, maxWidth: 350, minHeight: 100, minWidth: 275, height: 225, width: 275
				    ,'resizable': true, 'draggable': true, autoOpen: false,
				    initContent: function () 
				    {
			             $("#jqxConfWindow_ButtonSelectSimulationFiles").jqxButton({ width: '250'});
			             $("#jqxConfWindow_ButtonSelectSimulationFiles").on('click', function (event) {
			            	 self.loadLocalSimulation();
			             });

			             $("#jqxConfWindow_ButtonLoadSimulationFiles").jqxButton({ width: '250', disabled: true});
			             $("#jqxConfWindow_ButtonLoadSimulationFiles").on('click', function (event) {
			            	 self.loadLocalFiles();
			             });
			             
			             $("#jqxInputLocalFile").jqxInput({placeHolder: "Local neuron information file", height: 25, width: 250, minLength: 1, disabled: true});
			             $("#jqxInputGlobalFile").jqxInput({placeHolder: "Global scene information file", height: 25, width: 250, minLength: 1, disabled: true});
			             $("#jqxInputConnectivityFile").jqxInput({placeHolder: "Conectivity file", height: 25, width: 250, minLength: 1, disabled: true});
				    }
				});
	             
	             
	            //Window config
				$('#jqxWindow_Config').jqxWindow({
				    showCollapseButton: true, maxHeight: 1280, maxWidth: 1024, minHeight: 200, minWidth: 200, height: 450, width: 600
				    ,'resizable': true, 'draggable': true, autoOpen: false,
				    initContent: function () {
				        $('#jqxConfWindow_TabsConfig').jqxTabs({ height: '100%', width:  '100%' });
				        $('#jqxWindow_Config').jqxWindow('focus');
			            
			            //-->>Global configuration
						//Inhibitory color picker
		                $("#inhibitoryColorPicker").on('colorchange', function (event) 
		                									{
											                    $("#dropDownInhibitoryButton").jqxDropDownButton('setContent', self.getTextElementByColor(event.args.color));									                    
											                    _SigletonConfig.IColor = "#"+event.args.color.hex;									                    
											                });
		                $("#inhibitoryColorPicker").jqxColorPicker({ color: "0000FF", colorMode: 'hue', width: 220, height: 220});
		                $("#dropDownInhibitoryButton").jqxDropDownButton({ width: 150, height: 22});
		                $("#dropDownInhibitoryButton").jqxDropDownButton('setContent', self.getTextElementByColor(new $.jqx.color({ hex: "0000FF" })));				
										
						//Excitatory color picker
		                $("#excitatoryColorPicker").on('colorchange', function (event) 
		                									{
											                    $("#dropDownExcitatoryButton").jqxDropDownButton('setContent', self.getTextElementByColor(event.args.color));
											                    _SigletonConfig.EColor = "#"+event.args.color.hex;
											                });
		                $("#excitatoryColorPicker").jqxColorPicker({ color: "FF0000", colorMode: 'hue', width: 220, height: 220});
		                $("#dropDownExcitatoryButton").jqxDropDownButton({ width: 150, height: 22});
		                $("#dropDownExcitatoryButton").jqxDropDownButton('setContent', self.getTextElementByColor(new $.jqx.color({ hex: "FF0000" })));				
						
						//EE color picker
		                $("#EEColorPicker").on('colorchange', function (event) 
		                									{
											                    $("#dropDownEEButton").jqxDropDownButton('setContent', self.getTextElementByColor(event.args.color));
											                    _SigletonConfig.EEColor = "#"+event.args.color.hex;
											                });
		                $("#EEColorPicker").jqxColorPicker({ color: "FF0000", colorMode: 'hue', width: 220, height: 220});
		                $("#dropDownEEButton").jqxDropDownButton({ width: 150, height: 22});
		                $("#dropDownEEButton").jqxDropDownButton('setContent', self.getTextElementByColor(new $.jqx.color({ hex: "FF0000" })));				
		                
						//EI color picker
		                $("#EIColorPicker").on('colorchange', function (event) 
		                									{
											                    $("#dropDownEIButton").jqxDropDownButton('setContent', self.getTextElementByColor(event.args.color));
											                    _SigletonConfig.EIColor = "#"+event.args.color.hex;
											                });
		                $("#EIColorPicker").jqxColorPicker({ color: "FFA500", colorMode: 'hue', width: 220, height: 220});
		                $("#dropDownEIButton").jqxDropDownButton({ width: 150, height: 22});
		                $("#dropDownEIButton").jqxDropDownButton('setContent', self.getTextElementByColor(new $.jqx.color({ hex: "FFA500" })));				

		                //IE color picker
		                $("#IEColorPicker").on('colorchange', function (event) 
		                									{
											                    $("#dropDownIEButton").jqxDropDownButton('setContent', self.getTextElementByColor(event.args.color));
											                    _SigletonConfig.IEColor = "#"+event.args.color.hex;
											                });
		                $("#IEColorPicker").jqxColorPicker({ color: "8C00FF", colorMode: 'hue', width: 220, height: 220});
		                $("#dropDownIEButton").jqxDropDownButton({ width: 150, height: 22});
		                $("#dropDownIEButton").jqxDropDownButton('setContent', self.getTextElementByColor(new $.jqx.color({ hex: "8C00FF" })));				

		                //II color picker
		                $("#IIColorPicker").on('colorchange', function (event) 
		                									{
											                    $("#dropDownIIButton").jqxDropDownButton('setContent', self.getTextElementByColor(event.args.color));
											                    _SigletonConfig.IIColor = "#"+event.args.color.hex;
											                });
		                $("#IIColorPicker").jqxColorPicker({ color: "0000FF", colorMode: 'hue', width: 220, height: 220});
		                $("#dropDownIIButton").jqxDropDownButton({ width: 150, height: 22});
		                $("#dropDownIIButton").jqxDropDownButton('setContent', self.getTextElementByColor(new $.jqx.color({ hex: "0000FF" })));				
		                
		                //Ca min value color picker
		                $("#CaMinValueColorColorPicker").on('colorchange', function (event) 
		                									{
											                    $("#dropDownCaMinValueColorButton").jqxDropDownButton('setContent', self.getTextElementByColor(event.args.color));
											                    _SigletonConfig.minCaColor = "#"+event.args.color.hex;
											                });
		                $("#CaMinValueColorColorPicker").jqxColorPicker({ color: "0000FF", colorMode: 'hue', width: 220, height: 220});
		                $("#dropDownCaMinValueColorButton").jqxDropDownButton({ width: 150, height: 22});
		                $("#dropDownCaMinValueColorButton").jqxDropDownButton('setContent', self.getTextElementByColor(new $.jqx.color({ hex: "0000FF" })));				
		                
		                //Ca max value color picker
		                $("#CaMaxValueColorColorPicker").on('colorchange', function (event) 
		                									{
											                    $("#dropDownCaMaxValueColorButton").jqxDropDownButton('setContent', self.getTextElementByColor(event.args.color));
											                    _SigletonConfig.maxCaColor = "#"+event.args.color.hex;
											                });
		                $("#CaMaxValueColorColorPicker").jqxColorPicker({ color: "FF0000", colorMode: 'hue', width: 220, height: 220});
		                $("#dropDownCaMaxValueColorButton").jqxDropDownButton({ width: 150, height: 22});
		                $("#dropDownCaMaxValueColorButton").jqxDropDownButton('setContent', self.getTextElementByColor(new $.jqx.color({ hex: "FF0000" })));				

			            $('#jqxMacroVControls_SliderApha').jqxSlider({ tooltip: true, mode: 'fixed', width:'200px', showTicks: false, max: 1, showButtons: false, step: 0.01 });
			            $('#jqxMacroVControls_SliderApha').on('slideEnd', function (event) { 
			            	 _SigletonConfig.macroVAlpha = event.args.value;
			             });

			            
			            
			            $("#jqxRadioButtonCaSetPointFromFile").jqxRadioButton({groupName: '1', width: 250, height: 25, checked: true });			            
			            $("#jqxRadioButtonCaSetPointFromNeuronValues").jqxRadioButton({groupName: '1', width: 250, height: 25});
			            $("#jqxRadioButtonHSLColorInterpol").jqxRadioButton({groupName: '2', width: 250, height: 25, checked: true });			            
			            $("#jqxRadioButtonRGBColorInterpol").jqxRadioButton({groupName: '2', width: 250, height: 25});

			            $("#jqxRadioButtonCaSetPointFromFile").on('change', function (event) {
			                var checked = event.args.checked;
			                if (checked) 
			                {
			                	_SigletonConfig.CaMaxMinValueTypes=0;
			                }
			            });			            

			            $("#jqxRadioButtonCaSetPointFromNeuronValues").on('change', function (event) {
			                var checked = event.args.checked;
			                if (checked) 
			                {
			                	_SigletonConfig.CaMaxMinValueTypes=1;
			                }
			            });			            			           
			            
			            $("#jqxRadioButtonHSLColorInterpol").on('change', function (event) {
			                var checked = event.args.checked;
			                if (checked) 
			                {
			                	_SigletonConfig.ColorInerpolMethod="HSL";
			                }
			            });			            

			            $("#jqxRadioButtonRGBColorInterpol").on('change', function (event) {
			                var checked = event.args.checked;
			                if (checked) 
			                {
			                	_SigletonConfig.ColorInerpolMethod="RGB";
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
				        
			            $("#dropDownCaInterpolMethodButton").jqxComboBox({ source: lCaInterpolMethods, selectedIndex: 0, width: '100px', height: '25', disabled:"true"});
			            
				        var lSEViewrSelector= [
						                      "All",
						                      "Vacants only",
						                      "Connected only",
						                      ];
				        
			            $("#dropDownSynapticElementsToViewButton").jqxComboBox({ source: lSEViewrSelector, selectedIndex: 0, width: '150px', height: '25'});
			            $("#dropDownSynapticElementsToViewButton").on("change",function (event)
			            														{
			            															_SigletonConfig.SEViewSelector = event.args.index;			            															
			            														});
			            
			            
			            $("#jqxNumericInput_SimulationVelocity").jqxNumberInput({ width: '100px', height: '25px', inputMode: 'simple'
								,spinButtons: true, decimalDigits: 0, min:0, });
			            $('#jqxNumericInput_SimulationVelocity').val(200);
			            $('#jqxNumericInput_SimulationVelocity').on('change', function (event) {
			            	_SimulationController.setVisualizationInterval($('#jqxNumericInput_SimulationVelocity').val());
			            });
			            
			            //-->>Global View controls
			            $("#jqxRadioButtonGlobalVBarrs").jqxRadioButton({ width: 250, height: 25, checked: true});
			            $("#jqxRadioButtonGlobalVFuncts").jqxRadioButton({ width: 250, height: 25});
			            
				        //-->>MacroView controls
				        $("#jqxCheckBox_EEConnect").jqxCheckBox({ width: 120, height: 25, checked: true});
			            $("#jqxCheckBox_EEConnect").on('change', function (event) {
			            	_SimulationData.drawEEConn = event.args.checked;			            		
			            });				        
				        
				        $("#jqxCheckBox_EIConnect").jqxCheckBox({ width: 120, height: 25, checked: true});
			            $("#jqxCheckBox_EIConnect").on('change', function (event) {
			            	_SimulationData.drawEIConn = event.args.checked;			            		
			            });				        
				        
				        $("#jqxCheckBox_IEConnect").jqxCheckBox({ width: 120, height: 25, checked: true});
			            $("#jqxCheckBox_IEConnect").on('change', function (event) {
			            	_SimulationData.drawIEConn = event.args.checked;			            		
			            });				        
				        
				        $("#jqxCheckBox_IIConnect").jqxCheckBox({ width: 120, height: 25, checked: true});
			            $("#jqxCheckBox_IIConnect").on('change', function (event) {
			            	_SimulationData.drawIIConn = event.args.checked;			            		
			            });
			            
			             $("#jqxConfWindow_ButtonUpdateView").jqxButton({ width: '150'});	             
			             $("#jqxConfWindow_ButtonUpdateView").on('click', function (event) {
			            	 
			            	 _SimulationData.recalculateScales(_SigletonConfig.minCaColor
			            			 									,_SigletonConfig.maxCaColor
			            			 									,_SigletonConfig.ColorInerpolMethod);
			            	 
			            	 //Recalc scales for the cheeses, only in MicroView
			            	 if (_SimulationController.view.MSPViewType=="MicroV")
			            		 _SimulationController.view.reclculateSEScales();
			            	 
			            	 self.updateSimulationFromTimeline();
			             });			            
				    }
				});
	            
				$('#jqxWindow_ImgExporter').jqxWindow({
				    showCollapseButton: true, maxHeight: 1280, maxWidth: 1024, minHeight: 200, minWidth: 200, height: 480, width: 700
				    ,'resizable': true, 'draggable': true, autoOpen: false,
				    initContent: function () 
				    {
				    }
				});

				$('#jqxWindow_Info').jqxWindow({
				    showCollapseButton: true, maxHeight: 1280, maxWidth: 1024, minHeight: 200, minWidth: 200, height: 480, width: 700
				    ,'resizable': true, 'draggable': true, autoOpen: false,
				    initContent: function () 
				    {
				        $('#jqxAbout_TabsConfig').jqxTabs({ height: '100%', width:  '100%' });

				    }
				});

                //Generate the initial canvas
                self.generateCanvas("MSPViz");
			}
		);
	}
	
	,getTextElementByColor: function (color) 
	{
        if (color == 'transparent' || color.hex == "") {
            return $("<div style='text-shadow: none; position: relative; padding-bottom: 2px; margin-top: 2px;'>transparent</div>");
        }
        var element = $("<div style='text-shadow: none; position: relative; padding-bottom: 2px; margin-top: 2px;'>#" + color.hex + "</div>");
        element.css('background', "#" + color.hex);
        element.addClass('jqx-rc-all');
        return element;
    }


	,generateCanvas: function (pMssg)
	{
		if (_SigletonConfig.svg!=null )
		{
			d3.select("svg")
				.remove();
		}	
		
		_SigletonConfig.svg = d3.select("#renderArea")
								.append("svg:svg")
								.text ("Text de texto")
								.attr("width", _SigletonConfig.width)
								.attr("height", _SigletonConfig.height)
								.attr("style", "outline: thin solid black;")								
								;

		var lScale = 5;
		var lText = "MSPViz";
		
		if (pMssg!=undefined) lText = pMssg;
		
		_SigletonConfig.svg.append("text")         			// append text
					    .style("fill", "black")   			// fill the text with the colour black
					    .attr("x", _SigletonConfig.width/2) // set x position of left side of text
					    .attr("y", _SigletonConfig.height/2)// set y position of bottom of text
					    .attr("dy", ".35em")           		// set offset y position
					    .attr("text-anchor", "middle") 		// set anchor y justification
					    .style("font-size","68px")
					    .text(lText);          				// define the text to display		
	}
	
	,generateView: function (pViewId)
	{	
		if (_SimulationController!=null)
		{
			switch (pViewId) 
			{
				case 0:
						if (this.activeView!=null) delete this.activeView;
						this.activeView=null;
						this.activeView = new MSP.GlobalConnectionsView();
						this.activeView.generateGlobalConnectionsView();
				break;			
				case 1:	
						if (this.activeView!=null) delete this.activeView;				
						this.activeView	= null;
						this.activeView = new MSP.MacroscopicView();
						this.activeView.generateMacroscopicView();					
					break;
				case 2:
						//Constraint
						if (_SigletonConfig.gSelectionIds.length>0)
						{
							if (this.activeView!=null) delete this.activeView;
							this.activeView	=null;
							this.activeView = new MSP.MicroscopicView();
							this.activeView.generateMicroscopicView();												
						}
						else
						{
							window.alert("Please, select some neurons in Macroscopic View");
						}
					break;
				case 3:
						if (_SigletonConfig.neuronSelected !=-1)					
						{
							if (this.activeView!=null) delete this.activeView;
							this.activeView=null;
							this.activeView = new MSP.DetailMicroscopicView();
							this.activeView.generateDetailMicroscopicView();												
						}
						else
						{
							window.alert("Please, select one neuron in Microscopic View");						
						}
					break;					
				default:
					break;
			}

			_SimulationController.setView(this.activeView);
			_SimulationController.concreteSimulationStep(_SimulationController.actSimStep);					
		}
		else
		{
			window.alert("Please, load simulation files first.");
		}
	},
	
	
	showPreferences: function ()
	{
		$('#jqxWindow_Config').jqxWindow('open');		
	}

	,showInfo: function ()
	{
		$('#jqxWindow_Info').jqxWindow('open');		
	}
	
	,showLoadSimulation: function()
	{
		$('#jqxWindow_LoadSimulation').jqxWindow('open');		
	}
	
	,updateSimulationFromTimeline: function  ()
	{		
		var lValue = $('#jqxBottomControls_SliderTimeline').jqxSlider('val');			
		$('#jqxBottomControls_NumericInputStep').val(lValue);
		
		_SimulationController.actSimStep = lValue; 
		_SimulationController.concreteSimulationStep(_SimulationController.actSimStep);
	}
	
	,updateSimulationFromStep: function ()
	{		
		var lValue = $('#jqxBottomControls_NumericInputStep').jqxNumberInput('val');			
		$('#jqxBottomControls_SliderTimeline').val(lValue);
		
		_SimulationController.actSimStep = lValue; 
		_SimulationController.concreteSimulationStep(_SimulationController.actSimStep);		
	}
	
	,changeTheme: function ()
	{
		_SigletonConfig.theme="custom";
		
		$("#jqxMenu").jqxMenu({ theme: globalTheme});
	}
	
	,loadLocalSimulation: function()
	{
		$("#fileDialog").click();
		//this.loadLocalFiles();
	}

	,loadLocalFiles: function()
	{
//		//console.log("Entrnado en loadLocalFiles");
//	    var files = document.getElementById('fileDialog').files;
//		//var files = this.simulationFiles;
//	    
//	    var lOrderOfFiles = ["LocalNeuronInformation.json", "GlobalSimulationParams.json","Connectivity.json"];
//	    var lOrederedFiles=[];
//	    
//	    if ( (!files.length) || (files.length!=3) )
//	    {
//	      alert('Please select the 3 simulation files: ... !');
//	    }
//	    else 
//	    {
//	    	for (var i=0;i<3;++i)
//	    		for (var j=0;j<3;++j)
//	    			if (escape(files[j].name)==lOrderOfFiles[i])
//	    				lOrederedFiles.push(files[j]);
//	    }
//	    
//	    return lOrederedFiles;
	    var self = this;
	    
		if (self.simulationFiles.length==3)
		{
			this.generateCanvas("Loading simulation ...");
			
			if (_SimulationData!=null) 	delete _SimulationData;
			_SimulationData 	= 		new MSP.SimulationData();					

			_SimulationData.LoadLocalSimulation(self.simulationFiles);
			
			if (_SimulationController 	!= null)	delete _SimulationController;
			_SimulationController 		= new 		MSP.SimulationController();
			
			_SigletonConfig.recalculatePosScales();			
		}
		else
		{
			alert ("Please, select the LocalNeuronInformation.json, GlobalSimulationParams.json and the Connectivity.json");			
		}	    
	}
	
	,loadRemoteSimulation: function()
	{
		this.generateCanvas("Loading remote simulation ...");
		
		if (_SimulationData!=null) 	delete _SimulationData;
		_SimulationData = 	new MSP.SimulationData();					

		//_SimulationData.LoadRemoteSimulation("https://...", "user", "passwd");
		
		if (_SimulationController != null)	delete _SimulationController;
		_SimulationController = new MSP.SimulationController();
		
		_SigletonConfig.recalculatePosScales();		
	}
	
	
	,resetSimulation: function()
	{
		this.generateCanvas("MSPViz");
		
		if (_SimulationData!=null) 			delete _SimulationData;
		if (_SimulationController != null)	delete _SimulationController;
		if (this.activeView!=null)			delete this.activeView;
		
		_SimulationData 		= null;
		_SimulationController 	= null;
		this.activeView 		= null;
				
		$("#jqxBottomControls_ButtonSimulate").jqxButton({ disabled: true });
		$("#jqxBottomControls_ButtonStopSimulation").jqxButton({ disabled: true });
		$('#jqxBottomControls_SliderTimeline').jqxSlider({ disabled: true });
		$("#jqxBottomControls_NumericInputStep").jqxNumberInput({ disabled: true });		
	}
	
	
	,Simulate: function ()
	{
		if (_SimulationController!=null)
			_SimulationController.startVisualization();
	}
	
	,stopSimulation: function ()
	{
		if (_SimulationController!=null)
			_SimulationController.stopVisualization();
	}

	,disableUI: function (pVal)
	{
		$("#jqxMenu").jqxMenu({ disabled: pVal });
		$("#jqxBottomControls_ButtonSimulate").jqxButton({ disabled: pVal });
		$("#jqxBottomControls_ButtonStopSimulation").jqxButton({ disabled: pVal });
		$('#jqxBottomControls_SliderTimeline').jqxSlider({ disabled: pVal });
		$("#jqxBottomControls_NumericInputStep").jqxNumberInput({ disabled: pVal });
		
		if (!pVal)
		{
			this.generateView(0);
		}
		
	}
	
	,saveImageToSVG: function ()
	{
		$('#jqxWindow_ImgExporter').jqxWindow('open');
		saveAsImage();	
	}	
};

//Generate the interface
_gVisualizatorUI = new UI.Visualizator();
