var socket = io();

var movement = {
    up: false,
    down: false,
    left: false,
    right: false
}

document.addEventListener('keydown', function (event) {
    switch (event.keyCode) {
        case 65: // A
            movement.left = true;
            break;
        case 87: // W
            movement.up = true;
            break;
        case 68: // D
            movement.right = true;
            break;
        case 83: // S
            movement.down = true;
            break;
    }
});
document.addEventListener('keyup', function (event) {
    switch (event.keyCode) {
        case 65: // A
            movement.left = false;
            break;
        case 87: // W
            movement.up = false;
            break;
        case 68: // D
            movement.right = false;
            break;
        case 83: // S
            movement.down = false;
            break;
    }
});

socket.emit('new player');
setInterval(function () {
    socket.emit('movement', movement);
}, 1000 / 60);

var canvasElement = document.getElementById("myCanvas");
canvasElement.width = 800;
canvasElement.height = 600;
var context = canvasElement.getContext("2d");

socket.on("game-state", function (players) {
    console.log(players);
    // player
    context.clearRect(0, 0, 800, 600);
    for (var id in players) {
        var player = players[id];
        //context.fillStyle = player.color;
        context.fillStyle = "hsl(' + 360 * Math.random() + ', 50 %, 50 %)";
        context.beginPath();
        context.arc(player.x, player.y, 10, 0, 2 * Math.PI);
        context.font = '50px';
        context.fillText(player.name, player.x - 70, player.y + 30);
        context.fill();
    }
});
