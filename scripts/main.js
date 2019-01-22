/*
Main script
*/

// Setup the game
var loadGame = function() {
	generateMap(defaultSeed, defaultRule); // Need to generate the local map to start
	initialiseDisplay();
	listenForInput();
	var updater = setInterval(update,1); // Start calling the update function every millisecond
	document.getElementById('loading-container').style.display = 'none'; // Turn off the loading div once everything is loaded and ready
	
	////
	 // Turns off the intro screen so I don't have to click it every time while testing. REMOVE THIS LINE!
	hideHelpScreen();
	////
	
};

var update = function() {
	// Render the main canvas
	render();
	
	// Run actions if the game isn't paused
	if(!gamePaused) {
		
	}
};

var showMap = function() {
	gameState = 'map';
};

var showMenu = function() {
	gameState = 'menu';
};