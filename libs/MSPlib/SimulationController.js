 /**
 * @brief
 * @author  Juan Pedro Brito Mendez <juanpebm@gmail.com>
 * @date
 * @remarks Do not distribute without further notice.
 */

MSP.SimulationController = function ()
{
	this.actSimStep		= 	1;	
	this.UpdateVelocity	=	200;	

	this.pause			=	true;	
	this.myTimer		=	null;

	this.view			=	null;
		
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
		this.actSimStep++;

		//If the visualization finish?
		if (this.actSimStep == _SimulationData.steps.length)
			this.stopVisualization();
		else
		{
			this.view.updateVisualization();
			this.updateUI();
		}
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
			this.myTimer = setInterval(function() 
			{
				self.updateVisualizationForward();				
			},this.UpdateVelocity);
		};
	}

	,stopVisualization: function () 
	{
		this.pause = true;
		clearTimeout(this.myTimer);
	}	
	
	,concreteSimulationStep: function (pKey) 
	{
		this.pause = true;
		clearTimeout(this.myTimer);
	
		this.actSimStep = pKey;
		this.view.updateVisualization();
		this.updateUI();
	}
	,updateUI: function()
	{				
		$('#jqxBottomControls_SliderTimeline').jqxSlider('setValue', this.actSimStep);
		$("#jqxBottomControls_NumericInputStep").jqxNumberInput('val', this.actSimStep);				
	}
};
