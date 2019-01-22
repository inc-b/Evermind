/*
Set screen resolution, display content, etc
*/

// CONSTANTS
var TEST_COLOUR = 'purple';
var INACESSIBLE_COLOUR = 'grey';
var ACTIVE_CELL_COLOUR = 'black';
var INACTIVE_CELL_COLOUR = 'white';
var PLAYER_COLOUR = 'red';
var CANVAS_WIDTH = 0.4; // Width of the display area as a ratio of the actual screen width
var ASPECT_RATIO = 1; // Height of the display area as a ratio of the calculated display area width
var INFO_CONTAINER_SIZE = 0.6; // Set the width of the info container
var MARGIN = 0.1;

// Variables
var display;
var screenWidth;
var screenHeight;
var pixelSize = 2;

var initialiseDisplay = function() {
	// Calculate the screen size
	screenWidth = Math.floor(window.innerWidth) * CANVAS_WIDTH;
	screenHeight = Math.floor(window.innerHeight) * ASPECT_RATIO;
	
	// Grab the canvas to work on
	var ctx = document.getElementById('main-canvas');
	display = ctx.getContext('2d');
	
	// Set the canvas size
	display.canvas.width = screenWidth;
	display.canvas.height = screenHeight;
	
	// Set the size of pixels based on the screen size
	pixelSize = Math.floor(screenWidth / MAP_WIDTH);
	
	// Set the size and location of the info div
	var infoContainer = document.getElementById('info-container');
	infoContainer.style.width = (window.innerWidth - screenWidth) * INFO_CONTAINER_SIZE + 'px';
	infoContainer.style.height = screenHeight + 'px';
	infoContainer.style.top = '0px';
	infoContainer.style.left = (window.innerWidth * CANVAS_WIDTH) + (window.innerWidth * MARGIN) + 'px';
};

var renderMain = function() {
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
	display.fillStyle = PLAYER_COLOUR;
	display.fillRect(playerX * pixelSize, playerY * pixelSize, pixelSize, pixelSize);
};

var renderMap = function() {
	
};

var renderMenu = function() {
	
};

var renderStart = function() {
	
};