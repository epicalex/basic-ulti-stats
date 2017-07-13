$(function() {
	var gameUUIDs = localStorage.getItem('gameUUIDs');
	var gameList = gameUUIDs.split(', ');

	$.each(gameList,function(i){
		$('.list-group').append('<a href="game.html?gameUUID=' + gameList[i] + '" class="list-group-item list-group-item-action">' + localStorage.getItem(gameList[i] + ' team1name') + ' vs ' + localStorage.getItem(gameList[i] + ' team2name') + '</a>');
	});
});