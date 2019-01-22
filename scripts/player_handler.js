var movePlayer = function(inputX,inputY){
	var newX = playerX + inputX;
	var newY = playerY + inputY;
	if (mainArray[newX][newY] == '2') {
		playerX = newX;
		playerY = newY;
	}
}