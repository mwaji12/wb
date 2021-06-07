/**
 *                        WHITEBOPHIR
 *********************************************************
 * @licstart  The following is the entire license notice for the
 *  JavaScript code in this page.
 *
 * Copyright (C) 2013  Ophir LOJKINE
 *
 *
 * The JavaScript code in this page is free software: you can
 * redistribute it and/or modify it under the terms of the GNU
 * General Public License (GNU GPL) as published by the Free Software
 * Foundation, either version 3 of the License, or (at your option)
 * any later version.  The code is distributed WITHOUT ANY WARRANTY;
 * without even the implied warranty of MERCHANTABILITY or FITNESS
 * FOR A PARTICULAR PURPOSE.  See the GNU GPL for more details.
 *
 * As additional permission under GNU GPL version 3 section 7, you
 * may distribute non-source (e.g., minimized or compacted) forms of
 * that code without the copy of the GNU GPL normally required by
 * section 4, provided you include this license notice and a URL
 * through which recipients can access the Corresponding Source.
 *
 * @licend
 */

(function eraser() { //Code isolation

	var erasing = false;


	var currShape = null;
	var curTool = "single";
	var icons = ["<i style='margin-top:7px' class='fas fa-eraser'></i>","<i style='color: black;margin-top:7px' class='fas fa-skull-crossbones'></i>",];
	var end = false;
	var lastTime = performance.now(); //The time at which the last point was drawn
	var makeRect = false;
	var textElem;

	var rect = {
		x:0,
		y:0,
		x2:0,
		y2:0
	};

	function startErasing(x, y, evt) {
		//Prevent the press from being interpreted by the browser
		evt.preventDefault();
		erasing = true;
		erase(x, y, evt);
	}



	function stopErasing(x, y, evt) {
		evt.preventDefault();
		erasing = false;
	}

	function erase(x, y, evt) {
		if (evt) evt.preventDefault();

		// evt.target should be the element over which the mouse is...
		var target = evt.target;
		if (evt.type === "touchmove") {
			// ... the target of touchmove events is the element that was initially touched,
			// not the one **currently** being touched
			var touch = evt.touches[0];
			target = document.elementFromPoint(touch.clientX, touch.clientY);
		}
		if(erasing){
			if(scanForObject(x,y,target,0,0))return
			if(scanForObject(x,y,target,0,1))return
			if(scanForObject(x,y,target,0,-1))return
			if(scanForObject(x,y,target,1,1))return
			if(scanForObject(x,y,target,1,0))return
			if(scanForObject(x,y,target,1,-1))return
			if(scanForObject(x,y,target,-1,1))return
			if(scanForObject(x,y,target,-1,0))return
			if(scanForObject(x,y,target,-1,-1))return
			for(var i = 2; i<10;i++){
				if(scanForObject(x,y,target,0,i))return;
				if(scanForObject(x,y,target,i,0))return;
				if(scanForObject(x,y,target,0,-i))return;
				if(scanForObject(x,y,target,-i,0))return;
			}
		}
	}

	function draw(data) {
		var elem;
		switch (data.type) {
			//TODO: add the ability to erase only some points in a line
			case "delete":
				if(Array.isArray(data.id)){
					for(var i = 0;i<data.id.length;i++){
						elem = svg.getElementById(data.id[i]);
						if (elem !== null){ //console.error("Eraser: Tried to delete an element that does not exist.");
							elem.remove();
						}
					}
				}else{
					elem = svg.getElementById(data.id);
					if (elem === null) return; //console.error("Eraser: Tried to delete an element that does not exist.");
					elem.remove();
				}
				break;
			default:
				console.error("Eraser: 'delete' instruction with unknown type. ", data);
				break;
		}
	}

	function scanForObject(x,y,target, i,j){
		target=document.elementFromPoint((x+i)*Tools.scale-document.documentElement.scrollLeft, (y+j)*Tools.scale-document.documentElement.scrollTop);

		if (target && target !== Tools.svg) {
			var msg = {
				"type": "delete",
				"id": null
			};
			msg.id = target.id;
			if(!msg.id.startsWith("layer")&&msg.id!="defs"&&msg.id!="rect_1"&&msg.id!="cursors"){
				var elem = svg.getElementById(msg.id);
				if (elem === null) return; //console.error("Eraser: Tried to delete an element that does not exist.");
				else{
					var layer;
					var c = elem.getAttribute("class");
					var d = elem.getAttribute("data-lock");

					if(c && c.startsWith("layer-") && d!=1){
						layer = parseInt(c.substr(6));
						if(shouldDelete(x+i,y+j,layer)) Tools.drawAndSend(msg);
						return true
					}
				}
			}
		}
		return false;
	}

	function segIsWithinRofPt(x, y, x1, y1, x2, y2, r) {

		if( (x1 <= x+r && x1 >= x-r) || (x2  <= x+r && x2 >= x-r) ){ //within x range
			if( (y1 <= y+r && y1 >= y-r) || (y2  <= y+r && y2 >= y-r) ){ //within y range

				var A = x - x1;
				var B = y - y1;
				var C = x - x2;
				var D = y - y2;

				//test distance from points

				if( (A * A + B * B <= r * r) || (C * C + D * D <= r * r) )return true;

				var E = x2 - x1;
				var F = y2 - y1;

				var dot = A * E + B * F;
				var len_sq = E * E + F * F;
				var param = -1;
				if (len_sq != 0) //in case of 0 length line
					param = dot / len_sq;

				var xx, yy;

				if (param < 0) {
				xx = x1;
				yy = y1;
				}
				else if (param > 1) {
				xx = x2;
				yy = y2;
				}
				else {
				xx = x1 + param * E;
				yy = y1 + param * F;
				}

				var dx = x - xx;
				var dy = y - yy;

				if( dx * dx + dy * dy <= r * r){
					if( xx <= Math.max(x1,x2) && xx >= Math.min(x1,x2) &&
						yy <= Math.max(y1,y2) && yy >= Math.min(y1,y2)){
							return true;
					}
				}
			}
		}
		return false;
	  }

	//Figure out if you should delete an object based upon whether the particular x,y coordinate of the object is in a valid masking region
	function shouldDelete(x,y,layer){
		for (var id in Tools.eraserCache) {
			if (Tools.eraserCache.hasOwnProperty(id)) {
				// Do things here
				if(layer<= Tools.eraserCache[id].layer){
					var pts = Tools.eraserCache[id].pts;
					var r = Tools.eraserCache[id].size;
					var x1,y1,x2,y2;
					for (var i=0;i<pts.length-1;i++){
						x1=pts[i].values[0];
						y1=pts[i].values[1];
						var n = i + 1
						x2=pts[n].values[0];
						y2=pts[n].values[1];
						//console.log(segIsWithinRofPt(x, y, x1, y1, x2, y2, r));
						if(segIsWithinRofPt(x, y, x1, y1, x2, y2, r))return false;
					}
				}
			}
		}
		return true;
	}
	var svg = Tools.svg;

	function toggle(elem){

		var index = 0;
		if(curTool=="single"){
			curTool="multi";
			index=1;
		}else{
			curTool="single";
		}
			elem.getElementsByClassName("tool-icon")[0].innerHTML = icons[index];
	};

	function onStart() {
		gtag('event', 'click', { 'event_category': 'eraser' });
	}

	Tools.add({ //The new tool
		"name": "Eraser",
		"iconHTML": '<i class="fa fa-eraser"></i>',
		"listeners": {
			"press": startErasing,
			"move": erase,
			"release": stopErasing,
		},
		"onstart": onStart,
		"draw": draw,
		"mouseCursor": "crosshair",
	});

})(); //End of code isolation
