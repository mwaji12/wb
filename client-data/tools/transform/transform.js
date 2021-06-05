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

(function transform() { //Code isolation

	var transforming = false;
	var currShape = null;
	var curTool = "move";
	var icons = ['<i class="fas fa-mouse-pointer"></i>', '<i class="far fa-hand-paper"></i>'];
	var end = false;
	var lastTime = performance.now(); //The time at which the last point was drawn
	var makeRect = false;
	var lastX = 0;
	var lastY = 0;
	var msgIds = null;
	var gid;

	var rect = {
		x:0,
		y:0,
		x2:0,
		y2:0
	};

	var orig = { x: 0, y: 0 };
	var pressed = false;
	function clientCoords(evt) {
		if (evt.touches) {
			return evt.touches[0];
		} else {
			return evt;
		}
	}

	function onStart(evt){
		gtag('event', 'click', { 'event_category': curTool });
		if(curTool =="hand") {
			mc.get('pinch').set({ enable: true });
		}
		if(!isTouchDevice) {
			document.getElementById("rect_1").addEventListener('dblclick', fullscreen);
		} else {
			document.getElementById("rect_1").addEventListener('touchstart', doubleTouchHandler);
		}
	};

	function onQuit(){
		deactivateCurrentShape();
		mc.get('pinch').set({ enable: false });
		if (!isTouchDevice) {
			document.getElementById("rect_1").removeEventListener('dblclick', fullscreen);
		} else {
			document.getElementById("rect_1").removeEventListener('touchstart', doubleTouchHandler);
		}
	};

	var touchtime = 0
	var tx, ty;
	function doubleTouchHandler(evt) {
		if(evt.targetTouches.length > 1) return;
		if (touchtime == 0) {
			touchtime = new Date().getTime();
			tx = evt.targetTouches[0].clientX
			ty = evt.targetTouches[0].clientY
		} else {
			if (((new Date().getTime()) - touchtime) < 400 &&
				(Math.abs(evt.targetTouches[0].clientX - tx) < 20 && Math.abs(evt.targetTouches[0].clientY - ty) < 20)) {
					fullscreen()
					touchtime = 0;
			} else {
				touchtime = new Date().getTime();
				tx = evt.targetTouches[0].clientX
				ty = evt.targetTouches[0].clientY
			}
		}
	}

	function start(x, y, evt) {

		//Prevent the press from being interpreted by the browser
		evt.preventDefault();
		if(curTool=="move"){
			if(!currShape||(currShape&&!currShape.visible)){
				var shape  = Tools.createSVGElement("rect");

				shape.id = "transform-rect";

				shape.setAttribute("stroke", "#888");
				shape.setAttribute("fill", "none");
				shape.setAttribute("stroke-dasharray", "6,6");
				shape.setAttribute("stroke-width", "1px");
				shape.setAttribute("vector-effect", "non-scaling-stroke");
				Tools.svg.appendChild(shape);
				rect.x = x;
				rect.y = y;
				makeRect = true;
			}
		} else {
			pressed = true;
			orig.x = scrollX + clientCoords(evt).clientX;
			orig.y = scrollY + clientCoords(evt).clientY;
		}
	}

	function move(x, y, evt) {
		if(curTool=="move"){
			if(makeRect){
				rect['x2'] = x; rect['y2'] = y;
				if (performance.now() - lastTime > 20 || end) {
					var shape = svg.getElementById("transform-rect");
					shape.x.baseVal.value = Math.min(rect['x2'], rect['x']);
					shape.y.baseVal.value = Math.min(rect['y2'], rect['y']);
					shape.width.baseVal.value = Math.abs(rect['x2'] - rect['x']);
					shape.height.baseVal.value = Math.abs(rect['y2'] - rect['y']);
					lastTime = performance.now();
				}
			}
		} else {
			if (pressed && !pinching) {
				window.scrollTo(orig.x - clientCoords(evt).clientX, orig.y - clientCoords(evt).clientY);
			}
		}
		if (evt) evt.preventDefault();
		lastX = x;
		lastY = y;
	}

	function stop(x, y, evt) {
		evt.preventDefault();
		pressed = false;
		if(curTool=="move"){
			if(makeRect){
				end=true;
				move(x, y);
				end=false;
				var shape = svg.getElementById("transform-rect");
				shape.remove();
				makeRect = false;
				var targets = [];
				var rects = []
				var rx = rect.x*Tools.scale-document.documentElement.scrollLeft;
				var rx2 = rect.x2*Tools.scale-document.documentElement.scrollLeft;
				if(rx2 < rx) [ rx, rx2] = [ rx2, rx ]
				var ry = rect.y*Tools.scale-document.documentElement.scrollTop;
				var ry2 = rect.y2*Tools.scale-document.documentElement.scrollTop;
				if (ry2 < ry) [ry, ry2] = [ry2, ry]
				$("#layer-"+Tools.layer).find("*").each(
					function( i, el ) {
						var r = el.getBoundingClientRect();
						if(insideRect(r.x,r.y,r.width,r.height,rx,ry,rx2,ry2)){
							var r2 = {};
							var m;
							var transform = el.getAttributeNS(null,"transform");
							if(transform){
								var t = transform.substr(7, transform.length-2).split(/[\s,]+/);
								m = [[parseFloat( t[0]   ),parseFloat( t[2]   ),parseFloat( t[4]   )],[parseFloat( t[1]   ),parseFloat( t[3]   ),parseFloat( t[5]   )],[0,0,1]]
							}else{
								m = [[1,0,0],[0,1,0],[0,0,1]]
							}

							if(Tools.getMarkerBoundingRect(el,r2,m)){
								if(insideRect(r2.x,r2.y,r2.width,r2.height,rx,ry,rx2,ry2)){
									Tools.composeRects(r,r2);
									targets.push(el);
									Tools.adjustBox(el,r,m);
									rects.push(r);
								}
							}else{
								targets.push(el);
								Tools.adjustBox(el,r,m);
								rects.push(r);
							}
						}
					}
				);
				if(targets.length>0){
					var x=0,y=0,x2=0,y2=0;
					for(var i = 0;i<rects.length;i++){
						var r = rects[i];
						if(i==0){
							x=r.x;
							y=r.y;
							x2=r.x+r.width;
							y2=r.y+r.height;
						}

						x=Math.min(x,r.x);
						y=Math.min(y,r.y);
						x2=Math.max(x2,r.x+r.width);
						y2=Math.max(y2,r.y+r.height);
					}

					initialize(targets,{x:x,y:y,x2:x2,y2:y2})
				}
			}
		}
		if(transforming){
			end = true;
			continueTransforming(currShape);
			end = false;
			transforming = false;
		}
		Tools.suppressPointerMsg = false;
	}

	function insideRect(x,y,w,h,rx,ry,rx2,ry2){
		if(rx<=x&&ry<=y){
			if(rx2>=x+w&&ry2>=y+h){
				if(rx2>rx&&ry2>ry){
					return true;
				}
			}
		}
		return false;
	}


	function continueTransforming(shape) {
		if (performance.now() - lastTime > 70 || end) {
			if(!transforming)gid=Tools.generateUID("tr"); //tr" for transform
			transforming=true;
			Tools.suppressPointerMsg = true;
			if(shape){
				var msg = {
					"type": "update",
					"id": msgIds,
					"gid":gid,
					"undo":true
				};
				if(Tools.showMyPointer){
					msg.tx = lastX;
					msg.ty = lastY;
				}
				if(Array.isArray(shape.matrix)){
					msg.updates = [];
					for(var i = 0; i<shape.matrix.length;i++){
						msg.updates[i]={transform:shape.matrix[i]};
					}
					if(wb_comp.list["Measurement"]){
						wb_comp.list["Measurement"].updateTransform(shape)
					}
				}else{
					msg.transform=shape.matrix;
					if(wb_comp.list["Measurement"]){
						wb_comp.list["Measurement"].updateTransform()
					}
				}

				Tools.drawAndSend(msg);
			}
			lastTime = performance.now();
		}
	};

	function zoom(scale, x, y) {
		var oldScale = Tools.getScale();
		if (Math.abs(scale - oldScale) < 0.05) return
		var pageX = window.scrollX + pinchStart.centerX
		var pageY = window.scrollY + pinchStart.centerY
		var x = pageX / oldScale;
		var y = pageY / oldScale;
		var newScale = Tools.setScale(scale);
		window.scrollTo(
			scrollX + x * (newScale - oldScale),
			scrollY + y * (newScale - oldScale)
		);
	}

	var mc = new Hammer.Manager(document.getElementById("board"));
	mc.add(new Hammer.Pinch());
	mc.get('pinch').set({ enable: false });

	var pinchStart = {}
	var pinching = false
	mc.on("pinchstart", event => {
		pinching = true
		gtag('event', 'click', { 'event_category': 'pinch' });
		pinchStart = {
			scale: Tools.getScale(),
			scrollX: window.scrollX,
			scrollY: window.scrollY,
			centerX: event.center.x,
			centerY: event.center.y,
		}
	});

	var lastEvent = new Date().getTime();

	mc.on("pinch", event => {
		var now = new Date().getTime();
		if (now - lastEvent > 50) {
			zoom(pinchStart.scale * event.scale,
				event.center.x,
				event.center.y);
			lastEvent = now;
		}
	});

	mc.on("pinchend", event => {
		pinching = false
	});

	function draw(data) {
		switch (data.type) {
			case "update":
				if(Array.isArray(data.id)){
					for(var i = 0; i<data.id.length;i++){
						var elem = svg.getElementById(data.id[i]);
						//check if top layer
						if(Tools.useLayers){
							if(elem.getAttribute("class")!="layer"+Tools.layer){
								elem.setAttribute("class","layer-"+Tools.layer);
								Tools.group.appendChild(elem);
							}
						}
						var idSelected = false;
						if(currShape){
							if(Array.isArray(currShape)){
								idSelected = arrayContains(currShape.id,data.id[i])
							}else{
								idSelected = (currShape.id==data.id[i]);
							}
						}
						if (!(transforming&&idSelected||elem === null)){
							if (idSelected) deactivateCurrentShape();
							Tools.drawingEvent=true;
							elem.setAttribute("transform", data.updates[i].transform);
						}
					}
				}else{
					var elem = svg.getElementById(data.id);
					if(data.transform){
						//check if top layer
						if(Tools.useLayers){
							if(elem.getAttribute("class")!="layer"+Tools.layer){
								elem.setAttribute("class","layer-"+Tools.layer);
								Tools.group.appendChild(elem);
							}
						}
						var idSelected = false;
						if(currShape){
							if(Array.isArray(currShape)){
								idSelected = arrayContains(currShape.id,data.id)
							}else{
								idSelected = (currShape.id==data.id);
							}
						}
						if (transforming&&idSelected||elem === null) return;
							if (idSelected) deactivateCurrentShape();
							Tools.drawingEvent=true;
							elem.setAttribute("transform", data.transform);
					}
					if(data.data !== undefined){
						if (elem === null) return;
						elem.setAttribute("data-lock", data.data);
						if(lockOpen && currShape.id==data.id)showLock(data.data)
					}
				}
				break;
			default:
				break;
		}
	}

	function initialize(target,rect) {
		var shape;
		shape = new Transform(target,rect);
		msgIds = [];
		shape.id = [];
		for(var i = 0;i<target.length;i++){
			msgIds.push(target[i].id);
			shape.id.push(target[i].id);
		};

		if ( shape != null ) {
			shape.realize();
			shape.callback = continueTransforming;
			deactivateCurrentShape();
            mouser.registerShape(shape);
			currShape = shape;
		}
	};

	deactivateCurrentShape = function(){
		if(currShape){
			mouser.unregisterShapes();
			currShape.unrealize();
			currShape=null;
		}
	};

	var svg = Tools.svg;

	var cursorCallback;

	function toggle(elem){
		var index = 1;
		if(curTool=="hand"){
			curTool="move";
			cursorCallback("default")
			mc.get('pinch').set({ enable: false });
			index=0;
		}else{
			deactivateCurrentShape();
			mc.get('pinch').set({ enable: true });
			curTool="hand";
			cursorCallback("move")
		}
		elem.getElementsByClassName("tool-icon")[0].innerHTML = icons[index];
	};

	function setCursor(callback) {
		cursorCallback = callback;
		callback("default")
	}

	function fullscreen() {
		if (document.fullscreenElement) {
			document.exitFullscreen()
		} else {
			document.documentElement.requestFullscreen()
		}
	}

	Tools.add({ //The new tool
		"name": "Transform",
		"icon": "?",
		"iconHTML":icons[0],
		"toggle":toggle,
		"title": "Move / Pan, Zoom (pinch), Fullscreen (double-click)",
		"shortcuts": {
            "changeTool":"6"
        },
		"listeners": {
			"press": start,
			"move": move,
			"release": stop,
		},
		"draw": draw,
		"onstart":onStart,
		"onquit":onQuit,
		"mouseCursor": setCursor,
		"toggle": toggle,
		"extra": true
	});

})(); //End of code isolation