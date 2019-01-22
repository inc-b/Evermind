/* 
States variables used by multiple scripts for clarity
- Map seed and map rule are integers between 0 and 255 (ie, a byte)
*/

// CONSTANTS
var MAP_WIDTH = 64; // Map size is 8 * 8 (a byte expanded to make each bit a byte)
var MAP_HEIGHT = MAP_WIDTH;

// Variables
var mainArray = []; // Holds the local map

var defaultSeed = 16; // Math.floor(Math.random() * 255);
var defaultRule = 165; //Math.floor(Math.random() * 255);

var gamePaused = false;

var playerX = 32;
var playerY = 32;
var startX = 32;
var startY = 32;

/* Game modes are used to decide what to render and what inputs to listen for. 
Possible states:
	main: display the local map and let the player walk around
	map: display the system map and let the player navigate
	menu: display the game menu
*/
var gameState = 'main'; 
