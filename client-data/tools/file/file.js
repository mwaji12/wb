(function () {

	var clearMsg = {
		"type": "clear"
	};

	function toggle(elem) {
		if (Tools.menus["File"].menuOpen()) {
			Tools.menus["File"].show(false);
		} else {
			Tools.menus["File"].show(true);
		}
		if (!menuInitialized) initMenu(elem);
	};

	var menuInitialized = false;
	var button;

	function initMenu(elem) {
		button = elem;
		var btns = document.getElementsByClassName("submenu-file");
		for (var i = 0; i < btns.length; i++) {
			btns[i].addEventListener("click", menuButtonClicked);
		}
		menuInitialized = true;
	};

	var menuButtonClicked = function () {
		curTool = this.id.substr(8);
		gtag('event', 'click', { 'event_category': curTool });
		Tools.menus["File"].show(false);
		switch(curTool) {
			case "clear": clearBoard(); break;
			case "new": createNew(); break;

		}
	};

	function draw(data) {
		switch (data.type) {
			case "clear":
				Tools.clearBoard(false);
				break;
			default:
				console.error("Clear: 'clear' instruction with unknown type. ", data);
				break;
		}
	}

	function clearBoard(evt) {
		gtag('event', 'click', { 'event_category': 'clear' });
		Tools.acceptMsgs = false;
		draw(clearMsg, true);
		Tools.send(clearMsg, "Clear");
	};


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

	function menuListener(elem, onButton, onMenu, e) {
		if (!onMenu && !onButton) {
			e.stopPropagation();
			return true;
		}
		return false;
	};

	function onStart() {
		gtag('event', 'click', { 'event_category': 'file' });
		toggle();
	}

	Tools.add({
		"iconHTML": "<i class='fa fa-folder'></i>",
		"name": "File",
		"title": "Clear / New / Join",
		"toggle": toggle,
		"menu": {
			"content": `<div class="tool-extra submenu-file" id="submenu-clear">
							<span class="tool-icon"><i class="far fa-trash-alt"></i></span>
						</div>
						<div class="tool-extra submenu-file" id="submenu-new">
							<span class="tool-icon"><i class="far fa-file"></i></span>
						</div>`,
			"listener": menuListener
		},
		"draw": draw,
		"mouseCursor": "default",
		"stylesheet": "tools/file/file.css",
		"onstart": onStart
	});

})();
