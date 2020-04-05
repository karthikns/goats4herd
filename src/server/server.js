var express = require("express");
var app = express();
var http = require("http").createServer(app);
var io = require("socket.io")(http);
const goatNames = require("./goat-names.json");

app.use(express.static(__dirname + "/../client"));

var port = 3000;
http.listen(port, function () {
    console.log("Listening on port: " + port);
});

const board = { width: 800, height: 600 };

var gameState = {
    players: {},
    goats: [],
};

function InitializeGameState() {
    for (var i = 0; i < 20; ++i) {
        var goat = {
            x: Math.random() * board.width,
            y: Math.random() * board.height,
            r: 10,
            color: "green",
            name: goatNames[Math.floor(Math.random() * goatNames.length)],
        };
        gameState.goats.push(goat);
    }
}
InitializeGameState();

function MovePlayer(player, distance) {
    if (player.input.left && player.x - player.r - distance > 0) {
        player.x -= distance;
    }
    if (player.input.up && player.y - player.r - distance > 0) {
        player.y -= distance;
    }
    if (player.input.right && player.x + player.r + distance < board.width) {
        player.x += distance;
    }
    if (player.input.down && player.y + player.r + distance < board.height) {
        player.y += distance;
    }
}

io.on("connection", function (socket) {
    console.log("A user connected");

    socket.on("disconnect", function () {
        delete gameState.players[socket.id];
        socket.emit("userDisconnect", socket.id);
        console.log("A user disconnected");
    });

    socket.on("new player", function () {
        gameState.players[socket.id] = {
            x: 300,
            y: 300,
            r: 10,
            color: "hsl(" + 360 * Math.random() + ", 50%, 50%)",
            name: `dawg_${socket.id}`,

            input: {
                left: false,
                right: false,
                top: false,
                bottom: false,
            },
        };

        io.to(socket.id).emit("board-setup", board);
    });

    socket.on("input", function (input) {
        var player = gameState.players[socket.id] || {};

        player.input.left = input.left;
        player.input.right = input.right;
        player.input.up = input.up;
        player.input.down = input.down;
    });
});

const playerSpeed = 300; // pixels per second

// Physics

// WARNING: DO NOT CHANGE THIS VALUE
const physicsInterval = 15; // milliseconds
var physicsTime = new Date();

// Keep logic to a minimal here
setInterval(function () {
    var newPhysicsTime = new Date();
    var actualInterval = newPhysicsTime - physicsTime;

    for (var id in gameState.players) {
        var player = gameState.players[id];
        // distance = velocity * time
        MovePlayer(player, (playerSpeed * actualInterval) / 1000);
    }

    physicsTime = newPhysicsTime;
}, physicsInterval);

// Render
const renderFps = 60;
const renderInterval = 1000 / renderFps;
setInterval(function () {
    io.sockets.emit("game-state", gameState);
}, renderInterval);
