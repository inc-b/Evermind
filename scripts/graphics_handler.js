/*
Set screen resolution, display content, etc
*/

// CONSTANTS
var TEST_COLOUR = 'purple';
var INACESSIBLE_COLOUR = 'grey';
var ACTIVE_CELL_COLOUR = 'black';
var INACTIVE_CELL_COLOUR = 'white';
var PLAYER_COLOUR = 'red';
var BUTTON_COLOUR = 'blue';
var BUTTON_TEXT = 'white';
var MAIN_CANVAS_WIDTH = .5; // Width of the main display area as a ratio of the actual screen width
var MAIN_CANVAS_ASPECT_RATIO = 1; // Height of the main display area as a ratio of the calculated display area width
var PIXEL_SIZE = 1; // Size modifier for pixels on the local map
var MARGIN = 0.05; // Margin width as a percentage of screen width
var FONT_SIZE = 0.05; // Font height as a percentage of screen height
var HELP_BUTTON_SIZE = 0.1; // Width and height of the help button as a percentage of the screen height

// Variables
var display;
var screenWidth;
var screenHeight;
var pixelSize;

// Setup the canvasses and adjust layout
var initialiseDisplay = function() {
	// Calculate the screen size
	screenWidth = Math.floor(window.innerWidth * MAIN_CANVAS_WIDTH);
	screenHeight = Math.floor(screenWidth * MAIN_CANVAS_ASPECT_RATIO);
	
	// Grab the canvasses to work on
	var ctx = document.getElementById('main-canvas');
	display = ctx.getContext('2d');
	
	// Set the canvas sizes
	display.canvas.width = screenWidth;
	display.canvas.height = screenHeight;
	
	// Set the size of pixels based on the screen size
	pixelSize = Math.floor(PIXEL_SIZE * (display.canvas.width / MAP_WIDTH));

	// Set the default font size
	document.getElementById('main-container').style.fontSize = Math.floor(screenHeight * FONT_SIZE) + 'px';
};

// Main render function
var render = function() {
	// CLS
	display.fillStyle = 'black';
	display.fillRect(0,0,screenWidth,screenHeight);

	// Render graphics to the main canvas based on game's current state
	switch(gameState) {
		case 'map':
			// Display the navigation map
			renderMap();
			break;
		case 'main':
			// Display the local map
			renderMain();
			break;
		case 'menu':
			// Display the 'system' menu
			renderMenu();
			break;
	}
};

// Render the local map to the main canvas
var renderMain = function() {
	// Render the map
	for (var col = 0; col < MAP_WIDTH; col++) {
		for (var row = 0; row < MAP_HEIGHT; row++) {
			var cellValue = mainArray[col][row];
			display.fillStyle = INACESSIBLE_COLOUR;
			if (cellValue == '1') {
				display.fillStyle = ACTIVE_CELL_COLOUR;
			} else if (cellValue == '2') {
				display.fillStyle = INACTIVE_CELL_COLOUR;
			}
			display.fillRect(col * pixelSize,row * pixelSize,pixelSize,pixelSize);
		}
	}
	
	// Place the player
	display.fillStyle = PLAYER_COLOUR;
	display.fillRect(playerX * pixelSize, playerY * pixelSize, pixelSize, pixelSize);
};

// Render the system map to the main canvas
var renderMap = function() {
	display.fillStyle = 'green';
	display.fillRect(0,0,screenWidth,screenHeight / 2);
};

// Render the menu to the main canvas
var renderMenu = function() {
	display.fillStyle = 'red';
	display.fillRect(0,0,50,50);
};

// Render a button to the main canvas
var drawButton = function(xPos, yPos, buttonWidth, buttonHeight, buttonText) {
	display.fillStyle = BUTTON_COLOUR;
	display.fillRect(xPos, yPos, buttonWidth, buttonHeight);
	display.fillStyle = BUTTON_TEXT;
	display.fillText(xPos, yPos, buttonText);
};

var hideHelpScreen = function(){
	document.getElementById('start-container').style.display = 'none';
};

var showHelpScreen = function() {
	document.getElementById('start-container').style.display = 'block';
};