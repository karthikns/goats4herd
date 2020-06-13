const express = require("express");
const app = express();
const socketio = require("socket.io");
const { v4: uuidv4 } = require("uuid");
const webpack = require("webpack");
const webpackDevMiddleware = require("webpack-dev-middleware");
const webpackConfig = require("../../webpack.dev.js");

const GoatGame = require("./goat-game");
const GoatTelemetry = require("./lib/goat-telemetry");

app.use(express.static("public"));

if (process.env.NODE_ENV === "development") {
    // Setup Webpack for development
    const compiler = webpack(webpackConfig);
    app.use(webpackDevMiddleware(compiler));
} else {
    // Static serve the dist/ folder in production
    app.use(express.static("dist"));
}

const port = process.env.PORT || 3000;
const server = app.listen(port, function () {
    console.log(`Server listening on port ${port}`);
    console.log(`http://localhost:${port}/`);
});

const io = socketio(server);

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

GoatGame.SetTelemetryObject(GoatTelemetry);

io.on("connection", function (socket) {
    console.log("A user connected");

    socket.on("disconnect", function () {
        GoatGame.RemoveDog(socket.id);
        socket.emit("game-user-disconnect", socket.id);
        console.log("A user disconnected");
    });

    socket.on("game-new-player", function (dogName, teamId) {
        GoatGame.AddDog(socket.id, dogName, teamId);
        io.to(socket.id).emit("game-board-setup", GoatGame.board);
    });

    socket.on("game-key-input", function (input) {
        GoatGame.SetInputKeyState(socket.id, input);
    });

    socket.on("game-mouse-touch-input", function (mouseTouchInput) {
        GoatGame.SetMouseTouchState(socket.id, mouseTouchInput);
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
