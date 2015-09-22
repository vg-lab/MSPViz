 /**
 * @brief
 * @author  Juan Pedro Brito Mendez <juanpebm@gmail.com>
 * @date
 * @remarks Do not distribute without further notice.
 */


MSP.SimulationData = function()
{
	this.steps				=	0;
	this.timeInterval 		=	0;
	
	//Extreme calciums values
	this.maxCalciumEValue	=	0;
	this.minCalciumEValue	=	0;
	this.maxCalciumIValue	=	0;
	this.minCalciumIValue	=	0;
	this.maxCalciumTValue	=	0;
	this.minCalciumTValue	=	0;

	//Extreme calciums values from File
	this.maxFileCalciumEValue	=	0;
	this.minFileCalciumEValue	=	0;
	this.maxFileCalciumIValue	=	0;
	this.minFileCalciumIValue	=	0;
	this.maxFileCalciumTValue	=	0;
	this.minFileCalciumTValue	=	0;
	
	//Extreme values of global connections
	this.maxTEConn	=	0;
	this.minTIConn	=	0;
	this.maxEEConn	=	0;
	this.minEIConn	=	0;
	this.maxIEConn	=	0;
	this.minIIConn	=	0;

	//Number of global connections
	this.TEConn	=	[];
	this.TIConn	= 	[];
	this.EEConn	= 	[];
	this.EIConn	= 	[];
	this.IEConn	= 	[];
	this.IIConn	= 	[];
	
	this.gNeurons		=	[];
	this.gNeuronsRep	=	[];	
	this.gConnectivity	= 	[];
	
	this.drawEEConn = true;
	this.drawEIConn = true;
	this.drawIEConn = true;
	this.drawIIConn = true;
	
	/* Global Vars */			
	this.DefaultLocalNeuronInformationFile	="LocalNeuronInformation.json";
	this.DefaultGlobalSimulationParamsFile	="GlobalSimulationParams.json";
	this.DefaultConnectivityFile			="Connectivity.json";
	
	this.gLocalNeuronInformationFile	="";
	this.gGlobalSimulationParamsFile	="";
	this.gConnectivityFile				="";
	
	this.CaIScale=null;
	this.CaEScale=null;
};

