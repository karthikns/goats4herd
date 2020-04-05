var express = require("express");
var app = express();
var http = require("http").createServer(app);
var io = require("socket.io")(http);

app.use(express.static(__dirname + "/../client"));

io.on("connection", function (socket) {
    console.log("A user connected");

    socket.on("disconnect", function () {
        console.log("A user disconnected");
    });
});

function GameLoop() {
    var gameState = {
        x: Math.floor(Math.random() * 200),
        y: Math.floor(Math.random() * 200),
    };
    io.emit("game-state", gameState);
}

setInterval(GameLoop, 400);

var port = 3000;
http.listen(port, function () {
    console.log("Listening on port: " + port);
});
