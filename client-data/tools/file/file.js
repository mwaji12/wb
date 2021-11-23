(function () {

	var clearMsg = {
		"type": "clear"
	};

	var codeRefresh;

	function toggle(elem) {
		if (Tools.menus["File"].menuOpen()) {
			Tools.menus["File"].show(false);
			onQuit();
		} else {
			Tools.menus["File"].show(true);
			window.addEventListener("keydown", keyDown);
			Tools.send({type: "open"})
			codeRefresh = setInterval(() => {
				Tools.send({ type: "open" })
			}, 1000)
		}
		if (!menuInitialized) initMenu(elem);
	};

	var menuInitialized = false;
	var button;

	function initMenu(elem) {
		button = elem;
		var btns = document.getElementsByClassName("submenu-file");
		for (var i = 0; i < btns.length; i++) {
			var id = btns[i].id.substr(8);
			if (id.startsWith("digit")) {
				btns[i].addEventListener("wheel", evt => {
						evt.preventDefault();
						evt.target.textContent = (new Number(evt.target.textContent) - Math.sign(evt.deltaY*0.01)) % 10;
						if (evt.target.textContent == -1) evt.target.textContent = 9

						if (timeout) clearTimeout(timeout)
						timeout = setTimeout(tryLoad, 600)
					}
				)
				btns[i].addEventListener("touchstart", startChange)
				btns[i].addEventListener("mousedown", startChange)
				btns[i].addEventListener("click", e => {
					e.preventDefault()
					changeSelect(e.target)
				 })
			} else {
				btns[i].addEventListener("click", menuButtonClicked);
			}
		}
		menuInitialized = true;
	};

	var currentDigit = 0;
	var currentCode = null;

	function initCode(code) {
		if (currentCode != null) return
		currentCode = (""+code).padStart(3, "0")
		for (var i = 0; i < 3; i++)
			document.getElementById("submenu-digit-" + i).textContent = currentCode[i]
	}

	function changeSelect(p) {
		for(var i=0; i<3; i++)
			document.getElementById("submenu-digit-" + i).classList.remove("selected")
		if(p==null) {
			currentDigit = 0;
			return
		}
		if(p instanceof Number)
			p = document.getElementById("submenu-digit-" + p)
		p.classList.add("selected")
		currentDigit = p.id.substr(14)
	}

	function keyDown(evt) {
		evt.preventDefault();
		code = -1
		if (evt.code.startsWith("Numpad")) {
			code = evt.code.substr(6)
		}
		if (evt.keyCode >= 48 && evt.keyCode <= 57) {
			code = evt.keyCode - 48
		}

		if (code >= 0) {
			var elem = document.getElementById("submenu-digit-" + currentDigit)
			elem.textContent = code
			elem.classList.remove("selected")
			currentDigit++;
			currentDigit = currentDigit % 3;
			document.getElementById("submenu-digit-" + currentDigit).classList.add("selected")
		}
		if (timeout) clearTimeout(timeout)
		timeout = setTimeout(tryLoad, 600)
		return false
	}

	var changeValue;
	var changeElem;
	var changeX;
	var changeY;
	function startChange(evt) {
		changeSelect(evt.target)
		evt.preventDefault();
		changeValue = new Number(evt.target.textContent)+100
		changeElem = evt.target;
		changeX = evt.clientX || evt.targetTouches[0] && evt.targetTouches[0].clientX;
		changeY = evt.clientY || evt.targetTouches[0] && evt.targetTouches[0].clientY;
		document.addEventListener("mousemove", changeMove)
		document.addEventListener("touchmove", changeMove)
		document.addEventListener("touchend", resetChange)
		document.addEventListener("touchleave", resetChange)
		document.addEventListener("touchcancel", resetChange)
	}

	function resetChange(evt) {
		if(evt && evt.type.startsWith("touch") )
			changeSelect(null)
		document.removeEventListener("mousemove", changeMove)
		document.removeEventListener("touchmove", changeMove)
		document.removeEventListener("touchend", resetChange)
		document.removeEventListener("touchleave", resetChange)
		document.removeEventListener("touchcancel", resetChange)
	}

	var timeout;

	function changeMove(evt) {
		dx = changeX - (evt.clientX || evt.targetTouches[0].clientX);
		dy = changeY - (evt.clientY || evt.targetTouches[0].clientY);

		newVal = Math.round(changeValue - dy / 40) % 10
		changeElem.textContent = newVal
		if (evt.buttons == 0) {
			resetChange()
		}

		if(timeout) clearTimeout(timeout)
		timeout = setTimeout(tryLoad, 600)
	}

	function tryLoad() {
		value =
			new Number(document.getElementById("submenu-digit-0").textContent.trim() +
			document.getElementById("submenu-digit-1").textContent.trim() +
			document.getElementById("submenu-digit-2").textContent.trim())
		Tools.send({ type: "join", code: value })
	}

	var menuButtonClicked = function () {
		curTool = this.id.substr(8);
		gtag('event', 'click', { 'event_category': curTool });
		Tools.menus["File"].show(false);
		switch(curTool) {
			case "clear": clearBoard(); break;
			case "new": createNew(); break;
			case "png":
				var minX=Number.MAX_VALUE, maxX=0, minY=Number.MAX_VALUE, maxY=0
				$("#layer-" + Tools.layer).find("*").each(
					function (i, el) {
						var r = el.getBoundingClientRect();
						console.log(r)
						if(r.x < minX) minX = r.x;
						if(r.x + r.width > maxX) maxX = r.x + r.width;
						if (r.y < minY) minY = r.y;
						if (r.y + r.height > maxY) maxY = r.y + r.height;
					})
				var options = {
					backgroundColor: "white",
					top: (window.scrollY + minY) / Tools.getScale() - 20,
					left: (window.scrollX + minX) / Tools.getScale() - 20,
					width: (maxX - minX) / Tools.getScale() + 40,
					height: (maxY - minY) / Tools.getScale() +40
				}
				console.log(options)
				saveSvgAsPng(document.getElementById("canvas"), "whiteboard-"+currentCode+".png", options); break;
		}
	};

	function draw(data) {
		switch (data.type) {
			case "clear":
				Tools.clearBoard(false);
				break;
			case "code":
				initCode(data.code);
				break;
			case "admit":
				window.location = "/boards/"+data.board+"#500,500,1.0"
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
		if(e.target.id=="rect_1") onQuit()
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

	function onQuit() {
		currentCode = null;
		window.removeEventListener("keydown", keyDown);
		changeSelect(null)
		if(codeRefresh) {
			clearInterval(codeRefresh)
		}
	}

	Tools.add({
		"iconHTML": "<i class='fa fa-folder'></i>",
		"name": "File",
		"title": "Clear / New / Share",
		"toggle": toggle,
		"listeners": {
			"press": onQuit
		},
		"menu": {
			"content": `<div class="tool-extra submenu-file" id="submenu-clear" title="Clear Board">
							<span class="tool-icon"><i class="far fa-trash-alt"></i></span>
						</div>
						<div class="tool-extra submenu-file" id="submenu-new" title="New Board">
							<span class="tool-icon"><i class="far fa-file"></i></span>
						</div>
						<div class="tool-extra submenu-file" id="submenu-png" title="Export as PNG">
							<span class="tool-icon"><i class="fas fa-file-export"></i></span>
						</div>
						<div class="tool-extra submenu-file digit" id="submenu-digit-0" title="Sharing code active when the menu is open">

						</div>
						<div class="tool-extra submenu-file digit" id="submenu-digit-1" title="Sharing code active when the menu is open">

						</div>
						<div class="tool-extra submenu-file digit" id="submenu-digit-2" title="Sharing code active when the menu is open">

						</div>`,
			"listener": menuListener
		},
		"draw": draw,
		"mouseCursor": "default",
		"stylesheet": "tools/file/file.css",
		"onstart": onStart,
		"onquit": onQuit
	});

})();
<ul>
  <li>
    <a href="#">
      <h2>Title #1</h2>
      <p>Text Content #1</p>
    </a>
  </li>
  <li>
    <a href="#">
      <h2>Title #2</h2>
      <p>Text Content #2</p>
    </a>
  </li>
  […]
</ul>

body {
  margin: 20px auto;
  font-family: 'Lato';
  background:#666;
  color:#fff;
}
 
*{
  margin:0;
  padding:0;
}
 
h2 {
  font-weight: bold;
  font-size: 2rem;
}
 
p {
  font-size: 1rem;
  font-weight: normal;
}
 
ul,li{
  list-style:none;
}
ul{
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
}
ul li a{
  text-decoration:none;
  color:#000;
  background:#ffc;
  display:block;
  height:10em;
  width:10em;
  padding:1em;
}
ul li{
  margin:1em;
}
h2 {
  font-weight: bold;
  font-size: 2rem;
}
p {
  font-family: 'Reenie Beanie';
  font-size: 2rem;
}
ul li a{
  text-decoration:none;
  color:#000;
  background:#ffc;
  display:block;
  height:10em;
  width:10em;
  padding:1em;
  box-shadow: 5px 5px 7px rgba(33,33,33,.7);
}
ul li a{
  transform: rotate(-6deg);
}
ul li:nth-child(even) a{
  transform:rotate(4deg);
  position:relative;
  top:5px;
}
ul li:nth-child(3n) a{
  transform:rotate(-3deg);
  position:relative;
  top:-5px;
}
ul li:nth-child(5n) a{
  transform:rotate(5deg);
  position:relative;
  top:-10px;
}
ul li a:hover,ul li a:focus{
  box-shadow:10px 10px 7px rgba(0,0,0,.7);
  transform: scale(1.25);
  position:relative;
  z-index:5;
}
ul li a{
  text-decoration:none;
  color:#000;
  background:#ffc;
  display:block;
  height:10em;
  width:10em;
  padding:1em;
  box-shadow: 5px 5px 7px rgba(33,33,33,.7);
  transition: transform .15s linear;
}

ul li:nth-child(even) a{
  position:relative;
  top:5px;
  background:#cfc;
}
ul li:nth-child(3n) a{
  position:relative;
  top:-5px;
  background:#ccf;
}
all_notes = $("li a");
 
all_notes.on("keyup", function () {
  note_title = $(this).find("h2").text();
  note_content = $(this).find("p").text();
 
  item_key = "list_" + $(this).parent().index();
 
  data = {
    title: note_title,
    content: note_content
  };
 
  window.localStorage.setItem(item_key, JSON.stringify(data));
});
all_notes.each(function (index) {
  data = JSON.parse(window.localStorage.getItem("list_" + index));
 
  if (data !== null) {
    note_title = data.title;
    note_content = data.content;
 
    $(this).find("h2").text(note_title);
    $(this).find("p").text(note_content);
  }
});
$(document).ready(function () {
  all_notes = $("li a");
 
  all_notes.on("keyup", function () {
    note_title = $(this).find("h2").text();
    note_content = $(this).find("p").text();
 
    item_key = "list_" + $(this).parent().index();
 
    data = {
      title: note_title,
      content: note_content
    };
 
    window.localStorage.setItem(item_key, JSON.stringify(data));
  });
 
  all_notes.each(function (index) {
    data = JSON.parse(window.localStorage.getItem("list_" + index));
 
    if (data !== null) {
      note_title = data.title;
      note_content = data.content;
 
      $(this).find("h2").text(note_title);
      $(this).find("p").text(note_content);
    }
  });
});

