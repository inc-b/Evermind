// CONSTANTS
// Set screen size based on window size
var CANVAS_WIDTH = Math.floor(window.innerHeight) * 0.8;
var CANVAS_HEIGHT = Math.floor(window.innerHeight) * 0.5;

// Resize the canvas containing div to the specified height and width
document.getElementById("canvas-container").style.width = CANVAS_WIDTH + "px";
document.getElementById("canvas-container").style.height = CANVAS_HEIGHT + "px";

// Various bits and pieces
var BYTE = 8; // The base unit we are working. Obviously a byte is 8, but this is just to keep everything neat (and might mean the maps can be made larger later?)
var EXPANSION = 2; // How many times the seed is "expanded"
var CELL_SIZE = Math.floor(CANVAS_WIDTH / 100); // How big to draw the cells on the main map
var SQUARE = BYTE * EXPANSION; // 8 (one byte) times the number of times the seed is expanded
var PAD_SIZE = BYTE; // Size of the landing pad
var ARRAY_COL = Math.pow(BYTE, EXPANSION); // How wide the locations are - 8 (one byte) to the power of how many times the seed is expanded
var ARRAY_ROW = Math.pow(BYTE, EXPANSION); // How tall the locations are - 8 (one byte) to the power of how many times the seed is expanded




// Visuals - colours, UI item locations, etc
// Basic colours
var bgColour = "#333333";
var textColour = "#FFFFFF";
var buttonColour = "#AA3333";
var wallColour = "#000000"
var closedAreaColour = "#696969";
var openAreaColour = "#FFFFFF";
var miniMapBGColour = "#333366";
var miniMapFGColour = "#666699";


// Button locations and sizes - the first three are the only ones that need to be edited, all the rest are based on them
var buttonWidth = CANVAS_WIDTH * 0.1;
var northButtonX = CANVAS_WIDTH * 0.75;
var northButtonY = CANVAS_HEIGHT * 0.6;

var buttonHeight = buttonWidth * 0.5;
var southButtonX = northButtonX;
var southButtonY = northButtonY + buttonHeight * 2;
var westButtonX = northButtonX - buttonWidth * 0.6;
var westButtonY = northButtonY + buttonHeight;
var eastButtonX = northButtonX + buttonWidth * 0.6;
var eastButtonY = westButtonY;
var localeButtonX = westButtonX;
var localeButtonY = northButtonY + buttonHeight * 3;

// Locale map location and size
var localeMapX = CANVAS_WIDTH * 0.75;
var localeMapY = CANVAS_HEIGHT * 0.4;
var localeMapSize = CANVAS_WIDTH * 0.006;

// Temporary button for randomising - can be removed once a map is created
var randomButtonX = CANVAS_WIDTH * 0.9;
var randomButtonY = CANVAS_WIDTH * 0.3;

// Canvas instantiation
// Create a variable for each of the canvasses created in the HTML
var layer1 = document.getElementById("layer1");
var ctx1 = layer1.getContext("2d");
ctx1.canvas.width = CANVAS_WIDTH;
ctx1.canvas.height = CANVAS_HEIGHT;

var layer2 = document.getElementById("layer2");
var ctx2 = layer2.getContext("2d");
ctx2.canvas.width = CANVAS_WIDTH;
ctx2.canvas.height = CANVAS_HEIGHT;

// Disable bicubic sampling on each layer, good for pixel art
ctx1.imageSmoothingEnabled = false; 
ctx2.imageSmoothingEnabled = false;




// Variables
// Config for smoothing automata
var iterations = 8; // "iterations" is used for smoothing automata but doesn't actually count iterations - the number of iterations of the smoothing algorithm is "caRule" divided by "iterations"
var crowding = 4; // Crowding value used for smoothing cellular automata

// Variables to hold location of landing pad - defaults to the middle of the map
var padX = Math.floor(ARRAY_COL / 2);
var padY = Math.floor(ARRAY_ROW / 2);

// Array to hold the location name information
var placeArray = [];

// Holding arrays
var map = [];
for (i=0; i < ARRAY_COL; i++)
{
  map[i] = [];
  for (j = 0; j < ARRAY_ROW; j++) {
    map[i][j] = 0;
  }
};

var tempArray = [];
for (i=0; i < ARRAY_COL; i++)
{
  tempArray[i] = [];
  for (j = 0; j < ARRAY_ROW; j++) {
    tempArray[i][j] = 0;
  }
};

// This will be used to make the walls varying heights - probably using Perlin noise. The idea is to have walls of random-ish heights, but repeatably random (ish). Right now, every location has walls that are the same random heights which are set when the page is first loaded. Eventually each location should have a unique height map.
var heightOffset =[]
for (i=0; i < ARRAY_COL; i++)
{
  heightOffset[i] = [];
  for (j = 0; j < ARRAY_ROW; j++) {
    heightOffset[i][j] = Math.random() * 16 + 32;
  }
};

