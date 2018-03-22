/*
 * Copyright (c) 2017 CCS/GMRV/UPM/URJC.
 *
 * Authors: Juan P. Brito <juanpedro.brito@upm.es>
 * 			Nicusor Cosmin Toader <cosmin.toader@urjc.es> 
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

MSP.SimulationController = function () {
  this.actSimStep = 0;
  this.UpdateVelocity = 200;

  this.pause = true;
  this.myTimer = null;

  this.view = null;
  this.critialMoment = 0;
  this.activeViewID = -1;
};

MSP.SimulationController.prototype = {
  constructor: MSP.SimulationController,

  setView: function (pView) {
    this.view = pView;
  },

  updateVisualizationForward: function () {
    if (this.actSimStep == _SimulationData.steps.length)
      this.stopVisualization();
    else {
      var lCritialMoment = ((_SimulationData.actFile + 1) * _SimulationData.numSimStepsPerFile);

      var lLastCriticalMoment = _SimulationData.totalSimulationSteps - _SimulationData.bufferSimulationSteps;

      //Preload
      if (((this.actSimStep + _SimulationData.bufferSimulationSteps) == lCritialMoment)
        && (lLastCriticalMoment != this.actSimStep)
      ) {
        switch (_SimulationData.actualSimulationLoadType) {
          case _SimulationData.SimulationLoadType[0]:
            console.log("Unable to load simulation files from local disk");
            break;
          case _SimulationData.SimulationLoadType[1]:
            _SimulationData.loadServerSimulationDataFiles(_SimulationData.actFile + 1);
            break;
          case _SimulationData.SimulationLoadType[2]:
            _SimulationData.loadWebDavSimulationDataFiles(_SimulationData.actFile + 1);
            break;
        }

      }

      //Swap buffers
      if ((this.actSimStep == lCritialMoment)
        && (lLastCriticalMoment != this.actSimStep)
      ) {
        _SimulationData.swapSimulationInfo();
      }
      _SimulationFilter.filter();
      this.view.updateVisualization();
      this.updateUI();
    }
    this.actSimStep++;
  },

  updateVisualizationBackward: function () {
    this.actSimStep--;
    if (this.actSimStep < 0) this.actSimStep = 0;
    this.view.updateVisualization();
    this.updateUI();
  },

  setVisualizationInterval: function (pInterval) {
    var self = this;
    self.stopVisualization();
    self.UpdateVelocity = pInterval;
  },

  startVisualization: function () {
    if (this.pause) {
      this.pause = false;

      var self = this;
      $('#jqxBottomControls_ButtonSimulate').val('Stop Simulation');
      this.myTimer = setInterval(function () {
        self.updateVisualizationForward();
      }, this.UpdateVelocity);
    }
  },

  stopVisualization: function () {
    this.pause = true;
    $('#jqxBottomControls_ButtonSimulate').val('Play Simulation');
    clearTimeout(this.myTimer);
  },

  concreteSimulationStep: function (pKey) {
    this.stopVisualization();

    console.log("Entrando en slider change");

    var lDataReloaded = false;

    this.actSimStep = pKey;

    var lLastCriticalMoment = _SimulationData.totalSimulationSteps - _SimulationData.bufferSimulationSteps;

    var lSimFileId = Math.floor(this.actSimStep / _SimulationData.numSimStepsPerFile);

    if (lSimFileId != _SimulationData.actFile) {
      console.log("Entrando en carga inmediata");

      switch (_SimulationData.actualSimulationLoadType) {
        case _SimulationData.SimulationLoadType[0]:
          console.log("Unable to load simulation files from local disk");
          break;
        case _SimulationData.SimulationLoadType[1]:
          _SimulationData.loadRemoteSimulationFromServerInmediatly(lSimFileId);
          break;
        case _SimulationData.SimulationLoadType[2]:
          _SimulationData.loadSimulationFromWebDavInmediatly(lSimFileId);
          break;
      }

      _SimulationData.actFile = lSimFileId;

      var lCritialMoment = ((_SimulationData.actFile + 1) * _SimulationData.numSimStepsPerFile);
      if (((this.actSimStep + _SimulationData.bufferSimulationSteps) >= lCritialMoment)
        && (this.actSimStep < lLastCriticalMoment)
      ) {
        console.log("Entrando en carga adelantada A");
        switch (_SimulationData.actualSimulationLoadType) {
          case _SimulationData.SimulationLoadType[0]:
            console.log("Unable to load simulation files from local disk");
            break;
          case _SimulationData.SimulationLoadType[1]:
            _SimulationData.loadServerSimulationDataFiles(lSimFileId + 1);
            break;
          case _SimulationData.SimulationLoadType[2]:
            _SimulationData.loadWebDavSimulationDataFiles(lSimFileId + 1);
            break;
        }
      }
    }
    else {
      //Same interval but critical load region
      var lCritialMoment = ((_SimulationData.actFile + 1) * _SimulationData.numSimStepsPerFile);
      if (((this.actSimStep + _SimulationData.bufferSimulationSteps) >= lCritialMoment)
        && (this.actSimStep < lLastCriticalMoment)
      ) {
        console.log("Entrando en carga adelantada B");

        switch (_SimulationData.actualSimulationLoadType) {
          case _SimulationData.SimulationLoadType[0]:
            console.log("Unable to load simulation files from local disk");
            break;
          case _SimulationData.SimulationLoadType[1]:
            _SimulationData.loadServerSimulationDataFiles(lSimFileId + 1);
            break;
          case _SimulationData.SimulationLoadType[2]:
            _SimulationData.loadWebDavSimulationDataFiles(lSimFileId + 1);
            break;
        }
      }
    }

    _SimulationFilter.filter();

    if (!lDataReloaded) this.view.updateVisualization();
    this.updateUI();
  },

  updateUI: function () {
    $('#jqxBottomControls_SliderTimeline').jqxSlider('setValue', this.actSimStep);
    $("#jqxBottomControls_NumericInputStep").jqxNumberInput('val', this.actSimStep);
  }
};
