var express = require("express");
var app = express();
var http = require("http").createServer(app);
var io = require("socket.io")(http);
var path = require("path");

var GoatDiagnostics = require("./lib/goat-diagnostics");
var GoatMath = require("./lib/goat-math");
const goatNames = require("./goat-names.json");

app.use(express.static(path.join(__dirname, "/../client")));

const port = 3000;
http.listen(port, function () {
    console.log("Listening on port: " + port);
});

// Configuration
const playerRadius = 10;
const goatRadius = 10;
const numberOfGoats = 20;
const playerSpeed = 500; // pixels per second
const goatSpeed = 100; // pixels per second
const goatDogDistance = 150; // How far do goats try to stay away from dogs in pixels?
const goatDogAfraidPercent = 99; // 0 if goats are really afraid of dogs, 100 if they aren't afraid of dogs
const collisionFactor = 1000; // 0 for no collisions
const diagnosticsIntervalMilliseconds = 5000;

const board = { width: 800, height: 600 };

// Local Constants computed from config
const goatDogDistanceSquare = goatDogDistance * goatDogDistance;
const goatDogAfraidFactor = goatDogAfraidPercent / 100;

var gameState = {
    players: {},
    goats: [],
};

function InitializeGameState() {
    for (var i = 0; i < numberOfGoats; ++i) {
        var goat = {
            x: Math.random() * board.width,
            y: Math.random() * board.height,
            r: goatRadius,
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
    var moveTo = { x: 0, y: 0 };
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

    const magnitude = Math.sqrt(moveTo.x * moveTo.x + moveTo.y * moveTo.y);
    if (magnitude == 0) {
        return;
    }

    player.x += (moveTo.x / magnitude) * distanceToMove;
    player.y += (moveTo.y / magnitude) * distanceToMove;

    DontAllowPlayerToGoBeyondTheBoard(player);
}

function MovePlayers(players, distanceToMove) {
    for (const id in players) {
        MovePlayer(players[id], distanceToMove);
    }
}

function MoveGoatAwayFromPlayers(goat, players, playersEffectOnGoat) {
    for (const id in players) {
        const player = players[id];

        var actualGoatDogDistanceSquare = GoatMath.DistanceSquare(
            goat.x,
            goat.y,
            player.x,
            player.y
        );

        if (actualGoatDogDistanceSquare < goatDogDistanceSquare) {
            const delta = { x: player.x - goat.x, y: player.y - goat.y };
            const magnitude = Math.sqrt(delta.x * delta.x + delta.y * delta.y);

            if (magnitude == 0) {
                continue;
            }

            playersEffectOnGoat.x -= delta.x / magnitude;
            playersEffectOnGoat.y -= delta.y / magnitude;
        }
    }

    // Scale it to 1
    const playersEffectMagnitude = Math.sqrt(
        playersEffectOnGoat.x * playersEffectOnGoat.x +
            playersEffectOnGoat.y * playersEffectOnGoat.y
    );

    if (playersEffectMagnitude == 0) {
        return;
    }

    playersEffectOnGoat.x /= playersEffectMagnitude;
    playersEffectOnGoat.y /= playersEffectMagnitude;
}

function MoveGoatsTowardsCenter(goats, goatsCenterEffectOnGoats) {
    var center = { x: 0, y: 0 };
    for (const index in goats) {
        center.x += goats[index].x;
        center.y += goats[index].y;
    }

    if (goats.length > 0) {
        center.x /= goats.length;
        center.y /= goats.length;
    }

    for (const index in goats) {
        var goat = goats[index];
        var goatsCenterEffectOnGoat = goatsCenterEffectOnGoats[index];

        const delta = { x: center.x - goat.x, y: center.y - goat.y };
        const magnitude = Math.sqrt(delta.x * delta.x + delta.y * delta.y);

        if (magnitude == 0) {
            continue;
        }

        goatsCenterEffectOnGoat.x += delta.x / magnitude;
        goatsCenterEffectOnGoat.y += delta.y / magnitude;
    }
}

function AvoidCollisionWithOtherGoats(goats, collisionEffectOnGoats) {
    for (
        var moveCandidateIndex = 0;
        moveCandidateIndex < goats.length;
        ++moveCandidateIndex
    ) {
        var moveCandidate = goats[moveCandidateIndex];
        var collisionEffectOnMoveCandidate =
            collisionEffectOnGoats[moveCandidateIndex];
        var isMovePossible = true;

        for (
            var remainingGoatIndex = 0;
            remainingGoatIndex < goats.length;
            ++remainingGoatIndex
        ) {
            if (moveCandidateIndex == remainingGoatIndex) {
                continue;
            }

            var remainingGoat = goats[remainingGoatIndex];
            if (GoatMath.DoCirclesCollide(moveCandidate, remainingGoat)) {
                moveCandidate.color = "red";
                isMovePossible = false;

                var directionX = remainingGoat.x - moveCandidate.x;
                var directionY = remainingGoat.y - moveCandidate.y;

                const magnitude = Math.sqrt(
                    directionX * directionX + directionY * directionY
                );

                if (magnitude == 0) {
                    continue;
                }

                collisionEffectOnMoveCandidate.x += -(directionX / magnitude);
                collisionEffectOnMoveCandidate.y += -(directionY / magnitude);
            }
        }

        if (isMovePossible) {
            // Update goat color
            moveCandidate.color = "green";
        }
    }

    for (const index in collisionEffectOnGoats) {
        var collisionEffect = collisionEffectOnGoats[index];
        const magnitude = Math.sqrt(
            collisionEffect.x * collisionEffect.x +
                collisionEffect.y * collisionEffect.y
        );

        if (magnitude == 0) {
            continue;
        }

        collisionEffect.x /= magnitude;
        collisionEffect.y /= magnitude;
    }
}

function MoveGoats(goats, players, distance) {
    // Rules to add here:
    // - Goat moves away from players when they are "close" to goat
    // - Goat moves towards the "center" of herd
    // - Goat avoids collision with other goats
    // - Goat detects collision with corners

    var playersEffectOnGoats = [];
    var goatsCenterEffectOnGoats = [];
    var netEffectOnGoatsScaledToOne = [];
    var collisionEffectOnGoats = [];
    for (const index in goats) {
        playersEffectOnGoats.push({ x: 0, y: 0 });
        goatsCenterEffectOnGoats.push({ x: 0, y: 0 });
        netEffectOnGoatsScaledToOne.push({ x: 0, y: 0 });
        collisionEffectOnGoats.push({ x: 0, y: 0 });
    }

    // Movement scaled to 1
    for (const index in goats) {
        MoveGoatAwayFromPlayers(
            goats[index],
            players,
            playersEffectOnGoats[index]
        );
    }

    // Movement scaled to 1
    MoveGoatsTowardsCenter(goats, goatsCenterEffectOnGoats);

    AvoidCollisionWithOtherGoats(goats, collisionEffectOnGoats);

    for (const index in goats) {
        var goat = goats[index];
        var playersEffectOnGoat = playersEffectOnGoats[index];
        var goatsCenterEffectOnGoat = goatsCenterEffectOnGoats[index];
        var collisionEffectOnGoat = collisionEffectOnGoats[index];

        var netEffect = { x: 0, y: 0 };
        const dogAfraidEffect = goatDogAfraidFactor;
        const centerPullEffect = 1 - goatDogAfraidFactor;

        netEffect.x =
            dogAfraidEffect * playersEffectOnGoat.x +
            centerPullEffect * goatsCenterEffectOnGoat.x +
            collisionFactor * collisionEffectOnGoat.x;
        netEffect.y =
            dogAfraidEffect * playersEffectOnGoat.y +
            centerPullEffect * goatsCenterEffectOnGoat.y +
            collisionFactor * collisionEffectOnGoat.y;

        const magnitude = Math.sqrt(
            netEffect.x * netEffect.x + netEffect.y * netEffect.y
        );

        if (magnitude == 0) {
            continue;
        }

        goats[index].x += (netEffect.x / magnitude) * distance;
        goats[index].y += (netEffect.y / magnitude) * distance;
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
            r: playerRadius,
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
    var newPhysicsTime = new Date();
    var actualInterval = newPhysicsTime - physicsTime;
    physicsTime = newPhysicsTime;

    physicsPerfCounter.Stop();
    physicsPerfCounter.Start();

    // distance = velocity * time
    const playerDistanceToMove = (playerSpeed * actualInterval) / 1000;
    MovePlayers(gameState.players, playerDistanceToMove);

    // distance = velocity * time
    const goatDistanceToMove = (goatSpeed * actualInterval) / 1000;
    MoveGoats(gameState.goats, gameState.players, goatDistanceToMove);
}, physicsInterval);

// Render
var renderPerfCounter = new GoatDiagnostics.PerfCounter();
const renderFps = 60;
const renderInterval = 1000 / renderFps;
setInterval(function () {
    renderPerfCounter.Stop();
    renderPerfCounter.Start();

    io.sockets.emit("game-state", gameState);
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

    const physicsLoopAverageIterationIntervalMs = GetPrintableNumber(
        physicsPerfCounter.GetAverageTime()
    );
    physicsPerfCounter.Clear();

    console.log(`--Diagnostics--`);
    console.log(`    Server render FPS: ${serverRendersPerSecond}`);
    console.log(
        `    Server physics loop average interval (ms): ${physicsLoopAverageIterationIntervalMs}`
    );
}, diagnosticsIntervalMilliseconds);
