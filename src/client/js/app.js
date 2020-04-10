var socket = io();

var input = {
    up: false,
    down: false,
    left: false,
    right: false,
};

document.addEventListener("keydown", function (event) {
    switch (event.keyCode) {
        case 65: // A
            input.left = true;
            break;
        case 87: // W
            input.up = true;
            break;
        case 68: // D
            input.right = true;
            break;
        case 83: // S
            input.down = true;
            break;
    }
});

document.addEventListener("keyup", function (event) {
    switch (event.keyCode) {
        case 65: // A
            input.left = false;
            break;
        case 87: // W
            input.up = false;
            break;
        case 68: // D
            input.right = false;
            break;
        case 83: // S
            input.down = false;
            break;
    }
});

const inputInterval = 5; // milliseconds
setInterval(function () {
    socket.emit("game-input", input);
}, inputInterval);

socket.emit("game-new-player");
var canvasElement = document.getElementById("myCanvas");
var context = canvasElement.getContext("2d");

function RenderDog(dog, context) {
    context.fillStyle = dog.color;
    context.beginPath();
    context.arc(dog.x, dog.y, dog.r, 0, 2 * Math.PI);
    context.font = "50px";
    context.textAlign = "center";
    context.fillText(dog.name, dog.x, dog.y + 30);
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

socket.on("game-render", function (gameState) {
    context.clearRect(0, 0, 800, 600);

    for (var dogId in gameState.dogs) {
        RenderDog(gameState.dogs[dogId], context);
    }

    for (var goatIndex in gameState.goats) {
        RenderGoat(gameState.goats[goatIndex], context);
    }
});

socket.on("game-user-disconnect", function (disconnectedDogId) {
    var dog = renderState.dogs[disconnectedDogId];
    context.save();
    context.globalCompositeOperation = "destination-out";
    context.beginPath();
    context.arc(dog.x, dog.y, dog.r, 0, 2 * Math.PI, false);
    context.fill();
    context.restore();
});

socket.on("game-board-setup", function (board) {
    canvasElement.hidden = false;
    canvasElement.width = board.width;
    canvasElement.height = board.height;
});
