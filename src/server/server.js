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
    var xDistanceToMove = 0;
    var yDistanceToMove = 0;
    if (player.input.left && player.x - player.r - distance > 0) {
        xDistanceToMove = -distance;
    }
    if (player.input.up && player.y - player.r - distance > 0) {
        yDistanceToMove = -distance;
    }
    if (player.input.right && player.x + player.r + distance < board.width) {
        xDistanceToMove = distance;
    }
    if (player.input.down && player.y + player.r + distance < board.height) {
        yDistanceToMove = distance;
    }

    // Without this correction, player would have a 40% advantage when moving diagonally
    if (
        (player.input.down || player.input.up) &&
        (player.input.left || player.input.right)
    ) {
        xDistanceToMove *= 0.707;
        yDistanceToMove *= 0.707;
    }

    player.x += xDistanceToMove;
    player.y += yDistanceToMove;
}

function DistanceSquare(x1, y1, x2, y2) {
    return (x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1);
}

function CalculateMoveDelta(pointFrom, pointTo, scalingFactor) {
    const angle = Math.atan2(pointTo.y - pointFrom.y, pointTo.x - pointFrom.x);

    var xDelta = Math.cos(angle) * scalingFactor;
    var yDelta = Math.sin(angle) * scalingFactor;

    return { x: xDelta, y: yDelta };
}

const goatDogDistance = 60;
const goatDogDistanceSquare = goatDogDistance * goatDogDistance;

function MoveGoatAwayFromPlayers(goat, players, distance) {
    for (var id in players) {
        var player = players[id];

        var actualGoatDogDistanceSquare = DistanceSquare(
            goat.x,
            goat.y,
            player.x,
            player.y
        );

        if (actualGoatDogDistanceSquare < goatDogDistanceSquare) {
            const delta = CalculateMoveDelta(
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
        const delta = CalculateMoveDelta(
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

const playerSpeed = 300; // pixels per second
const goatSpeed = 1; // pixels per second

function PerfCounter() {
    this._numberOfRecords = 0;
    this._totalTime = 0;

    this._isRunning = false;
    this._monitorStartTime;

    this._AddRecord = function (interval) {
        this._totalTime += interval;
        ++this._numberOfRecords;
    };

    this.Start = function () {
        this._monitorStartTime = new Date();
        this._isRunning = true;
    };

    this.Stop = function () {
        if (this._isRunning) {
            var endTime = new Date();
            this._AddRecord(endTime - this._monitorStartTime);
        }

        this._isRunning = false;
    };

    this.GetAverageTime = function () {
        return this._numberOfRecords > 0
            ? this._totalTime / this._numberOfRecords
            : NaN;
    };

    this.GetNumberOfRecords = function () {
        return this._numberOfRecords;
    };

    this.Clear = function () {
        this._numberOfRecords = 0;
        this._totalTime = 0;
    };
}

// Physics

// WARNING: DO NOT CHANGE THIS VALUE
const physicsInterval = 15; // milliseconds
var physicsTime = new Date();
var physicsPerfCounter = new PerfCounter();

// Keep logic to a minimal here
setInterval(function () {
    physicsPerfCounter.Start();

    var newPhysicsTime = new Date();
    var actualInterval = newPhysicsTime - physicsTime;

    // distance = velocity * time
    const playerDistanceToMove = (playerSpeed * actualInterval) / 1000;
    for (var id in gameState.players) {
        MovePlayer(gameState.players[id], playerDistanceToMove);
    }

    // distance = velocity * time
    const goatDistanceToMove = (goatSpeed * actualInterval) / 1000;
    for (var index in gameState.goats) {
        MoveGoats(gameState.goats, gameState.players, goatDistanceToMove);
    }

    physicsTime = newPhysicsTime;

    physicsPerfCounter.Stop();
}, physicsInterval);

// Render
var renderPerfCounter = new PerfCounter();

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
