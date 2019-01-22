/*
Main script
*/

// CONSTANTS

// Variables

var loadGame = function() {
	generateMap(defaultSeed, defaultRule);
	initialiseDisplay();
	listenForInput();
	startGame();
	var updater = setInterval(update,1);
};

var startGame = function() {
	document.getElementById('loading-container').style.display = 'none';
	// jukebox();
};

var update = function() {
	switch(gameState) {
		case 'start':
			// Display instructions etc
			renderStart();
			break;
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