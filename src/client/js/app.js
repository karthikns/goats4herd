var socket = io();

var input = {
    up: false,
    down: false,
    left: false,
    right: false,
};


function KeyEvent(keyCode, isKeyPressed) {
    switch (keyCode) {
        case 37: // Arrow Left
        case 65: // A
            input.left = isKeyPressed;
            SendInputToGame();
            break;
        case 38: // Arrow Up
        case 87: // W
            input.up = isKeyPressed;
            SendInputToGame();
            break;
        case 39: // Arrow Right
        case 68: // D
            input.right = isKeyPressed;
            SendInputToGame();
            break;
        case 40: // Arrow Down
        case 83: // S
            input.down = isKeyPressed;
            SendInputToGame();
            break;
    }
}

function RenderDog(dog, context) {
    context.fillStyle = dog.color;
    context.beginPath();
    context.arc(dog.x, dog.y, dog.r, 0, 2 * Math.PI);
    context.font = "10px Verdana";
    context.textAlign = "center";
    context.fillText(dog.name, dog.x, dog.y + 30);
    context.fill();
}

function RenderGoat(goat, context) {
    context.fillStyle = goat.color;
    context.beginPath();
    context.arc(goat.x, goat.y, goat.r, 0, 2 * Math.PI);
    context.font = "10px Verdana";
    context.textAlign = "center";
    context.fillText(goat.name, goat.x, goat.y + 2.5 * goat.r);
    context.fill();
}

function RenderGoalPost(goalPost, context) {
    context.fillStyle = goalPost.color;
    context.beginPath();
    context.arc(goalPost.x, goalPost.y, goalPost.r, 0, 2 * Math.PI);
    context.fill();

    // Display scores on the goal posts
    context.font = `${goalPost.r / 3}px Verdana`;
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillStyle = "white";

    const score = goalPost.numberOfGoatsTouched;
    const x = goalPost.x;
    const y = goalPost.y;
    const correction = goalPost.r / 2.5;
    // Hack to add the score 4 times, once for each quadrant
    context.fillText(score, x + correction, y + correction);
    context.fillText(score, x + correction, y - correction);
    context.fillText(score, x - correction, y + correction);
    context.fillText(score, x - correction, y - correction);
}

function Render(world) {
    var canvasElement = document.getElementById("myCanvas");
    var context = canvasElement.getContext("2d");
    context.clearRect(0, 0, canvasElement.width, canvasElement.height);

    for (var dogId in world.dogs) {
        RenderDog(world.dogs[dogId], context);
    }

    for (var goatIndex in world.goats) {
        RenderGoat(world.goats[goatIndex], context);
    }

    for (var goalPostIndex in world.goalPosts) {
        RenderGoalPost(world.goalPosts[goalPostIndex], context);
    }
}

function UserDisconnect(disconnectedDogId) {
    var dog = renderState.dogs[disconnectedDogId];
    context.save();
    context.globalCompositeOperation = "destination-out";
    context.beginPath();
    context.arc(dog.x, dog.y, dog.r, 0, 2 * Math.PI, false);
    context.fill();
    context.restore();
}

function BoardSetup(board) {
    var canvasElement = document.getElementById("myCanvas");
    canvasElement.hidden = false;
    canvasElement.width = board.width;
    canvasElement.height = board.height;

    var canvasElement = document.getElementById("lobbyElement");
    canvasElement.hidden = true;
}

function ListenInputToGame() {
    document.addEventListener("keydown", function (event) {
        KeyEvent(event.keyCode, true);
    });
    
    document.addEventListener("keyup", function (event) {
        KeyEvent(event.keyCode, false);
    });
}

function LobbyStart(){
    var dogName = document.getElementById("dogNameElement").value;
    socket.emit("game-new-player", dogName);
}

function SendInputToGame() {
    socket.emit("game-input", input);
}

socket.on("disconnect", function () {
    socket.disconnect();
});

socket.on("game-render", function (gameState) {
    Render(gameState);
});

socket.on("game-user-disconnect", function (disconnectedDogId) {
    UserDisconnect(disconnectedDogId);
});

socket.on("game-board-setup", function (board) {
    BoardSetup(board);
    ListenInputToGame();
});