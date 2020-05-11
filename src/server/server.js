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

var serverStartTime = new Date();
const adminPassword = process.env.PASSWORD || "";

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

    // Stats function go below this
    socket.on("admin-ping", function (number) {
        io.to(socket.id).emit("admin-pong", number);
    });

    socket.on("stats-get-server-up-time", function () {
        var upTimeMilliseconds = new Date() - serverStartTime;

        var totalSeconds = upTimeMilliseconds / 1000;
        var totalMinutes = totalSeconds / 60;
        var totalHours = totalMinutes / 60;

        var seconds = Math.round(totalSeconds) % 60;
        var minutes = Math.round(totalMinutes) % 60;
        var hours = Math.round(totalHours);

        var upTimeString = `${hours} hours ${minutes} minutes ${seconds} seconds`;

        io.to(socket.id).emit("stats-return-server-up-time", upTimeString);
    });

    // Admin functions go below this
    socket.on("admin-reset-goats", function (password) {
        if (password != adminPassword) {
            return;
        }

        GoatGame.ResetGoats();
    });

    socket.on("admin-reset-score", function (password) {
        if (password != adminPassword) {
            return;
        }

        GoatGame.ResetScore();
    });

    socket.on("admin-reset-all", function (password) {
        if (password != adminPassword) {
            return;
        }

        GoatGame.ResetGoats();
        GoatGame.ResetScore();
    });
});
