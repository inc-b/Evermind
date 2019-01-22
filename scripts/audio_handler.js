/*
Controls audio for the page
*/

var mainLoop;

var jukebox = function() {
	mainLoop = document.getElementById('main-loop');
	mainLoop.play();
};