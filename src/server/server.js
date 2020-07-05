const express = require('express');

const app = express();
const socketio = require('socket.io');
const { v4: uuidv4 } = require('uuid');
const webpack = require('webpack');
const webpackDevMiddleware = require('webpack-dev-middleware');
const webpackConfig = require('../../webpack.dev.js');

const GoatGame = require('../common/goat-game');
const GoatTelemetry = require('../common/lib/goat-telemetry');

const GoatEnhancements = require('../common/goat-enhancements.json');
const GoatEnhancementHelpers = require('../common/goat-enhancement-helpers');

// eslint-disable-next-line no-console
console.log(GoatEnhancements);

app.use(express.static('public'));

if (process.env.NODE_ENV === 'development') {
    // Setup Webpack for development
    const compiler = webpack(webpackConfig);
    app.use(webpackDevMiddleware(compiler));
} else {
    // Static serve the dist/ folder in production
    app.use(express.static('dist'));
}

const port = process.env.PORT || 3000;
const server = app.listen(port, function AppListenCallback() {
    // eslint-disable-next-line no-console
    console.log(`Server listening on port ${port}`);
    // eslint-disable-next-line no-console
    console.log(`http://localhost:${port}/`);
});

const io = socketio(server);

const serverStartTime = new Date();
const adminPassword = process.env.PASSWORD || '';

const telemetrySheetName = process.env.TELEMETRY_SHEET_NAME || undefined;
let telemetryPrivateKey = process.env.TELEMETRY_PRIVATE_KEY || undefined;
const telemetryEmail = process.env.TELEMETRY_EMAIL || undefined;

if (telemetryPrivateKey) {
    telemetryPrivateKey = telemetryPrivateKey.replace(/\\n/g, '\n');
}

const serverRegion = process.env.SERVER_REGION || 'unknown';
const serverId = uuidv4();
GoatTelemetry.Initialize(
    {
        telemetrySheetName,
        telemetryPrivateKey,
        telemetryEmail,
    },
    {
        serverId,
        serverStartTime,
        serverRegion,
    }
);

GoatGame.SetTelemetryObject(GoatTelemetry);

io.on('connection', function ConnectionCallback(socket) {
    // eslint-disable-next-line no-console
    console.log('A user connected');

    socket.on('disconnect', function DisconnectionCallback() {
        GoatGame.RemoveDog(socket.id);
        socket.emit('game-user-disconnect', socket.id);

        // eslint-disable-next-line no-console
        console.log('A user disconnected');
    });

    socket.on('game-client-init-request', function GetGameStatusCallback() {
        io.to(socket.id).emit('game-client-init-status', GoatGame.board);
    });

    socket.on('game-add-dog', function AddDogCallback(dogName, teamId) {
        GoatGame.AddDog(socket.id, dogName, teamId);
    });

    socket.on('game-key-input', function KeyInputCallback(input) {
        GoatGame.SetInputKeyState(socket.id, input);
    });

    socket.on('game-mouse-touch-input', function MouseTouchInputCallback(mouseTouchInput) {
        if (GoatEnhancementHelpers.IsMouseTouchInputEnabled()) {
            GoatGame.SetMouseTouchState(socket.id, mouseTouchInput);
        }
    });

    function BroadcastRenderState(renderState) {
        io.sockets.emit('game-render', renderState);
    }

    GoatGame.onRenderState = BroadcastRenderState;

    // Stats function go below this
    socket.on('admin-ping', function AdminPingCallback(number) {
        io.to(socket.id).emit('admin-pong', number);
    });

    socket.on('stats-get-server-up-time', function GetServerUpTimeCallback() {
        const upTimeMilliseconds = new Date() - serverStartTime;

        const totalSeconds = upTimeMilliseconds / 1000;
        const totalMinutes = totalSeconds / 60;
        const totalHours = totalMinutes / 60;

        const seconds = Math.round(totalSeconds) % 60;
        const minutes = Math.round(totalMinutes) % 60;
        const hours = Math.round(totalHours);

        const upTimeString = `${hours} hours ${minutes} minutes ${seconds} seconds`;

        io.to(socket.id).emit('stats-return-server-up-time', upTimeString);
    });

    // Admin functions go below this
    socket.on('admin-reset-goats', function AdminResetGoatsCallback(password) {
        if (password !== adminPassword) {
            return;
        }

        GoatGame.ResetGoats();
    });

    socket.on('admin-reset-score', function AdminResetScoreCallback(password) {
        if (password !== adminPassword) {
            return;
        }

        GoatGame.ResetScore();
    });

    socket.on('admin-remove-all-dogs', function AdminResetAllCallback(password) {
        if (password !== adminPassword) {
            return;
        }

        GoatGame.RemoveAllDogs();
    });

    socket.on('admin-reset-all', function AdminResetAllCallback(password) {
        if (password !== adminPassword) {
            return;
        }

        GoatGame.ResetGoats();
        GoatGame.ResetScore();
    });
});
