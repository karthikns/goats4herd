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
        };

        io.to(socket.id).emit("board-setup", board);
    });
    socket.on("movement", function (data) {
        const speed = 5;

        var player = gameState.players[socket.id] || {};
        if (data.left && player.x - player.r - speed > 0) {
            player.x -= speed;
        }
        if (data.up && player.y - player.r - speed > 0) {
            player.y -= speed;
        }
        if (data.right && player.x + player.r + speed < board.width) {
            player.x += speed;
        }
        if (data.down && player.y + player.r + speed < board.height) {
            player.y += speed;
        }
    });
});

setInterval(function () {
    io.sockets.emit("game-state", gameState);
}, 1000 / 60);
