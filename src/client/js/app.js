var socket = io();

var movement = {
    up: false,
    down: false,
    left: false,
    right: false,
};

document.addEventListener("keydown", function (event) {
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

document.addEventListener("keyup", function (event) {
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

socket.emit("new player");
setInterval(function () {
    socket.emit("movement", movement);
}, 1000 / 60);

var canvasElement = document.getElementById("myCanvas");
var context = canvasElement.getContext("2d");

function RenderPlayer(player, context) {
    context.fillStyle = player.color;
    context.beginPath();
    context.arc(player.x, player.y, player.r, 0, 2 * Math.PI);
    context.font = "50px";
    context.textAlign = "center";
    context.fillText(player.name, player.x, player.y + 30);
    context.fill();
}

function RenderGoat(goat, context) {
    context.fillStyle = goat.color;
    context.beginPath();
    context.arc(goat.x, goat.y, goat.r, 0, 2 * Math.PI);
    context.font = "50px";
    context.textAlign = "center";
    context.fillText(goat.name, goat.x, goat.y + 2.5 * goat.r);
    context.fill();
}

socket.on("disconnect", function () {
    socket.disconnect();
});

socket.on("game-state", function (gameState) {
    context.clearRect(0, 0, 800, 600);

    for (var id in gameState.players) {
        RenderPlayer(gameState.players[id], context);
    }

    for (var goatIndex in gameState.goats) {
        RenderGoat(gameState.goats[goatIndex], context);
    }
});

socket.on("userDisconnect", function (gameState) {
    var player = gameState.players[playerId];
    context.save();
    context.globalCompositeOperation = "destination-out";
    context.beginPath();
    context.arc(player.x, player.y, player.r, 0, 2 * Math.PI, false);
    context.fill();
    context.restore();
});

socket.on("board-setup", function (board) {
    canvasElement.hidden = false;
    canvasElement.width = board.width;
    canvasElement.height = board.height;
});
