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