// Initial Rule
var caRule = 165; // 45 = Sulpicius Gallus on Earth's Moon (good starting point), 64 to 95 = Mars, 165 is on Titan and just looks awesome

// Initial Seed
var caSeed = 16; // 16 puts a single pixel (almost) in the centre of the first line - ignoring smoothing and landing pad, this gives an elegant overview of the rule

// Strings to hold binary versions of the rule and seed
var binRule = "";
var binSeed = "";













// Main functions

// Run this once per array to set it up
var generateArray = function() {
  fillArray(); // Fill the array using by expanding the seed and running an elementary cellular automata using the rule
  findPlace(); // Figure out where we are
  makeLandingPad(); // Make a safe place to land
  smoothArray(); // Smooth the array
  floodFill(padX,padY); // Fill out the safe zone based on the landing pad location
};

// Fill array based on seed and rule - this is the big one. It takes in the seed, expands it into a larger seed (using the substitution rule explained above) and uses that to fill every column in the first row. Then it runs a 1d automata to fill the remaining rows of the array in turn. I should really do this with bitwise operations...
var fillArray = function () {
  // Convert the rule and seed to binary values
  binRule = decToBinary(caRule);
  binSeed = decToBinary(caSeed);
  
  // Expand the seed and fill the first row
  for (i = 0; i < BYTE; i++) {
    var fillHolder = binSeed.charAt(i);
    
    for (j = 0; j < BYTE; j++) {
      var valueHolder = 0;
      var filler = binSeed.charAt(j);
      
      if (fillHolder != "0" && filler !="0") {
        valueHolder = 1;
      }
      
      map[i*BYTE+j][0] = valueHolder;
        
    }  
  }  
  
  // Use the first row to fill the rest of the array
  for (i = 1; i < ARRAY_ROW; i++) {
    for (j = 0; j < ARRAY_COL; j++) {
      var valueHolder = 0;
      
      var cellState = checkNeighbours1D(j,i-1);
      
      var ruleState = binRule.charAt(cellState);
      
      if (ruleState !="0") {
        valueHolder = 1;
      }
            
      map[j][i] = valueHolder;
    }
  }
  
}

// Uses cellular automata to smooth the 2d array once generated
var smoothArray = function() {  
  for (z = 0; z < Math.floor(caRule/iterations); z++) {
    for (i = 0; i < ARRAY_COL; i++) {
      for (j = 0; j < ARRAY_ROW; j++) {
        var state = check2dNeighbours(i,j);
        if (state > crowding) {
          tempArray[i][j] = 1;
        }
        else
        {
          tempArray[i][j] = 0;
        }
      }
    }
    
    array = tempArray;
  }
};

