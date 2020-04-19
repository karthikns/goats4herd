var express = require("express");
var app = express();
var http = require("http").createServer(app);
var io = require("socket.io")(http);
var path = require("path");

var GoatGame = require("./goat-game");

app.use(express.static(path.join(__dirname, "/../client")));

const port = process.env.PORT || 3000;
http.listen(port, function () {
    console.log("Listening on port: " + port);
});

io.on("connection", function (socket) {
    console.log("A user connected");

    socket.on("disconnect", function () {
        GoatGame.RemoveDog(socket.id);
        socket.emit("game-user-disconnect", socket.id);
        console.log("A user disconnected");
    });

    socket.on("game-new-player", function () {
        GoatGame.AddDog(socket.id);
        io.to(socket.id).emit("game-board-setup", GoatGame.board);
    });

    socket.on("game-input", function (input) {
        GoatGame.SetInputState(socket.id, input);
    });

    function BroadcastRenderState(renderState) {
        io.sockets.emit("game-render", renderState);
    }

    GoatGame.onRenderState = BroadcastRenderState;
});
