 /**
 * @brief
 * @author  Juan Pedro Brito Mendez <juanpebm@gmail.com>
 * @date
 * @remarks Do not distribute without further notice.
 */

MSP.SimulationController = function ()
{
	this.actSimStep		= 	0;	
	this.UpdateVelocity	=	200;	

	this.pause			=	true;	
	this.myTimer		=	null;

	this.view			=	null;
	this.critialMoment = 	0;
    this.activeViewID = -1;
};

//Methods
MSP.SimulationController.prototype = 
{	
	constructor: MSP.SimulationController
	
	,setView: function (pView)
	{
		this.view	=	pView;
	}
	
	,updateVisualizationForward: function () 
	{
		//If the visualization finish?
		if (this.actSimStep == _SimulationData.steps.length)
			this.stopVisualization();
		else
		{
			//###No es necesartio hacerlo siempre, hacerlo solo en los cambios
			var lCritialMoment=((_SimulationData.actFile+1)*_SimulationData.numSimStepsPerFile);

			var lLastCriticalMoment=_SimulationData.totalSimulationSteps-_SimulationData.bufferSimulationSteps;
						
			//Preload
			if ( ((this.actSimStep + _SimulationData.bufferSimulationSteps)==lCritialMoment)
				&& (lLastCriticalMoment!=this.actSimStep)
				)
			{
				switch(_SimulationData.actualSimulationLoadType) 
				{
					case _SimulationData.SimulationLoadType[0]:
						//_SimulationData.LoadServerSimulationDataFiles(_SimulationData.actFile+1);
						console.log("Unable to load simulation files from local disk");
						break;
					case _SimulationData.SimulationLoadType[1]:
						_SimulationData.LoadServerSimulationDataFiles(_SimulationData.actFile+1);
						break;
					case _SimulationData.SimulationLoadType[2]:
						_SimulationData.LoadWebDavSimulationDataFiles(_SimulationData.actFile+1);
						break;
				}
				
			}		
			
			//Swap buffers
			if ( (this.actSimStep==lCritialMoment)
				&& (lLastCriticalMoment!=this.actSimStep)
				)
			{				
				_SimulationData.swapSimulationInfo();
			}
			_SimulationFilter.filter();
			this.view.updateVisualization();
			this.updateUI();
		}
		this.actSimStep++;
	}
			
	,updateVisualizationBackward: function() 
	{
		this.actSimStep--;
		if (this.actSimStep<0) this.actSimStep=0;
		this.view.updateVisualization();
		this.updateUI();
	}

	,setVisualizationInterval: function (pInterval) 
	{
		var self = this;
		self.stopVisualization();
		self.UpdateVelocity	= pInterval;
	}
	
	
	,startVisualization: function () 
	{		
		if (this.pause) 
		{
			this.pause = false;
			
			var self = this;
            $('#jqxBottomControls_ButtonSimulate').val('Stop Simulation');
			this.myTimer = setInterval(function()
			{
				self.updateVisualizationForward();
			},this.UpdateVelocity);
		}
	}

	,stopVisualization: function () 
	{
		this.pause = true;
        $('#jqxBottomControls_ButtonSimulate').val('Simulate');
		clearTimeout(this.myTimer);
	}	
	
	,concreteSimulationStep: function (pKey) 
	{
        this.stopVisualization();

		console.log("Entrando en slider change");

		var lDataReloaded=false;
		
		this.actSimStep = pKey;
		
		var lLastCriticalMoment=_SimulationData.totalSimulationSteps-_SimulationData.bufferSimulationSteps;
		
		//Logica para saber que ficheros es necesario recargar.
		var lSimFileId=Math.floor(this.actSimStep/_SimulationData.numSimStepsPerFile);
		
		//console.log("actSimStep: "+this.actSimStep);
		
		//Different interval values
		if (lSimFileId!=_SimulationData.actFile)
		{
			console.log("Entrando en carga inmediata");

			switch(_SimulationData.actualSimulationLoadType) 
			{		
				case _SimulationData.SimulationLoadType[0]:
					//_SimulationData.LoadServerSimulationDataFiles(_SimulationData.actFile+1);
					console.log("Unable to load simulation files from local disk");
					break;
				case _SimulationData.SimulationLoadType[1]:
					_SimulationData.loadRemoteSimulationFromServerInmediatly(lSimFileId);
					break;
				case _SimulationData.SimulationLoadType[2]:
					_SimulationData.loadSimulationFromWebDavInmediatly(lSimFileId);
					break;
			}
			
			//_SimulationData.loadRemoteSimulationFromServerInmediatly(lSimFileId);
			_SimulationData.actFile=lSimFileId;
			
			//and in critical load region
			//#### Para evitar cargar en la ultima region critica (que no hay ficheros)
			//#### extraer en python el numero total de ficheros d ela simulacion y comprobar aki que no estas en el ultimo.
			var lCritialMoment=((_SimulationData.actFile+1)*_SimulationData.numSimStepsPerFile);
			if ( ((this.actSimStep + _SimulationData.bufferSimulationSteps)>=lCritialMoment)
				&& (this.actSimStep<lLastCriticalMoment)
				)
			{
				console.log("Entrando en carga adelantada A");
				switch(_SimulationData.actualSimulationLoadType) 
				{		
					case _SimulationData.SimulationLoadType[0]:
						//_SimulationData.LoadServerSimulationDataFiles(_SimulationData.actFile+1);
						console.log("Unable to load simulation files from local disk");
						break;
					case _SimulationData.SimulationLoadType[1]:
						_SimulationData.LoadServerSimulationDataFiles(lSimFileId+1);
						break;
					case _SimulationData.SimulationLoadType[2]:
						_SimulationData.LoadWebDavSimulationDataFiles(lSimFileId+1);
						break;
				}
				
				//_SimulationData.LoadServerSimulationDataFiles(lSimFileId+1, false);
			}				
		}
		else
		{
			//Same interval but critical load region
			var lCritialMoment=((_SimulationData.actFile+1)*_SimulationData.numSimStepsPerFile);
			if (((this.actSimStep + _SimulationData.bufferSimulationSteps)>=lCritialMoment)
					&& (this.actSimStep<lLastCriticalMoment)
				)					
			{
				console.log("Entrando en carga adelantada B");
				
				switch(_SimulationData.actualSimulationLoadType) 
				{		
					case _SimulationData.SimulationLoadType[0]:
						//_SimulationData.LoadServerSimulationDataFiles(_SimulationData.actFile+1);
						console.log("Unable to load simulation files from local disk");
						break;
					case _SimulationData.SimulationLoadType[1]:
						_SimulationData.LoadServerSimulationDataFiles(lSimFileId+1);
						break;
					case _SimulationData.SimulationLoadType[2]:
						_SimulationData.LoadWebDavSimulationDataFiles(lSimFileId+1);
						break;
				}
				
				//_SimulationData.LoadServerSimulationDataFiles(lSimFileId+1, false);
			}								
		}

        _SimulationFilter.filter();

		if (!lDataReloaded) this.view.updateVisualization();
		this.updateUI();
	}
	,updateUI: function()
	{				
		$('#jqxBottomControls_SliderTimeline').jqxSlider('setValue', this.actSimStep);
		$("#jqxBottomControls_NumericInputStep").jqxNumberInput('val', this.actSimStep);				
	}
};