// Set the name of the current place based on the rule. This is a huuuuuge and unecessary mess but it works for what it is. There are 256 possible locations that are named and each has 256 sub-locations which are unnamed.
// It stores each bit of the rule in an array (to save a few keystrokes), then checks each element of the array in turn to dig through the locations.
// Only some places are named, others are just blank.
// I might use this later to assign set colours to certain locations
var findPlace = function() {
  var ruleArray = [];
  
  for (i = 0; i < BYTE; i++) {
    ruleArray [i] = binRule.charAt(i);
  }
  
  for (i = 0; i < BYTE; i++) {
    placeArray[i] = "Unmapped";
  }
  
  if (ruleArray[0] == 0) {
    placeArray[0] = "Inner System";
    if (ruleArray[1] == 0) {
      placeArray[1] = "Earth";
      if (ruleArray[2] == 0) {
        placeArray[2] = "Earth";
        if (ruleArray[3] == 0) {
          placeArray[3] = "North";
          if (ruleArray[4] == 0) {
            placeArray[4] = "West";
            if (ruleArray[5] == 0) {
              placeArray[5] = "North America";
              if (ruleArray[6] == 0) {
                placeArray[6] = "Far West";
                if (ruleArray[7] == 0) {
                  placeArray[7] = "Taiga"; // 0
                } else {
                  placeArray[7] = "Slab City, CA";
                }
              } else {
                placeArray[6] = "Central";
                if (ruleArray[7] == 0) {
                  placeArray[7] = "Taiga"; // 2
                } else {
                  placeArray[7] = "Havasupai Reservation";
                }
              }
            } else {
              placeArray[5] = "Asia";
              if (ruleArray[6] == 0) {
                placeArray[6] = "";
                if (ruleArray[7] == 0) {
                  placeArray[7] = "Tokyo"; // 4
                } else {
                  placeArray[7] = "Osaka";
                }
              } else {
                placeArray[6] = "China";
                if (ruleArray[7] == 0) {
                  placeArray[7] = "Hong Kong"; // 6
                } else {
                  placeArray[7] = "Beijing";
                }
              }
            }
          } else {
            placeArray[4] = "East";
            if (ruleArray[5] == 0) {
              placeArray[5] = "Africa";
              if (ruleArray[6] == 0) {
                placeArray[6] = "North Africa";
                if (ruleArray[7] == 0) {
                  placeArray[7] = "Cairo"; // 8
                } else {
                  placeArray[7] = "Baghdad";
                }
              } else {
                placeArray[6] = "South Africa";
                if (ruleArray[7] == 0) {
                  placeArray[7] = "Harare"; // 10
                } else {
                  placeArray[7] = "Joburg";
                }
              }
            } else {
              placeArray[5] = "Europe";
              if (ruleArray[6] == 0) {
                placeArray[6] = "UK";
                if (ruleArray[7] == 0) {
                  placeArray[7] = "Wales"; // 12
                } else {
                  placeArray[7] = "London";
                }
              } else {
                placeArray[6] = "Russia";
                if (ruleArray[7] == 0) {
                  placeArray[7] = "Tunguska"; // 14
                } else {
                  placeArray[7] = "Moscow";
                }
              }
            }
          }
        } else {
          placeArray[3] = "South";
          if (ruleArray[4] == 0) {
            placeArray[4] = "West";
          if (ruleArray[5] == 0) {
              placeArray[5] = "South America";
              if (ruleArray[6] == 0) {
                placeArray[6] = "Brazil";
                if (ruleArray[7] == 0) {
                  placeArray[7] = "Manaus"; // 16
                } else {
                  placeArray[7] = "Rio de Janeiro";
                }
              } else {
                placeArray[6] = "Chile";
                if (ruleArray[7] == 0) {
                  placeArray[7] = "Santiago"; // 18
                } else {
                  placeArray[7] = "Punta Arenas";
                }
              }
            } else {
              placeArray[5] = "Pacific";
              if (ruleArray[6] == 0) {
                placeArray[6] = "Islands";
                if (ruleArray[7] == 0) {
                  placeArray[7] = "Fiji"; // 20
                } else {
                  placeArray[7] = "Easter Island";
                }
              } else {
                placeArray[6] = "Hawaii";
                if (ruleArray[7] == 0) {
                  placeArray[7] = "Honolulu"; // 22
                } else {
                  placeArray[7] = "Hilo";
                }
              }
            }
          } else {
            placeArray[4] = "East";
            if (ruleArray[5] == 0) {
              placeArray[5] = "Australia";
              if (ruleArray[6] == 0) {
                placeArray[6] = "Queensland";
                if (ruleArray[7] == 0) {
                  placeArray[7] = "Mt Isa"; // 24
                } else {
                  placeArray[7] = "Brisbane";
                }
              } else {
                placeArray[6] = "Victoria";
                if (ruleArray[7] == 0) {
                  placeArray[7] = "Grampians"; // 26
                } else {
                  placeArray[7] = "Melbourne";
                }
              }
            } else {
              placeArray[5] = "South East Asia";
              if (ruleArray[6] == 0) {
                placeArray[6] = "Papua New Guinea";
                if (ruleArray[7] == 0) {
                  placeArray[7] = "Sorong"; // 28
                } else {
                  placeArray[7] = "Port Moresby";
                }
              } else {
                placeArray[6] = "Indonesia";
                if (ruleArray[7] == 0) {
                  placeArray[7] = "Bali"; // 30
                } else {
                  placeArray[7] = "Dili";
                }
              }
            }
          }
        }
      } else {
        placeArray[2] = "Moon";
        if (ruleArray[3] == 0) {
          placeArray[3] = "North";
          if (ruleArray[4] == 0) {
            placeArray[4] = "Far Side";
          } else {
            placeArray[4] = "Earth Side";
            if (ruleArray[5] == 0) {
              placeArray[5] = "West";
              if (ruleArray[6] == 0){
                placeArray[6] = "Oceanus Procellarum";
                if (ruleArray[7] == 0){
                  placeArray[7] = "Lichtenberg";
                } else {
                  placeArray[7] = "Mons Rumker";
                }
              } else {
                  placeArray[6] = "Mare Imbrium";
                  if (ruleArray[7] == 0) {
                    placeArray[7] = "Timocharis"
                  } else {
                    placeArray[7] = "Archimedes";
                  }
              }
            } else {
              placeArray[5] = "East";
              if (ruleArray[6] == 0) {
                placeArray[6] = "Mare Serenitatis";
                if (ruleArray[7] == 0){
                  placeArray[7] = "Linne";
                } else {
                  placeArray[7] = "Sulpicius Gallus";
                }
              } else {
                placeArray[6] = "Mare Crisium";
                if (ruleArray[7] == 0){
                  placeArray[7] = "Picard";
                } else {
                  placeArray[7] = "Yorkos";
                }            
              }
            }
          }
        } else {
          placeArray[3] = "South";
          if (ruleArray[4] == 0) {
            placeArray[4] = "West";
          } else {
            placeArray[4] = "East";
          }
        }
      }
    } else {
      placeArray[1] = "Mars";
      if (ruleArray[2] == 0) {
        placeArray[2] = "Mars";
        if (ruleArray[3] == 0) {
          placeArray[3] = "Northern Lowlands";
          if (ruleArray[4] == 0) {
            placeArray[4] = "Lowlands West";
            if (ruleArray[5] == 0){
              placeArray[5] = "Western Plains";
              if (ruleArray[6] == 0){
                placeArray[6] = "Amazonia";
                if (ruleArray[7] == 0) {
                  placeArray[7] = "Amazon Desert"; // 64
                } else {
                  placeArray[7] = "Olympus Slopes"; 
                }
              } else {
                placeArray[6] = "Tharsis";
                if (ruleArray[7] == 0) {
                  placeArray[7] = "Tharsis Lava Plains"; // 66
                } else {
                  placeArray[7] = "Ascraeus Ruins";
                }
              }
            } else {
              placeArray[5] = "Chryse";
              if (ruleArray[6] == 0){
                placeArray[6] = "Lunae Palus";
                if (ruleArray[7] == 0) {
                  placeArray[7] = "Lunae Planum"; // 68
                } else {
                  placeArray[7] = "Kasei Valles";
                }
              } else {
                placeArray[6] = "Oxia Palus";
                if (ruleArray[7] == 0) {
                  placeArray[7] = "Pathfinder Islands "; // 70
                } else {
                  placeArray[7] = "Chryse Sea ";
                }
              }
            }
          } else {
            placeArray[4] = "Lowlands East";
            if (ruleArray[5] == 0) {
              placeArray[5] = "XXX";
              if (ruleArray[6] == 0){
                placeArray[6] = "Arabia";
                if (ruleArray[7] == 0) {
                  placeArray[7] = "Surface Warehouses"; // 72
                } else {
                  placeArray[7] = "Undercity";
                }
              } else {
                placeArray[6] = "Syrtis Major";
                if (ruleArray[7] == 0) {
                  placeArray[7] = "Nili Strip Mine"; // 74
                } else {
                  placeArray[7] = "Nili Patera Cave System";
                }
              }
            } else {
              placeArray[5] = "XXX";
              if (ruleArray[6] == 0){
                placeArray[6] = "Amenthes";
                if (ruleArray[7] == 0) {
                  placeArray[7] = "Port Cimmeria"; // 76
                } else {
                  placeArray[7] = "Commerce Hive";
                }
              } else {
                placeArray[6] = "Elysium";
                if (ruleArray[7] == 0) {
                  placeArray[7] = "Central Business Tunnels"; // 78
                } else {
                  placeArray[7] = "Residential Tunnels";
                }
              }
            }
          }
        } else {
          placeArray[3] = "Southern Highlands";
          if (ruleArray[4] == 0) {
            placeArray[4] = "Old Mars";
            if (ruleArray[5] == 0) {
              placeArray[5] = "Western Lava Fields";
              if (ruleArray[6] == 0){
                placeArray[6] = "Memnonia";
                if (ruleArray[7] == 0) {
                  placeArray[7] = "Daedalia Planum"; // 80
                } else {
                  placeArray[7] = "Terra Sirenum";
                }
              } else {
                placeArray[6] = "Phoenicis";
                if (ruleArray[7] == 0) {
                  placeArray[7] = "Syria Planum"; // 82
                } else {
                  placeArray[7] = "Noctis Labyrinthus";
                }
              }
            } else {
              placeArray[5] = "Central South";
              if (ruleArray[6] == 0){
                placeArray[6] = "Coprates";
                if (ruleArray[7] == 0) {
                  placeArray[7] = "Sinai Planum"; // 84
                } else {
                  placeArray[7] = "Ius Chasma";
                }
              } else {
                placeArray[6] = "Margaritifer"; 
                if (ruleArray[7] == 0) {
                  placeArray[7] = "Pearl Bay"; // 86
                } else {
                  placeArray[7] = "Xanthe City";
                }
              }
            }
          } else {
            placeArray[4] = "XXX";
            if (ruleArray[5] == 0) {
              placeArray[5] = "Huygens Surrounds";
              if (ruleArray[6] == 0){
                placeArray[6] = "Sabaeus";
                if (ruleArray[7] == 0) {
                  placeArray[7] = "Schiaperelli Crater"; // 88
                } else {
                  placeArray[7] = "Noachis Cave System";
                }
              } else {
                placeArray[6] = "Iapygia";
                if (ruleArray[7] == 0) {
                  placeArray[7] = "Huygens Caves"; // 90
                } else {
                  placeArray[7] = "Edge Craters";
                }
              }
            } else {
              placeArray[5] = "Hesperia";
              if (ruleArray[6] == 0){
                placeArray[6] = "Tyrrhenum";
                if (ruleArray[7] == 0) {
                  placeArray[7] = "Tyrrhenus Fossae"; // 92
                } else {
                  placeArray[7] = "Cimmeria Craters";
                }
              } else {
                placeArray[6] = "Aeolis";
                if (ruleArray[7] == 0) {
                  placeArray[7] = "Apollinaris City";
                } else {
                  placeArray[7] = "Cimmeria";
                }
              }
            }
          }
        }
      } else {
        placeArray[2] = "Deimos";
        if (ruleArray[3] == 0) {
          placeArray[3] = "North";
          if (ruleArray[4] == 0) {
            placeArray[4] = "West";
            if (ruleArray[5] == 0) {
              placeArray[5] = "XXX";
              if (ruleArray[6] == 0){
                placeArray[6] = "XXX";
                if (ruleArray[7] == 0) {
                  placeArray[7] = "XXX"; // 96
                } else {
                  placeArray[7] = "XXX";
                }
              } else {
                placeArray[6] = "XXX";
                if (ruleArray[7] == 0) {
                  placeArray[7] = "XXX";
                } else {
                  placeArray[7] = "XXX";
                }
              }
            } else {
              placeArray[5] = "XXX";
              if (ruleArray[6] == 0){
                placeArray[6] = "XXX";
                if (ruleArray[7] == 0) {
                  placeArray[7] = "XXX";
                } else {
                  placeArray[7] = "XXX";
                }
              } else {
                placeArray[6] = "XXX";
                if (ruleArray[7] == 0) {
                  placeArray[7] = "XXX";
                } else {
                  placeArray[7] = "XXX";
                }
              }
            }
          } else {
            placeArray[4] = "East";
          }
        } else {
          placeArray[3] = "South";
          if (ruleArray[4] == 0) {
            placeArray[4] = "West";
          } else {
            placeArray[4] = "East";
          }
        }
      }
    }
  } else {
    placeArray[0] = "Outer System";
    if (ruleArray[1] == 0) {
      placeArray[1] = "Saturnian System";
      if (ruleArray[2] == 0) {
        placeArray[2] = "Enceladus";
        if (ruleArray[3] == 0) {
          placeArray[3] = "North";
          if (ruleArray[4] == 0) {
            placeArray[4] = "West";
          } else {
            placeArray[4] = "East";
          }
        } else {
          placeArray[3] = "South";
          if (ruleArray[4] == 0) {
            placeArray[4] = "West";
          } else {
            placeArray[4] = "East";
          }
        }
      } else {
        placeArray[2] = "Titan";
        if (ruleArray[3] == 0) {
          placeArray[3] = "North";
          if (ruleArray[4] == 0) {
            placeArray[4] = "West";
			if (ruleArray[5] == 0) {
				placeArray[5] = "Dilmun";
				if (ruleArray[6] == 0) {
					placeArray[6] = "Caladan Planitia";
					if (ruleArray[7] == 0) {
						placeArray[7] = "Ice Desert";
					} else {
						placeArray[7] = "Richese Labyrinthus";
					}
				} else {
					placeArray[6] = "Plains";
					if (ruleArray[7] == 0) {
						placeArray[7] = "Tishtrya Virgae";
					} else {
						placeArray[7] = "Uanui Virgae";
					}
				}
			} else {
				placeArray[5] = "Aaru"
				if (ruleArray[6] == 0) {
					placeArray[6] = "Tollan Terra";
					if (ruleArray[7] == 0) {
						placeArray[7] = "Tollan clifftop Plains";
					} else {
						placeArray[7] = "The Infadibulated City of Paxi";
					}
				} else {
					placeArray[6] = "Kraken Mare";
					if (ruleArray[7] == 0) {
						placeArray[7] = "Kraken Wastes";
					} else {
						placeArray[7] = "Islets of Mayda";
					}
				}
			}
          } else {
            placeArray[4] = "East";
          }
        } else {
          placeArray[3] = "South";
          if (ruleArray[4] == 0) {
            placeArray[4] = "West";
          } else {
            placeArray[4] = "East";
          }
        }
      }
    } else {
      placeArray[1] = "Asteroid Belt";
      if (ruleArray[2] == 0) {
        placeArray[2] = "Vesta";
        if (ruleArray[3] == 0) {
          placeArray[3] = "North";
          if (ruleArray[4] == 0) {
            placeArray[4] = "West";
          } else {
            placeArray[4] = "East";
          }
        } else {
          placeArray[3] = "South";
          if (ruleArray[4] == 0) {
            placeArray[4] = "West";
          } else {
            placeArray[4] = "East";
          }
        }
      } else {
        placeArray[2] = "Ceres";
        if (ruleArray[3] == 0) {
          placeArray[3] = "North";
          if (ruleArray[4] == 0) {
            placeArray[4] = "West";
          } else {
            placeArray[4] = "East";
          }
        } else {
          placeArray[3] = "South";
          if (ruleArray[4] == 0) {
            placeArray[4] = "West";
          } else {
            placeArray[4] = "East";
          }
        }
      }
    }
  }
};

