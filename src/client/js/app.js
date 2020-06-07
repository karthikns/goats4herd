import io from "socket.io-client";

const socket = io({ reconnection: false });

var gameDesiredDimensions = { width: 0, height: 0 };
var canvasElement = document.getElementById("myCanvas");
var context = canvasElement.getContext("2d");
var scalingRatio = 1;

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
            SendKeyInputToGame();
            break;
        case 38: // Arrow Up
        case 87: // W
            input.up = isKeyPressed;
            SendKeyInputToGame();
            break;
        case 39: // Arrow Right
        case 68: // D
            input.right = isKeyPressed;
            SendKeyInputToGame();
            break;
        case 40: // Arrow Down
        case 83: // S
            input.down = isKeyPressed;
            SendKeyInputToGame();
            break;
    }
}

function RenderDog(dog, context) {
    dog.x *= scalingRatio;
    dog.y *= scalingRatio;
    dog.r *= scalingRatio;

    context.fillStyle = dog.color;
    context.beginPath();
    context.arc(dog.x, dog.y, dog.r, 0, 2 * Math.PI);
    context.font = `${dog.r}px Verdana`;
    context.textAlign = "center";
    context.fillText(dog.name, dog.x, dog.y + 2.5 * dog.r);
    context.fill();
}

function RenderGoat(goat, context) {
    goat.x *= scalingRatio;
    goat.y *= scalingRatio;
    goat.r *= scalingRatio;

    context.fillStyle = goat.color;
    context.beginPath();
    context.arc(goat.x, goat.y, goat.r, 0, 2 * Math.PI);
    context.font = `${goat.r}px Verdana`;
    context.textAlign = "center";
    context.fillText(goat.name, goat.x, goat.y + 2.5 * goat.r);
    context.fill();
}

function RenderGoalPost(goalPost, context) {
    goalPost.x *= scalingRatio;
    goalPost.y *= scalingRatio;
    goalPost.r *= scalingRatio;

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

function SetCanvasSize(canvasElement, gameDesiredDimensions) {
    let width = window.innerWidth - 50;
    let height = window.innerHeight - 150;

    const aspectRatio =
        gameDesiredDimensions.width / gameDesiredDimensions.height;
    if (width / height > aspectRatio) {
        width = height * aspectRatio;
    } else {
        height = width / aspectRatio;
    }

    // If the width is less than 10% of the desired width
    // revert to the server specified defaults
    if (width < 0.1 * gameDesiredDimensions.width) {
        width = gameDesiredDimensions.width;
        height = gameDesiredDimensions.height;
    }

    scalingRatio = width / gameDesiredDimensions.width;

    canvasElement.width = width;
    canvasElement.height = height;
}

function BoardSetup(board) {
    canvasElement.hidden = false;

    gameDesiredDimensions = board;
    SetCanvasSize(canvasElement, board);

    if (window.addEventListener) {
        window.addEventListener(
            "resize",
            function () {
                SetCanvasSize(canvasElement, gameDesiredDimensions);
            },
            true
        );
    }

    let lobbyElement = document.getElementById("lobbyElement");
    lobbyElement.hidden = true;
}

function ListenInputToGame() {
    document.addEventListener("keydown", function (event) {
        KeyEvent(event.keyCode, true);
    });

    document.addEventListener("keyup", function (event) {
        KeyEvent(event.keyCode, false);
    });
}

function LobbyStart() {
    var dogName = document.getElementById("dogNameElement").value;

    let teamSelectElement = document.getElementById("teamSelectElement");
    let team = teamSelectElement.options[teamSelectElement.selectedIndex].value;

    socket.emit("game-new-player", dogName, team);
}

window.LobbyStart = LobbyStart;

function SendKeyInputToGame() {
    socket.emit("game-key-input", input);
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
