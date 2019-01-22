/*
Reads input via various methods (eg, keys, mouse, touch, gamepad) into a standard format.
Not bothering with gamepad yet, but it'll be a nice addition later!
*/

var listenForInput = function() {
	document.addEventListener("mouseup", mouseClick, false);
	document.addEventListener("keydown", buttonPress, false);
};

// Do things if the user clicks a mouse button
var mouseClick = function(e) {
	// Decide what to do based on the game's current state
	switch(gameState) {
		case 'menu':
			// Displaying the menu
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

// Do things if the user presses a key
var buttonPress = function(e){
	// Decide what to do based on the game's current state
	switch(gameState) {
		case 'menu':
			// Displaying the menu
			menuInputKey(e.keyCode);
			break;
		case 'main':
			// Displaying the local map
			mainInputKey(e.keyCode);
			break;
		case 'map':
			// Displaying the navigation map
			mapInputKey(e.keyCode);
			break;		
	}
};

// Read user input when showing the locale map
var mainInputMouse = function(mouseX, mouseY){	
};
var mainInputKey = function(keyCode){
	switch(keyCode){
		case 37:
			// left
			movePlayer(-1,0);
			break;
		case 39:
			// right
			movePlayer(1,0);
			break;
		case 38:
			// up
			movePlayer(0,-1);
			break;
		case 40:
			// down
			movePlayer(0,1);
			break;
	}
};

// Read user input when showing the menu
var menuInputMouse = function(mouseX, mouseY){
	gameState = 'main';
};
var menuInputKey = function(keyCode){
};

// Read user input when showing the system map
var mapInputMouse = function(mouseX, mouseY){
	// Check if player has clicked inside the map area
	if (mouseY < screenHeight / 2 && mouseX < screenWidth){
		// Check if the player has clicked the left or right side of the map
		if (mouseX < screenWidth / 2) {
			zoomIn(true);
		} else {
			zoomIn(false);
		}
	}
	
	// gameState = 'main';
};
var mapInputKey = function(keyCode){
};