// Make sure there's a clear space in the middle of the map
var makeLandingPad = function() {
  
  // Set the landing pad location based on the seed  
  padX = Math.floor(ARRAY_COL / 2 + Math.log((caSeed + 1) / (caRule + 1)) * BYTE);
  padY = Math.floor(ARRAY_ROW / 2 + Math.log((caRule + 1) / (caSeed + 1)) * BYTE);
  if (padX < BYTE || padX > ARRAY_COL - BYTE) padX = ARRAY_COL / 2;
  if (padY < BYTE || padY > ARRAY_ROW - BYTE) padY = ARRAY_ROW / 2;
  
  for (i = -(PAD_SIZE / 2); i < (PAD_SIZE / 2); i++) {
    for (j = -(PAD_SIZE / 2); j < (PAD_SIZE / 2); j++) {
      // Set the landing pad location based on the seed
      
      map[padX + Math.floor(i)][padY + Math.floor(j)] = 0;
    }
  }
};

// Used for the simplest cellular automata
var checkNeighbours1D = function(col,row) {
  //Store the state of each cell
  var thisCell = map[col][row];
  var leftCell = 0;
  var rightCell = 0;
  
  if (col > 0) {
    leftCell = map[col-1][row];
  }
  
  if (col < ARRAY_COL - 1) {
    rightCell = map[col+1][row];
  }
  
  var cellRule = 7;
  
  if (leftCell == 1) {
    cellRule -=4;
  }
  
  if (thisCell == 1) {
    cellRule -= 2;
  }
  
  if (rightCell == 1) {
    cellRule --;
  }
  
  return cellRule;
};

