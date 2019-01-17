var canvas;
var pixelSize = 3;

var start = function() {
	var ctx = document.getElementById('main-canvas');
	canvas = ctx.getContext('2d');
	canvas.canvas.width = 200;
	canvas.canvas.height = 200;
	generateMap();
	render();
};

var render = function() {
	canvas.fillStyle = "black";
	for (var row = 0; row < 64; row++) {
		for (var col = 0; col < 64; col++) {
			var cellValue = mainArray[row][col];
			if (cellValue == "1") {
				canvas.fillRect(col * pixelSize,row * pixelSize,pixelSize,pixelSize);
			}
		}
	}
	canvas.fillStyle = "red";
	canvas.fillRect(64 * pixelSize,64 * pixelSize, pixelSize, pixelSize);
};