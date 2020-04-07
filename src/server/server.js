var express = require("express");
var app = express();
var http = require("http").createServer(app);
var io = require("socket.io")(http);

var GoatDiagnostics = require("./lib/goat-diagnostics");
var GoatMath = require("./lib/goat-math");
const goatNames = require("./goat-names.json");

app.use(express.static(__dirname + "/../client"));

const port = 3000;
http.listen(port, function () {
    console.log("Listening on port: " + port);
});

// These constants should move to a config file
const playerSpeed = 300; // pixels per second
const goatSpeed = 20; // pixels per second
const goatDogDistance = 60; // How far do goats try to stay away from dogs?

const board = { width: 800, height: 600 };

var gameState = {
    players: {},
    goats: [],
};

const goatDogDistanceSquare = goatDogDistance * goatDogDistance;

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

function DontAllowPlayerToGoBeyondTheBoard(player) {
    if (player.x - player.r < 0) {
        player.x = player.r;
    }

    if (player.y - player.r < 0) {
        player.y = player.r;
    }

    if (player.x + player.r > board.width) {
        player.x = board.width - player.r;
    }

    if (player.y + player.r > board.height) {
        player.y = board.height - player.r;
    }
}

function MovePlayer(player, distanceToMove) {
    var moveTo = { x: player.x, y: player.y };
    if (player.input.left) {
        moveTo.x += -1;
    }
    if (player.input.up) {
        moveTo.y += -1;
    }
    if (player.input.right) {
        moveTo.x += 1;
    }
    if (player.input.down) {
        moveTo.y += 1;
    }

    const moveDelta = GoatMath.CalculateMoveDelta(
        { x: player.x, y: player.y },
        moveTo,
        distanceToMove
    );

    player.x += moveDelta.x;
    player.y += moveDelta.y;

    DontAllowPlayerToGoBeyondTheBoard(player);
}

function MovePlayers(players, distanceToMove) {
    for (var id in players) {
        MovePlayer(players[id], distanceToMove);
    }
}

function MoveGoatAwayFromPlayers(goat, players, distance) {
    for (var id in players) {
        var player = players[id];

        var actualGoatDogDistanceSquare = GoatMath.DistanceSquare(
            goat.x,
            goat.y,
            player.x,
            player.y
        );

        if (actualGoatDogDistanceSquare < goatDogDistanceSquare) {
            const delta = GoatMath.CalculateMoveDelta(
                { x: goat.x, y: goat.y },
                { x: player.x, y: player.y },
                distance
            );

            goat.x -= delta.x;
            goat.y -= delta.y;
        }
    }
}

function MoveGoatTowardsCenter(goats, distance) {
    var center = { x: 0, y: 0 };
    center.x = 0;
    center.y = 0;
    for (index in goats) {
        center.x += goats[index].x;
        center.y += goats[index].y;
    }

    if (goats.length > 0) {
        center.x /= goats.length;
        center.y /= goats.length;
    }

    for (var index in goats) {
        var goat = goats[index];
        const delta = GoatMath.CalculateMoveDelta(
            { x: goat.x, y: goat.y },
            { x: center.x, y: center.y },
            distance
        );

        goat.x += delta.x;
        goat.y += delta.y;
    }
}

function MoveGoats(goats, players, distance) {
    // Rules to add here:
    // - Goat moves away from players when they are "close" to goat
    // - Goat moves towards the "center" of herd
    // - Goat avoids collision with other goats
    // - Goat detects collision with corners

    for (index in goats) {
        MoveGoatAwayFromPlayers(goats[index], players, distance);
    }

    MoveGoatTowardsCenter(goats, distance);
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

// Physics

// WARNING: DO NOT CHANGE THIS VALUE
const physicsInterval = 15; // milliseconds
var physicsTime = new Date();
var physicsPerfCounter = new GoatDiagnostics.PerfCounter();

// Keep logic to a minimal here
setInterval(function () {
    physicsPerfCounter.Start();

    var newPhysicsTime = new Date();
    var actualInterval = newPhysicsTime - physicsTime;

    // distance = velocity * time
    const playerDistanceToMove = (playerSpeed * actualInterval) / 1000;
    MovePlayers(gameState.players, playerDistanceToMove);

    // distance = velocity * time
    const goatDistanceToMove = (goatSpeed * actualInterval) / 1000;
    MoveGoats(gameState.goats, gameState.players, goatDistanceToMove);

    physicsTime = newPhysicsTime;

    physicsPerfCounter.Stop();
}, physicsInterval);

// Render
var renderPerfCounter = new GoatDiagnostics.PerfCounter();
const renderFps = 60;
const renderInterval = 1000 / renderFps;
setInterval(function () {
    renderPerfCounter.Stop();
    io.sockets.emit("game-state", gameState);
    renderPerfCounter.Start();
}, renderInterval);

function GetPrintableNumber(number) {
    return Math.round(number * 100) / 100;
}

// Diagnostics
setInterval(function () {
    const serverRendersPerSecond = GetPrintableNumber(
        1000 / renderPerfCounter.GetAverageTime()
    );
    renderPerfCounter.Clear();

    const physicsLoopsPerSecond = GetPrintableNumber(
        1000 / physicsPerfCounter.GetAverageTime()
    );
    physicsPerfCounter.Clear();

    console.log(`--Diagnostics--`);
    console.log(
        `    Server physics loops per second: ${physicsLoopsPerSecond}`
    );
    console.log(
        `    Server render loops per second: ${serverRendersPerSecond}`
    );
}, 5000);