// Converts a decimal number to a binary
var decToBinary = function(val) {
  var bits = [];
  for (var i = 0; i < BYTE; i++) {
    bits.push(val % 2);
    val = (val - val % 2)/2;
  }
  bits.reverse();
  return bits.join("");
};

// Checks neighbours for the 2d cellular automata
var check2dNeighbours = function(col,row) {
  var returnValue = 0;
  
  for (n = -1; n < 2; n++) {
    for (m = -1; m < 2; m++) {
      var nn = 0;
      var mm = 0;
      
      if (col > 1 && col < ARRAY_COL - 2) {
        nn = n;
      }
      
      if (row > 1 && row < ARRAY_ROW - 2) {
        mm = m;
      }
      
      var storedCell = map[col+nn][row+mm];
      
      returnValue += storedCell;

    }
  }
  
  return returnValue;
};

// Run this when the user clicks the mouse - takes a mouse event
var buttonPress = function(e) {
	// Keep track of whether anything actually changes
	var newData = false;
	
  // Calculate where the click was
  var canvasBounds = layer2.getBoundingClientRect();
  var mouse_X = e.pageX - canvasBounds.left;
  var mouse_Y = e.pageY - canvasBounds.top;
  
  // Set the direction we're moving in this locale
  var moveDirection = 0;
  
  // Which button (if any) has been clicked?
  // North and South buttons
  if (mouse_X > northButtonX && mouse_X < northButtonX + buttonWidth)  {
    if (mouse_Y > northButtonY && mouse_Y < northButtonY + buttonHeight){
      //NORTH
      moveDirection = -SQUARE;
	  newData = true;
    } else if (mouse_Y > southButtonY && mouse_Y < southButtonY + buttonHeight){
      //SOUTH
      moveDirection = SQUARE;
	  newData = true;
    }
  }
  
  // East and West buttons
  if (mouse_Y > westButtonY && mouse_Y < westButtonY + buttonHeight) {
    if (mouse_X > westButtonX && mouse_X < westButtonX + buttonWidth) {
      // WEST
      moveDirection = -1;
	  newData = true;
    } else if (mouse_X > eastButtonX && mouse_X < eastButtonX + buttonWidth) {
      // EAST
      moveDirection = 1;
	  newData = true;
    }
  }
  
  // Change Rule Button
  if (mouse_X > localeButtonX && mouse_X < localeButtonX + buttonWidth * 2 && mouse_Y > localeButtonY && mouse_Y < localeButtonY + buttonHeight) {
    // Change Rule
    caRule++;
	if(caRule == 256) caRule = 0;
	newData = true;
  }
  
  // Randomise button
  if (mouse_X > randomButtonX && mouse_X < randomButtonX + buttonHeight && mouse_Y > randomButtonY && mouse_Y < randomButtonY + buttonHeight) {
    caRule = Math.floor(Math.random() * 256);
    caSeed = Math.floor(Math.random() * 256);
	newData = true;
  }
  
  // Apply any movements
  moveLocation(moveDirection);

  // Run an update if anything has changed
  if (newData) {
	  update();
  }
};

