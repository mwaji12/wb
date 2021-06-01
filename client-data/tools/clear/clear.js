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

(function clear() { //Code isolation


	var msg = {
		"type": "clear"
	};

	var icons = ['<i class="far fa-trash-alt"></i>', '<i class="far fa-file"></i>']

	function clearBoard(evt) {
		gtag('event', 'click', { 'event_category': 'clear' });
        if(evt.preventDefault)evt.preventDefault();
		Tools.acceptMsgs = false;
		draw(msg, true);
		Tools.send(msg,"Clear");
		document.getElementById("toolID-Clear").getElementsByClassName("tool-icon")[0].innerHTML = icons[1]
	};

	function onQuit(evt) {
		document.getElementById("toolID-Clear").getElementsByClassName("tool-icon")[0].innerHTML = icons[0]
	}

	function draw(data) {
		var elem;
		switch (data.type) {
			//TODO: add the ability to erase only some points in a line
			case "clear":
				Tools.clearBoard(false);
				break;
			default:
				console.error("Clear: 'clear' instruction with unknown type. ", data);
				break;
		}
	}

	function makeid(length) {
		var result = [];
		var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
		var charactersLength = characters.length;
		for (var i = 0; i < length; i++) {
			result.push(characters.charAt(Math.floor(Math.random() *
				charactersLength)));
		}
		return result.join('');
	}

	function createNew() {
		gtag('event', 'click', { 'event_category': 'new' });
		window.location = "/board.html?board=" + makeid(24) + "#500,500,1.00"
	}

	Tools.add({ //The new tool
		"name": "Clear",
		"title": "Clear / New Board",
		"iconHTML": '<i class="far fa-trash-alt"></i>',
		"shortcuts": {
            "actions":[{"key":"shift-C","action":clearBoard}]
        },
		"listeners": {},
		"draw": draw,
		"onstart": clearBoard,
		"onquit": onQuit,
		"toggle": createNew,
		"mouseCursor": "crosshair",
	});

})(); //End of code isolation
