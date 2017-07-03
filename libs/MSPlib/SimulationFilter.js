MSP.SimulationFilter = function()
{
    this.gNeuronsFilter		=	[];
    this.gNeuronsFilterB		=	[];
    this.gNeuronsRep	=	[];
    this.gConnectivity	= 	[];
    this.excitatory = true;
    this.inhibitory = true;
    this.filters = [];
    this.order = "none";
    this.orderIndex = [];
    this.inverseOrder = false;
    this.orderMix = true;
    //TODO: Hacer un init para calcular numeros
    this.excitatoryNum = 800;
    this.inhibitoryNum = 200;
};

//Methods
MSP.SimulationFilter.prototype = {
    constructor: MSP.SimulationFilter

    ,filterByCalcium: function (min,max){

    },createDummy: function (){
        var self = this;
        if(this.filters.length > 0) {
            this.gNeuronsFilterB = [];
            var size = _SimulationData.gNeurons.length;
            while (size--) this.gNeuronsFilterB[size] = true;
            var self = this;
            this.gNeuronsFilter = [];
            _SimulationData.gNeurons.forEach(function (d,z) {
                for (var i = 0; i < self.filters.length; i++) {
                    //Filtro de calcio
                    if (self.filters[i].type === "Ca" && !(_SimulationData.gNeuronsDetails[d.NId].Calcium[_SimulationController.actSimStep] >= self.filters[i].min
                        && _SimulationData.gNeuronsDetails[d.NId].Calcium[_SimulationController.actSimStep] <= self.filters[i].max)
                        && ((d.NAct === "E" && self.filters[i].excitatory) || (d.NAct === "I" && self.filters[i].inhibitory))) {
                        self.gNeuronsFilterB[z] = false;
                    }
                    //Filtro de conexiones excitadoras
                    else if (self.filters[i].type === "EConn" && !(_SimulationData.gNeuronsDetails[d.NId].DeSeEA[_SimulationController.actSimStep] >= self.filters[i].min
                        && _SimulationData.gNeuronsDetails[d.NId].DeSeEA[_SimulationController.actSimStep] <= self.filters[i].max)
                        && ((d.NAct === "E" && self.filters[i].excitatory) || (d.NAct === "I" && self.filters[i].inhibitory))) {
                        self.gNeuronsFilterB[z] = false;
                    }
                    //Filtro de conexiones inhibidoras
                    else if (self.filters[i].type === "IConn"  && !(_SimulationData.gNeuronsDetails[d.NId].DeSeIA[_SimulationController.actSimStep] >= self.filters[i].min
                        && _SimulationData.gNeuronsDetails[d.NId].DeSeIA[_SimulationController.actSimStep] <= self.filters[i].max)
                        && ((d.NAct === "E" && self.filters[i].excitatory) || (d.NAct === "I" && self.filters[i].inhibitory))) {
                        self.gNeuronsFilterB[z] = false;
                    }
                    //Filtro de conexiones axonales
                    else if (self.filters[i].type === "AConn" && !(_SimulationData.gNeuronsDetails[d.NId].AxSeA[_SimulationController.actSimStep] >= self.filters[i].min
                        && _SimulationData.gNeuronsDetails[d.NId].AxSeA[_SimulationController.actSimStep] <= self.filters[i].max)
                        && ((d.NAct === "E" && self.filters[i].excitatory) || (d.NAct === "I" && self.filters[i].inhibitory))) {
                        self.gNeuronsFilterB[z] = false;
                    }
                }
            });
        }
        else
        {
            this.gNeuronsFilterB = [];
            var size = _SimulationData.gNeurons.length;
            while (size--) {
                this.gNeuronsFilterB[size] = true;
                this.gNeuronsFilter[size] = size;
            }
        }

        if(this.order !== "none"){
            this.orderIndex = new Array(_SimulationData.gNeurons.length);
            var lIndex = _SimulationController.actSimStep % _SimulationData.numSimStepsPerFile;
            var orderValues = [];

            if(this.order === "calcium") {
                _SimulationData.gNeuronsDetails.forEach(function (d, i) {
                    orderValues.push([d.Calcium[lIndex], i]);
                });
            }
            else if(this.order === "econn") {
                _SimulationData.gNeuronsDetails.forEach(function (d, i) {
                    orderValues.push([d.DeSeEA[lIndex], i]);
                });
            }
            else if(this.order === "iconn") {
                _SimulationData.gNeuronsDetails.forEach(function (d, i) {
                    orderValues.push([d.DeSeIA[lIndex], i]);
                });
            }
            else if(this.order === "aconn") {
                _SimulationData.gNeuronsDetails.forEach(function (d, i) {
                    orderValues.push([d.AxSeA[lIndex], i]);
                });
            }

            orderValues.sort(function(c1, c2) {
                if(self.inverseOrder)
                    return c1[0] > c2[0] ? -1 : 1;
                else
                    return c1[0] < c2[0] ? -1 : 1;
            });

            if(this.orderMix){
                orderValues.forEach(function (d,i){
                    _SimulationData.gNeurons[d[1]].index =i;
                    self.orderIndex[i] = d[1];
                });
            } else {
                var eIndex = 0;
                var iIndex = this.excitatoryNum;
                orderValues.forEach(function (d,i){
                    if(_SimulationData.gNeurons[d[1]].NAct === "E"){
                        _SimulationData.gNeurons[d[1]].index =eIndex;
                        self.orderIndex[eIndex] = d[1];
                        eIndex+=1;
                    }
                    else{
                        _SimulationData.gNeurons[d[1]].index =iIndex;
                        self.orderIndex[iIndex] = d[1];
                        iIndex+=1;
                    }
                });
            }

        }
        else{
            self.orderIndex = new Array(_SimulationData.gNeurons.length);
            _SimulationData.gNeurons.forEach(function(d,i){
                d.index = i;
                self.orderIndex[i] = i;
            });
        }
    },
    addFilter:function(){

    }
};

