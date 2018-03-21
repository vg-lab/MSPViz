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

importScripts("../d3/d3.js");

var force;
var nodes = [];
var links = [];
var lastStep = -1;
onmessage = function(event) {
    if(event.data.type === "init"){
        nodes =  event.data.nodes;
        links = event.data.links;
        force = d3.layout.force()
            .size([ event.data.width,  event.data.height])
            .nodes(nodes)
            .links(links)
            .linkStrength(1)
            .linkDistance(dist)
            .charge(charge)
            .gravity(0.05)
            .on("start",start)
        ;
        function dist(d)
        {
            var dista =  Math.pow((Math.min(d.source.weight , d.target.weight)+1),2) * 10;
            if(d.source.weight === 1 || d.target.weight === 1)
                return 10;
            else if(dista > 2000)

                return 2000;
            else
                return dista;
        }
        function charge(d)
        {
            if(d.weight === 0)
                return -100;
            else if(d.weight === 1)
                return -300;
            else
                return (d.weight+1) * -180;
        }
        this.force = force;
        function start() {
                while(force.alpha() > 0) {
                    force.tick();
                }
            force.stop();
            force.alpha(-1);
            postMessage({type: "end", nodes: nodes, links: links});
        }

        force.on('end', function() {

        });
        force.start();
        lastStep = event.data.step;
    }
    //WebWorker Bug, message sent twice to worker, we we ignore the same step
    else if(event.data.type === "step" && lastStep !== event.data.step){
        lastStep = event.data.step;
        force.stop();
        links =  event.data.links;
        force.links(links);
        force.start();
    }
};
