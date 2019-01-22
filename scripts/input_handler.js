/*
Reads input via various methods (eg, keys, mouse, touch, gamepad) into a standard format.
Not bothering with gamepad yet, but it'll be a nice addition later!
*/

var listenForInput = function() {
	document.addEventListener("mouseup", mouseClick, false);
};

var mouseClick = function(e) {
	
	if (!gameRunning) {
		gameRunning = true;
		startGame();
	}
	
	switch(gameState) {
		case 'start':
			// Displaying general info before playing
			startInputMouse(e.pageX, e.pageY);
			break;
		case 'menu':
			// Displaying the 'system' menu
			menuInputMouse(e.pageX, e.pageY);
			break;
		case 'main':
			// Displaying the local map
			mainInputMouse(e.pageX,e.pageY);
			break;
		case 'map':
			// Displaying the navigation map
			mapInputMouse(e.pageX, e.pageY);
			break;
	}
};

var mainInputMouse = function(mouseX, mouseY){
	
};

var menuInputMouse = function(mouseX, mouseY){
	
};

var startInputMouse = function(mouseX, mouseY){
	document.getElementById('start-container').style.display = 'none';
	gameState = 'main';
};

var mapInputMouse = function(mouseX, mouseY){
	
};