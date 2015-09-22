 /**
 * @brief
 * @author  Juan Pedro Brito Mendez <juanpebm@gmail.com>
 * @date
 * @remarks Do not distribute without further notice.
 */

SigletonConfig = function()
{	
	this.width 		= 	1280;
	this.height 	= 	600;
	this.padding	= 	20;
	
	this.theme		=	0;
		
	this.svg		=	null;
	
	this.gSelectionIds = [];
	this.neuronSelected= -1;
	
	//Scales for the canvas
	this.xScale;	
	this.yScale;

	this.zoomXScale;
	this.zoomYScale;

	this.noXScale;
	this.noYScale;
	
	this.EEColor;
	this.EIColor;
	this.IEColor;
	this.IIColor;
	
	this.EColor;
	this.IColor;
	
	this.minCaColor;
	this.maxCaColor;
	
	//0 = 	Values set from file
	//1 =	Values from the values of the Ca values of each neuron
	this.CaMaxMinValueTypes=0;
	
	this.macroVAlpha;
	
	this.ColorInerpolMethod=null;
	
	this.SEViewSelector = 0; //0=all, 1=vacant, 2=connected	
	
	//Special keys
	this.shiftKey=false;
	
	this.recalculatePosScales();
	this.initColorParams();	
};

//Methods
SigletonConfig.prototype = 
{	
	constructor: SigletonConfig
	
	,initColorParams:function ()
	{
		this.EColor="#FF0000";
		this.IColor="#0000FF";
		
		this.EEColor="#FF0000";
		this.EIColor="#FFA500";
		this.IEColor="#8C00FF";
		this.IIColor="#0000FF";

		this.maxCaColor="#FF0000";
		this.minCaColor="#0000FF";
		
		this.macroVAlpha = 0.3;
		
		this.ColorInerpolMethod="HSL";
	}

	//Esta scala hay q calcularse con cada grupo de datos
	,recalculatePosScales:function (pMinX, pMaxX, pMinY, pMaxY, YAxisInverted)
	{
		YAxisInverted || ( YAxisInverted = false );
		
		var lMinX=0;
		if (pMinX!=undefined) lMinX=pMinX;
		
		var lMaxX=this.width;
		if (pMaxX!=undefined) lMaxX=pMaxX;
			
		var lMinY=0;
		if (pMinY!=undefined) lMinY=pMinY;

		var lMaxY=this.height;
		if (pMaxY!=undefined) lMaxY=pMaxY;
		
		//Create scale functions
		this.xScale = d3.scale.linear()
						.domain([lMinX, lMaxX ])
						.range([this.padding, this.width - this.padding ]);

		if (YAxisInverted)
			this.yScale = d3.scale
							.linear()
							.domain([lMinY, lMaxY])
							.range([this.padding, this.height - this.padding ]);			
		else
			this.yScale = d3.scale
							.linear()
							.domain([lMinY, lMaxY])
							.range([this.height - this.padding, this.padding ]);
		
		this.zoomXScale= d3.scale
							.linear()
							.domain([0,this.width])
							.range([this.padding,this.width-this.padding]);
		
		this.zoomYScale= d3.scale
							.linear()
							.domain([0,this.height])
							.range([this.height-this.padding, this.padding]);

		this.noXScale = d3.scale
							.linear()
							.domain([0,this.width])
							.range([0,this.width]);


		this.noYScale = d3.scale
							.linear()
							.domain([0,this.height])
							.range([0, this.height]);			
				
	}

};

_SigletonConfig = new SigletonConfig();

