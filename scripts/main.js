/*
Main script
*/

// Setup the game
var loadGame = function() {
	generateMap(defaultSeed, defaultRule); // Generate the local map to start
	initialiseDisplay(); // Setup the display
	listenForInput(); // Listen for the various possible input types
	window.addEventListener('resize', initialiseDisplay, false); // Adjust the display if the window is resized
	var updater = setInterval(update,1); // Start calling the update function every millisecond
	showMain(); // Make sure the nav buttons are in the correct state
	document.getElementById('loading-container').style.display = 'none'; // Turn off the loading div once everything is loaded and ready
	
	////
	 // Turns off the intro screen so I don't have to click it every time while testing. REMOVE THIS LINE!
	// hideHelpScreen();
	////
	
};

var update = function() {
	// Render the main canvas
	render();
	
	// Run actions if the game isn't paused
	if(!gamePaused) {
		
	}
};

var showMain = function() {
	gameState = 'main';
	
	document.getElementById('main-button').className = 'inactive-nav-button';
	document.getElementById('map-button').className = 'nav-button';
	document.getElementById('menu-button').className = 'nav-button';
	
	document.getElementById('main-controls').style.display = 'block';
	document.getElementById('map-controls').style.display = 'none';
	document.getElementById('menu-controls').style.display = 'none';
	
	gamePaused = false;
};

var showMap = function() {
	gameState = 'map';
	
	document.getElementById('main-button').className = 'nav-button';
	document.getElementById('map-button').className = 'inactive-nav-button';
	document.getElementById('menu-button').className = 'nav-button';
	
	document.getElementById('main-controls').style.display = 'none';
	document.getElementById('map-controls').style.display = 'block';
	document.getElementById('menu-controls').style.display = 'none';
	
	gamePaused = true;
};

var showMenu = function() {
	gameState = 'menu';
	
	document.getElementById('main-button').className = 'nav-button';
	document.getElementById('map-button').className = 'nav-button';
	document.getElementById('menu-button').className = 'inactive-nav-button';
	
	document.getElementById('main-controls').style.display = 'none';
	document.getElementById('map-controls').style.display = 'none';
	document.getElementById('menu-controls').style.display = 'block';
	
	gamePaused = true;
};