var moveLocation = function (moveDirection) {
	//Check to make sure we won't leave the map with that move
	var newLocation = caSeed + moveDirection;
	// Top
	if (newLocation < 0 ) newLocation = caSeed;
	// Bottom
	if (newLocation > 255) newLocation = caSeed;
	// Left
	if (caSeed / SQUARE == Math.floor(caSeed / SQUARE) && moveDirection == -1) newLocation = caSeed;
	// right
	if ((caSeed + 1)/ SQUARE == Math.floor((caSeed + 1)/ SQUARE) && moveDirection == 1) newLocation = caSeed;
	
	// Make the new location the current location
	caSeed = newLocation;
};


// Flood fill function
var floodFill = function(x,y) {
  if (x < 0 || x == ARRAY_COL || y < 0 || y == ARRAY_ROW ) return;
  if (alreadyFilled(x,y)) return;
  
  fill(x,y);

  
  floodFill(x, y - 1);
  floodFill(x+1, y);
  floodFill(x, y+1);
  floodFill(x-1,y);
};

// Put a value in the specified cell of an array
var fill = function(x,y) {
  map[x][y] = 2;
};

// Check if a cell in the array already has a value
var alreadyFilled = function(x,y) {
  var tester = map[x][y];
  if (tester == 2 || tester == 1) {
    return true;
  }
  else
  {
    return false;
  }
}

