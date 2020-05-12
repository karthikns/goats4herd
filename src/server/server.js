var express = require("express");
var app = express();
var server = require("http").createServer(app);
var io = require("socket.io")(server, { cookie: false });
var path = require("path");
const { v4: uuidv4 } = require("uuid");

var GoatGame = require("./goat-game");
var GoatTelemetry = require("./lib/goat-telemetry");

app.use(express.static(path.join(__dirname, "./../client")));

const port = process.env.PORT || 3000;
server.listen(port, function () {
    console.log("Listening on port: " + port);
    console.log(`http://localhost:${port}/`);
});

var serverStartTime = new Date();
const adminPassword = process.env.PASSWORD || "";

const telemetrySheetName = process.env.TELEMETRY_SHEET_NAME || undefined;
var telemetryPrivateKey = process.env.TELEMETRY_PRIVATE_KEY || undefined;
const telemetryEmail = process.env.TELEMETRY_EMAIL || undefined;

if (telemetryPrivateKey) {
    telemetryPrivateKey = telemetryPrivateKey.replace(/\\n/g, "\n");
}

var serverRegion = process.env.SERVER_REGION || "unknown";
var serverId = uuidv4();
GoatTelemetry.Initialize(
    {
        telemetrySheetName: telemetrySheetName,
        telemetryPrivateKey: telemetryPrivateKey,
        telemetryEmail: telemetryEmail,
    },
    {
        serverId: serverId,
        serverStartTime: serverStartTime,
        serverRegion: serverRegion,
    }
);

io.on("connection", function (socket) {
    console.log("A user connected");

    socket.on("disconnect", function () {
        GoatGame.RemoveDog(socket.id);
        socket.emit("game-user-disconnect", socket.id);
        console.log("A user disconnected");
    });

    socket.on("game-new-player", function (myName) {
        GoatGame.AddDog(socket.id, myName);
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

    socket.on("start-game", function(){
        console.log("Game Started")
    })
});
