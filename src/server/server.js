var express = require("express");
var app = express();
var http = require("http").createServer(app);
var io = require("socket.io")(http);

app.use(express.static(__dirname + "/../client"));

var players = {};

io.on("connection", function (socket) {
    console.log("A user connected");

    socket.on("disconnect", function () {
        delete players[socket.id];
        socket.emit('userDisconnect', socket.id);
        console.log("A user disconnected");
    });
});

var port = 3000;
http.listen(port, function () {
    console.log("Listening on port: " + port);
});


io.on('connection', function (socket) {
    socket.on('new player', function () {
        players[socket.id] = {
            x: 300,
            y: 300,
            color: 'hsl(' + 360 * Math.random() + ', 50%, 50%)',
            name: `dawg_${socket.id}`
        };
    });
    socket.on('movement', function (data) {
        var player = players[socket.id] || {};
        if (data.left) {
            player.x -= 5;
        }
        if (data.up) {
            player.y -= 5;
        }
        if (data.right) {
            player.x += 5;
        }
        if (data.down) {
            player.y += 5;
        }
    });
});


setInterval(function () {
    io.sockets.emit('game-state', players);
}, 1000 / 60);