// Offset a colour by an amount - used to change wall heights when drawing the map
var shadeColour = function(colour, offset) {
	// Pull out the R G B values in hex
	var tempR = colour.slice(1,3);
	var tempG = colour.slice(3,5);
	var tempB = colour.slice(5,7);
	
	// Convert those values to decimal and offset them (also, keep them inside the boundaries of what's possible)
	var tempR = Math.floor(parseInt(tempR, 16) + offset);
	if (tempR < 0) tempR = 0;
	if (tempR > 255) tempR = 255;
	var tempG = Math.floor(parseInt(tempG, 16) + offset);
	if (tempG < 0) tempR = 0;
	if (tempG > 255) tempG = 255;
	var tempB = Math.floor(parseInt(tempB, 16) + offset);
	if (tempB < 0) tempR = 0;
	if (tempB > 255) tempB = 255;
	
	// Convert the values back to hex (requires padding in some cases where there's only a single hex digit)
	var padding = "0";
	var tempR = tempR.toString(16);
	if (tempR.length == 1) tempR = padding.concat(tempR);
	var tempG = tempG.toString(16);
	if (tempG.length == 1) tempG = padding.concat(tempG);
	var tempB = tempB.toString(16);
	if (tempB.length == 1) tempB = padding.concat(tempB);
	
	// Glue the R G B values back into a complete hex colour string
	var newColour = "#" + tempR + tempG + tempB;

	return newColour;
}

// Update function
var update = function()
{
	// Fill the array
    generateArray()
	
	// Refresh data displayed
	showData();
    
    // Draw everything
   render();
};


