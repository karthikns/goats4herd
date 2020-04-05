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
    io.emit("game-state", Math.floor(Math.random() * 100));
}

setInterval(GameLoop, 1000);

var port = 3000;
http.listen(port, function () {
    console.log("Listening on port: " + port);
});
