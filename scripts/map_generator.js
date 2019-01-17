// Generates a map and stores it in an array

/* NOTES
	All arrays are listed in row / column ordering. ie, select a row and read a value in that row.
*/

// CONSTANTS
var MAP_WIDTH = 64; // Map size is 8 * 8 (a byte expanded to make each bit a byte)
var MAP_HEIGHT = MAP_WIDTH;

// Variables
var mainArray = [];
var holdingArray = [];

var mapSeed = 165; // Integer value between 0 and 255
var mapRule = 62; // Interger value between 0 and 255

// UTILITY FUNCTIONS
// convert decimal integer to binary string
var decToBin = function(val) {
	var bits = [];
	for (var i = 0; i < 8; i++) {
		bits.push(val % 2);
		val = (val - val % 2)/2;
	}
	bits.reverse();
	return bits.join("");
};

// Check the state of the neighbours and return a result based on the map rule
var checkNeighbours1D = function(row,col) {
	
	// Set default values for this cell and it's neighbours
	var thisCell = mainArray[row][col];
	var leftCell = "0";
	var rightCell = "0";
	
	// Set actual values for the neighbours
	if (col == 0) {
		leftCell = "0";
		rightCell = mainArray[row][col + 1];
	} else if (col == MAP_WIDTH - 1) {
		leftCell = mainArray[row][col - 1];
		rightCell = "0";
	} else {
		leftCell = mainArray[row][col - 1];
		rightCell = mainArray[row][col + 1];
	}
	
	// Convert cell values to integers
	leftCell = parseInt(leftCell,10) * 4;
	thisCell = parseInt(thisCell,10) * 2;
	rightCell = parseInt(rightCell,10);
	
	// Select the appropriate result from the map rule based on the state of the three cells being checked.
	// Default value is 7 (or 111 in binary). Different cell states can modify the default value by subtracting the equivalent decimal value of the binary digit being checked
	var returnCharAt = 7 - leftCell - thisCell - rightCell;
	return mapRule.charAt(returnCharAt);
};

var getMap = function() {
	return mainArray;
};

// MAIN FUNCTIONS
var generateMap = function() {
	// Convert seed and rule to binary strings
	mapSeed = decToBin(mapSeed);
	mapRule = decToBin(mapRule);
	
	// Initialise the main and holding arrays
	for (var row = 0; row < MAP_HEIGHT; row++) {
		mainArray[row] = [];
		for (var col = 0; col < MAP_WIDTH; col++) {
			mainArray[row][col] = 0;
		}
	}
	
	holdingArray = mainArray;
	
	fillArray();
	// smoothArray();
	// createLandingArea();
};

var fillArray = function() {
	// Expand seed
	var firstLine = "";
	for (var i = 0; i < 8; i++) {
		var currentBit = mapSeed.charAt(i);
		if (currentBit == "1") {
			firstLine = firstLine + mapSeed;
		} else {
			firstLine = firstLine + "00000000";
		}
	}
	// Fill first line of main array
	for (var col = 0; col < MAP_WIDTH; col ++) {
		mainArray[0][col] = firstLine.charAt(col);
	}
	
	// Run elementary CA using the rule to fill the remainder of the main array
	for (var row = 0; row < MAP_HEIGHT - 1; row++) {
		for (var col = 0; col < MAP_WIDTH; col++) {
			mainArray[row + 1][col] = checkNeighbours1D(row,col);
		}
	}
	
	// Draw a border around the main array	
};

/*
3) Smooth array
3.1 - process each cell and store the results in the holding array
3.2 - move the holding array values into the main array

4) Create landing area
4.1 - select the landing site
4.2 - draw the landing pad in the main array
4.3 - run an a* fill algorithm from the landing site in the main array
*/