// Draw function
var render = function()
{
	
  // CLS
  ctx1.clearRect(0, 0, ctx1.canvas.width, ctx1.canvas.height);
  ctx2.clearRect(0, 0, ctx2.canvas.width, ctx2.canvas.height);
  
  // Fill in the background
  ctx1.fillStyle = bgColour;
  ctx1.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  
  // Adjust and store colours
	var drawClosedAreaColour = closedAreaColour;
	var drawOpenAreaColour = openAreaColour;
    
  // Draw array
  for (i = 0; i < ARRAY_COL; i++) {
    for (j = 0; j < ARRAY_ROW; j++) {
      ctx2.fillStyle = drawClosedAreaColour;
      
      if (map[i][j] == 2) {
        ctx2.fillStyle = drawOpenAreaColour;
      }
      else if (map[i][j] == 1) {
		var drawWallColour = shadeColour(wallColour, heightOffset[i][j]);
        ctx2.fillStyle = drawWallColour;
      }
      ctx2.fillRect(i * CELL_SIZE, j * CELL_SIZE, CELL_SIZE, CELL_SIZE);
    }
  }
  
  // Draw locale map
  var checkSpot = 0;
  for (i = 0; i < 16; i++) {
    for (j = 0; j < 16; j++) {
      if (checkSpot == caSeed) {
        ctx2.fillStyle = miniMapFGColour;
        ctx2.fillRect(localeMapX + j * localeMapSize, localeMapY + i * localeMapSize, localeMapSize,localeMapSize);
      } else {
        ctx2.fillStyle = miniMapBGColour;
        ctx2.fillRect(localeMapX + j * localeMapSize, localeMapY + i * localeMapSize, localeMapSize,localeMapSize);
      }
      checkSpot++;
    }
  }
  
  // Draw the movement buttons
  ctx2.fillStyle = buttonColour;
  ctx2.fillRect(northButtonX, northButtonY, buttonWidth, buttonHeight);
  ctx2.fillRect(southButtonX, southButtonY, buttonWidth, buttonHeight);
  ctx2.fillRect(westButtonX, westButtonY, buttonWidth, buttonHeight);
  ctx2.fillRect(eastButtonX, eastButtonY, buttonWidth, buttonHeight);
  ctx2.fillRect(localeButtonX, localeButtonY, buttonWidth * 2, buttonHeight);
  ctx2.fillRect(randomButtonX, randomButtonY, buttonHeight, buttonHeight);
  ctx2.fillStyle = textColour;
  ctx2.font = CELL_SIZE * 2 + "px Courier";
  ctx2.fillText("NORTH", northButtonX + buttonWidth / 5, northButtonY + (buttonHeight + CELL_SIZE) / 2);
  ctx2.fillText("SOUTH", southButtonX + buttonWidth / 5, southButtonY + (buttonHeight + CELL_SIZE) / 2);
  ctx2.fillText("WEST", westButtonX + buttonWidth / 5, westButtonY + (buttonHeight + CELL_SIZE) / 2);
  ctx2.fillText("EAST", eastButtonX + buttonWidth / 5, eastButtonY + (buttonHeight + CELL_SIZE) / 2);
  ctx2.fillText("NEXT LOCALE", localeButtonX + buttonWidth / 3, localeButtonY + (buttonHeight + CELL_SIZE) / 2);
  ctx2.fillText("???", randomButtonX + buttonWidth / 11, randomButtonY + CELL_SIZE * 3);
  
  // Add general info text
  var textPos = CANVAS_HEIGHT / 20;
  var lineSize = CELL_SIZE * 2;
  var textOffset = CANVAS_WIDTH / 40;
  ctx2.font = lineSize / 1.5 + "px Courier";
  ctx2.fillText("Rule: "+ caRule, ARRAY_ROW * CELL_SIZE + textOffset, textPos);
  ctx2.fillText("Seed: "+ caSeed, ARRAY_ROW * CELL_SIZE + textOffset, textPos + lineSize);
  // for some reason this next line works ok at first but starts displaying the value of caRule instead of caRule/iterations on the third re-render. The problem only happens if the rule is not changed. No idea why...
  ctx2.fillText("Smoothing iterations (rule/"+ iterations +"): " + Math.floor(caRule/iterations), ARRAY_ROW * CELL_SIZE + textOffset, textPos + lineSize * 2);
  ctx2.fillText("Cell crowded if more than " + crowding + " neighbours", ARRAY_ROW * CELL_SIZE + textOffset, textPos + lineSize * 3);
  ctx2.fillText("CURRENT LOCATION: ", ARRAY_ROW * CELL_SIZE + textOffset, textPos + lineSize * 5);
  ctx2.fillText("Inner or Outer System....." + placeArray[0], ARRAY_ROW * CELL_SIZE + textOffset, textPos + lineSize * 6);
  ctx2.fillText("Planetary System......." + placeArray[1], ARRAY_ROW * CELL_SIZE + textOffset, textPos + lineSize * 7);
  ctx2.fillText("Body..................." + placeArray[2], ARRAY_ROW * CELL_SIZE + textOffset, textPos + lineSize * 8);
  ctx2.fillText("Hemisphere............." + placeArray[3], ARRAY_ROW * CELL_SIZE + textOffset, textPos + lineSize * 9);
  ctx2.fillText("Demisphere............." + placeArray[4], ARRAY_ROW * CELL_SIZE + textOffset, textPos + lineSize * 10);
  ctx2.fillText("Area..................." + placeArray[5], ARRAY_ROW * CELL_SIZE + textOffset, textPos + lineSize * 11);
  ctx2.fillText("Quadrangle............." + placeArray[6], ARRAY_ROW * CELL_SIZE + textOffset, textPos + lineSize * 12);
  ctx2.fillText("Locale................." + placeArray[7], ARRAY_ROW * CELL_SIZE + textOffset, textPos + lineSize * 13);

};


// Start the game
var gameReady = false; //Game is not ready
var makeReady = function(){gameReady = true}; //Flag the game as ready when this function is run
window.onload = makeReady(); //Run the make ready function when the page loads
if (gameReady)
{
  // Start listening for input
  document.addEventListener("mouseup", buttonPress, false);

  // Start it up
  update();
};

