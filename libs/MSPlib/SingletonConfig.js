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
 
SigletonConfig = function()
{
    this.padding	= 	100;
    this.width 		= 	$(window).width()-this.padding-50;
    this.height 	= 	$(window).height()-180;

    this.theme		=	0;

    this.svg		=	null;

    this.svgH		=	null;
    this.gSelectionIds = [];
    this.neuronSelected= -1;

    this.neuronsScheme = null;
    this.connectionsScheme = null;
    this.calciumScheme = null;
    
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

    this.auxTmpThis;

    this.localFilesPath="";

    this.navBar;
    this.outgoingConn=true;
    this.incomingConn=true;
    this.scaleBandHeight=65;
};

//Methods
SigletonConfig.prototype =
    {
        constructor: SigletonConfig

        ,initColorParams:function ()
    {
        this.EColor="#e41a1c";
        this.IColor="#377eb8";
        this.AColor="#8DA0CB";

        this.EEColor="#e41a1c";
        this.EIColor="#377eb8";
        this.IEColor="#4daf4a";
        this.IIColor="#984ea3";

        this.maxCaColor="#000004";
        this.minCaColor="#fcffa4";

        this.macroVAlpha = 0.3;

        this.ColorInerpolMethod="HSL";

        this.neuronsScheme = "schemeSet1";
        this.connectionsScheme = "schemeSet1";
        this.calciumScheme = "Inferno";
    }

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
            .range([this.padding, this.width/2 - this.padding ]);

        if (YAxisInverted)
            this.yScale = d3.scale
                .linear()
                .domain([lMinY, lMaxY])
                .range([this.padding, this.height - this.padding*2 ]);
        else
            this.yScale = d3.scale
                .linear()
                .domain([lMinY, lMaxY])
                .range([this.height - this.padding*2, this.padding ]);

        this.zoomXScale= d3.scale
            .linear()
            .domain([0,this.width/2])
            .range([this.padding,this.width/2-this.padding]);

        this.zoomYScale= d3.scale
            .linear()
            .domain([0,this.height/2])
            .range([this.height/2-this.padding, this.padding]);

        this.noXScale = d3.scale
            .linear()
            .domain([0,this.width/2])
            .range([0,this.width/2]);


        this.noYScale = d3.scale
            .linear()
            .domain([0,this.height])
            .range([0, this.height]);

    }

    };

_SigletonConfig = new SigletonConfig();