//Methods
MSP.SimulationData.prototype = 
{	
	constructor: MSP.SimulationData
	
	,calculateMaxMinValues: function ()
	{
		this.maxTEConn=Math.max.apply(Math, this.TEConn);
		this.minTEConn=Math.min.apply(Math, this.TEConn);
		
		this.maxTIConn=Math.max.apply(Math, this.TIConn);
		this.minTIConn=Math.min.apply(Math, this.TIConn);
	
		this.maxEEConn=Math.max.apply(Math, this.EEConn);
		this.minEEConn=Math.min.apply(Math, this.EEConn);
		
		this.maxEIConn=Math.max.apply(Math, this.EIConn);
		this.minEIConn=Math.min.apply(Math, this.EIConn);
	
		this.maxIEConn=Math.max.apply(Math, this.IEConn);
		this.minIEConn=Math.min.apply(Math, this.IEConn);
		
		this.maxIIConn=Math.max.apply(Math, this.IIConn);
		this.minIIConn=Math.min.apply(Math, this.IIConn);
	},

	LoadRemoteSimulation: function (pathToFiles, pUser, pPass)
	{		
	},
	
	
	LoadLocalSimulation: function (pathToFiles)
	{
		var self = this;

		var lProgres=1;
		$("#jqxBottomControls_ProgressBar").jqxProgressBar({ value: lProgres });
		
		_gVisualizatorUI.disableUI(true);

	    var readerLocalNeuronInformation 		= new FileReader();
	    readerLocalNeuronInformation.onloadend 	= function(evt) 
	    {
	    	self.gNeurons = JSON.parse( readerLocalNeuronInformation.result );			

//	    	//Max-Min Ca values from file
//			if (_SigletonConfig.CaMaxMinValueTypes==0)
//			{
//				self.minECalciumValue = 0;
//				self.minICalciumValue = 0;
//				self.maxECalciumValue = 0;
//				self.maxICalciumValue = 0;
//				
//				for(var i=0;i<self.gNeurons.length;++i) 
//				{
//					if (self.gNeurons[i].NAct=="E")
//					{
//						if (self.maxECalciumValue<self.gNeurons[i].SetPoint)
//							self.maxECalciumValue=self.gNeurons[i].SetPoint;
//					}
//					else
//					{
//						if (self.maxICalciumValue<self.gNeurons[i].SetPoint)
//							self.maxICalciumValue=self.gNeurons[i].SetPoint;						
//					}
//				}
//				
//				//#### Nyapa!!! Se pued ehacer en el bucle anterior, but theri is no time
//				for(var i=0;i<self.gNeurons.length;++i) 
//				{
//					if (self.gNeurons[i].NAct=="E")
//					{
//						if (self.maxECalciumValue!=self.gNeurons[i].SetPoint)
//							window.alert("Different setPoint Ca values in setPoint files for E Neuron");
//					}
//					else
//					{
//						if (self.maxICalciumValue!=self.gNeurons[i].SetPoint)
//							window.alert("Different setPoint Ca values in setPoint files for I Neuron");
//					}
//				}
//				
//			}
	    	
	    	lProgres+=33;
	    	$("#jqxBottomControls_ProgressBar").jqxProgressBar({ value: lProgres });
	    	
		    var readerGlobalSimulationParams 		= new FileReader();
		    readerGlobalSimulationParams.onloadend 	= function(event) 
		    {
		    	jsonGlobalNData = JSON.parse( readerGlobalSimulationParams.result );
		    	lProgres+=33;
		    	$("#jqxBottomControls_ProgressBar").jqxProgressBar({ value: lProgres });

				//Load global params
				self.steps = jsonGlobalNData.simSteps;
				self.TEConn = jsonGlobalNData.TEConn;
				self.TIConn = jsonGlobalNData.TIConn;
				self.EEConn = jsonGlobalNData.EEConn;
				self.EIConn = jsonGlobalNData.EIConn;
				self.IEConn = jsonGlobalNData.IEConn;
				self.IIConn = jsonGlobalNData.IIConn;
                
				//###Calculated from file, but no setpoint file
				self.maxFileECalciumValue = jsonGlobalNData.maxECalciumValue;
				self.minFileECalciumValue = jsonGlobalNData.minECalciumValue;
				self.maxFileICalciumValue = jsonGlobalNData.maxICalciumValue;
				self.minFileICalciumValue = jsonGlobalNData.minICalciumValue;
				
				//Global calcium values
				self.minCalciumValue = jsonGlobalNData.minCalciumValue;
				self.maxCalciumValue = jsonGlobalNData.maxCalciumValue;
                
//				if (_SigletonConfig.CaMaxMinValueTypes==1)
//				{
//					self.maxECalciumValue = jsonGlobalNData.maxECalciumValue;
//					self.minECalciumValue = jsonGlobalNData.minECalciumValue;
//					self.maxICalciumValue = jsonGlobalNData.maxICalciumValue;
//					self.minICalciumValue = jsonGlobalNData.minICalciumValue;
//				}
				
				//Calculate max and min values
				self.calculateMaxMinValues();
				
				//Calculate the scales
				self.recalculateScales(_SigletonConfig.minCaColor
										,_SigletonConfig.maxCaColor
	 									,_SigletonConfig.ColorInerpolMethod);
				
				//Recalculate positions
				self.recalculatePositions();		    	
		    };		    
		    var blobGlobalSimulationParams = pathToFiles[1];
		    readerGlobalSimulationParams.readAsText(blobGlobalSimulationParams,"utf-8");
		    
		    var readerConnectivity 			= new FileReader();
		    readerConnectivity.onloadend 	= function(evt) 
		    {
		    	self.gConnectivity = JSON.parse( readerConnectivity.result );
		    	lProgres+=33;
		    	$("#jqxBottomControls_ProgressBar").jqxProgressBar({ value: lProgres });

				//Reactivate the UI
				_gVisualizatorUI.disableUI(false);	    	
		    	
		    };	    
		    var blobConnectivity = pathToFiles[2];
		    readerConnectivity.readAsText(blobConnectivity,"utf-8");		
	    	
	    };	    
	    var blobLocalNeuronInformation = pathToFiles[0];
	    readerLocalNeuronInformation.readAsText(blobLocalNeuronInformation,"utf-8");		
	},
	
	recalculateScales: function (pColorMin, pColorMax, pColorType)
	{
		var self = this;
		
    	//Max-Min Ca values from file
		if (_SigletonConfig.CaMaxMinValueTypes==0)
		{
			console.log("Ca. from set points");
			
			self.minECalciumValue = 0;
			self.minICalciumValue = 0;
			self.maxECalciumValue = 0;
			self.maxICalciumValue = 0;
			
			for(var i=0;i<self.gNeurons.length;++i) 
			{
				if (self.gNeurons[i].NAct=="E")
				{
					if (self.maxECalciumValue<self.gNeurons[i].SetPoint)
						self.maxECalciumValue=self.gNeurons[i].SetPoint;
				}
				else
				{
					if (self.maxICalciumValue<self.gNeurons[i].SetPoint)
						self.maxICalciumValue=self.gNeurons[i].SetPoint;						
				}
			}
			
			//#### Nyapa!!! Se pued ehacer en el bucle anterior, but theri is no time
			for(var i=0;i<self.gNeurons.length;++i) 
			{
				if (self.gNeurons[i].NAct=="E")
				{
					if (self.maxECalciumValue!=self.gNeurons[i].SetPoint)
						window.alert("Different setPoint Ca values in setPoint files for E Neuron");
				}
				else
				{
					if (self.maxICalciumValue!=self.gNeurons[i].SetPoint)
						window.alert("Different setPoint Ca values in setPoint files for I Neuron");
				}
			}
			
		}
		else
		{
			console.log("Ca. from Neuron values");
			self.maxECalciumValue = self.maxFileECalciumValue;
			self.minECalciumValue = self.minFileECalciumValue;
			self.maxICalciumValue = self.maxFileICalciumValue;
			self.minICalciumValue = self.minFileICalciumValue;
		}
		
		console.log("self.maxECalciumValue: "+self.maxECalciumValue);
		console.log("self.minECalciumValue: "+self.minECalciumValue);
		console.log("self.maxICalciumValue: "+self.maxICalciumValue);
		console.log("self.minICalciumValue: "+self.minICalciumValue);
		
		if (pColorType	==	"HSL")
		{
			//Calculate range
			var lActColor;
			var lHSLColorRange = [];

			var lIncrements = [];
			var lNumIncs 	= 5.0;
						
			var lColorMin = new KolorWheel(pColorMin);
			var lColorMax = new KolorWheel(pColorMax);
			
			var lhInc = (lColorMax.h - lColorMin.h)/lNumIncs;
			var lsInc = (lColorMax.s - lColorMin.s)/lNumIncs;
			var llInc = (lColorMax.l - lColorMin.l)/lNumIncs;

			//Inhibitory
			var lIInc = (this.maxICalciumValue - this.minICalciumValue)/lNumIncs;
			for (var i=0;i<lNumIncs;++i)	lIncrements.push(this.minICalciumValue + i*lIInc);			
			for (var n = 0; n < lNumIncs; n++) 
			{
				lActColor = new KolorWheel([lColorMin.h + n*(lhInc)
				                            ,lColorMin.s + n*(lsInc)
				                            ,lColorMin.l + n*(llInc)
				                            ]);
				lHSLColorRange.push(lActColor.getHex());
			}
			
			this.CaIScale = d3.scale
							.linear()
							.domain(lIncrements)
							.range(lHSLColorRange)
							.interpolate(d3.interpolateHsl)
							;
			//Excitatory
			var lEInc = (this.maxECalciumValue - this.minECalciumValue)/lNumIncs;
			lIncrements = [];
			lHSLColorRange = [];
			for (var i=0;i<lNumIncs;++i)	lIncrements.push(this.minECalciumValue + i*lEInc);
			for (var n = 0; n < lNumIncs; n++) 
			{
				lActColor = new KolorWheel([lColorMin.h + n*(lhInc)
				                            ,lColorMin.s + n*(lsInc)
				                            ,lColorMin.l + n*(llInc)
				                            ]);
				lHSLColorRange.push(lActColor.getHex());
			}
			
			this.CaEScale = d3.scale
								.linear()
								.domain(lIncrements)
								.range(lHSLColorRange)
								.interpolate(d3.interpolateHsl)
								;
			
			delete lColorMin;
			delete lColorMax;
		}
		//lineal
		if (pColorType	==	"RGB")
		{
			this.CaIScale =	d3.scale
								.linear()
								.domain([ this.minICalciumValue,this.maxICalciumValue ])
								.range([pColorMin, pColorMax])
								.interpolate(d3.interpolateRgb)								
								;	

			this.CaEScale =	d3.scale
								.linear()
								.domain([ this.minECalciumValue,this.maxECalciumValue ])
								.range([pColorMin, pColorMax])
			    				.interpolate(d3.interpolateRgb)			    				
			    				;	
		}		
	}
	
	,recalculatePositions: function()
	{
		//Recalculate positions
		var lNewXPos = 0;
		var lNewYPos = 0;
		var self = this;
		
		for (var i=0;i<_SimulationData.gNeurons.length;++i)
		{
			lNewXPos = _SigletonConfig.xScale(self.gNeurons[i].PosX);
			lNewYPos = _SigletonConfig.yScale(self.gNeurons[i].PosY);

			self.gNeurons[i].PosX = lNewXPos;
			self.gNeurons[i].PosY = lNewYPos;
		}
	}	
};

