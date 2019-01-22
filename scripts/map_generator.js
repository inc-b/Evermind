/*
Generates a map and stores it in an array
*/

// CONSTANTS
var CROWDING_VALUE = 3;
var SMOOTHIHNG_ITERATIONS = 2;

// Variables
var mapSeed;
var mapRule;
var holdingArray = [];

// MAIN FUNCTIONS
var generateMap = function(seed, rule) {
	mapSeed = seed;
	mapRule = rule;
	
	// Convert seed and rule to binary strings
	mapSeed = decToBin(mapSeed);
	mapRule = decToBin(mapRule);
	
	// Initialise the main and holding arrays
	for (var col = 0; col < MAP_WIDTH; col++) {
		mainArray[col] = [];
		for (var row = 0; row < MAP_HEIGHT;row++) {
			mainArray[col][row] = 0;
		}
	}
	
	holdingArray = mainArray;
	
	fillArray();
	
	for (var smoothing = 0; smoothing < SMOOTHIHNG_ITERATIONS; smoothing++) {
		smoothArray();
	}
	
	// Draw a border around the main array	
	for (var col = 0; col < MAP_WIDTH; col++) {
		mainArray[col][0] = '1';
		mainArray[col][MAP_HEIGHT - 1] = '1';
	}
	for (var row = 0; row < MAP_HEIGHT; row++) {
		mainArray[0][row] = '1';
		mainArray[MAP_WIDTH - 1][row] = '1';
	}
	
	// Create Landing Pad (3 x 3 safe area so the player can always "land" in a map)
	for (var landingPadX = -1; landingPadX < 2; landingPadX++) {
		for (var landingPadY = -1; landingPadY < 2; landingPadY++) {
			mainArray[startX + landingPadX][startY + landingPadY] = '0';
		}
	}
	
	// Fill the map from the landing pad to find where the player can go
	floodFill(startX, startY);
};

var fillArray = function() {
	// Expand seed
	var firstLine = '';
	for (var i = 0; i < 8; i++) {
		var currentBit = mapSeed.charAt(i);
		if (currentBit == '1') {
			firstLine = firstLine + mapSeed;
		} else {
			firstLine = firstLine + '00000000';
		}
	}
	// Fill first line of main array
	for (var col = 0; col < MAP_WIDTH; col ++) {
		mainArray[col][0] = firstLine.charAt(col);
	}
	
	// Run elementary CA using the rule to fill the remainder of the main array
	for (var row = 0; row < MAP_HEIGHT - 1; row++) {
		for (var col = 0; col < MAP_WIDTH; col++) {
			mainArray[col][row + 1] = checkNeighbours1D(col, row);
		}
	}
	
	holdingArray = mainArray;
};

// Iterate over the array using a basic smoothing function
var smoothArray = function() {
	
	var cellNeighbourCount;
	
	for (var col = 0; col < MAP_WIDTH; col++) {
		for (var row = 0; row < MAP_HEIGHT; row++) {
			cellNeighbourCount = checkNeighbours2D(col, row);
			var newCellValue = '0';
			if (mainArray[col][row] == '0' && cellNeighbourCount > CROWDING_VALUE + 1) {
				// Not active, but has enough neighbours to become active
				newCellValue = '1';
			} else if (mainArray[col][row] == '1' && cellNeighbourCount > CROWDING_VALUE) {
				// Active and has enough neighbours to stay active
				newCellValue = '1';
			}
			holdingArray[col][row] = newCellValue;
		}
	}
	mainArray = holdingArray;
};

/*

4) Create landing area
4.1 - select the landing site
4.2 - draw the landing pad in the main array
4.3 - run an a* fill algorithm from the landing site in the main array
*/

// UTILITY FUNCTIONS
// convert decimal integer to binary string
var decToBin = function(val) {
	var bits = [];
	for (var i = 0; i < 8; i++) {
		bits.push(val % 2);
		val = (val - val % 2)/2;
	}
	bits.reverse();
	return bits.join('');
};

// Check the state of the neighbours and return a result based on the map rule
var checkNeighbours1D = function(col, row) {
	
	// Set default values for this cell and it's neighbours
	var thisCell = mainArray[col][row];
	var leftCell = '0';
	var rightCell = '0';
	
	// Set actual values for the neighbours
	if (col == 0) {
		leftCell = '0';
		rightCell = mainArray[col + 1][row];
	} else if (col == MAP_WIDTH - 1) {
		leftCell = mainArray[col - 1][row];
		rightCell = '0';
	} else {
		leftCell = mainArray[col - 1][row];
		rightCell = mainArray[col + 1][row];
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

// Check a cell's 8 neighbours and return a count of how many of those cells are active
var checkNeighbours2D = function(col, row) {
	
	var neighbourCount = 0;
	
	for (var xCheck = -1; xCheck < 2; xCheck++) {
		for (var yCheck = -1; yCheck < 2; yCheck++) {
			var colCheck = col + xCheck;
			var rowCheck = row + yCheck;
			if (colCheck < 0) {
				// Left edge, do nothing
			} else if (colCheck > MAP_WIDTH - 1) {
				// Right edge, do nothing
			} else if (rowCheck < 0) {
				// Top edge, do nothing
			} else if (rowCheck > MAP_HEIGHT - 1) {
				// Bottom edge, do nothing
			} else {
				if (mainArray[colCheck][rowCheck] == '1') {
					neighbourCount++;
				}
			}
		}
	}
	
	return neighbourCount;
};

// A* flood fill algorithm
var floodFill = function(x, y) {
	if (x < 0 || x == MAP_WIDTH || y < 0 || y == MAP_HEIGHT ) return;
	if (alreadyFilled(x,y)) return;
	
	fill(x,y);
	
	floodFill(x, y - 1);
	floodFill(x+1, y);
	floodFill(x, y+1);
	floodFill(x-1,y);
};

// Mark the specified cell as accessible
var fill = function(x,y) {
	mainArray[x][y] = '2';
};

// Check if a cell in the array is either inaccessible or has already been checked
var alreadyFilled = function(x,y) {
  var tester = mainArray[x][y];
  if (tester == '2' || tester == '1') {
    return true;
  } else {
    return false;
  }
}