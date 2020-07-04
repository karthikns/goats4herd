const io = require('socket.io-client');
const GoatEnhancementHelpers = require('../../common/goat-enhancement-helpers');

const GameAdapter = {};
module.exports = GameAdapter;

(function GameAdapterNamespace() {
    let socket;
    let clientInitStatusCallback = function InitStatusCallback() {};
    let clientRenderCallback = function RenderCallbackDummy() {};

    GameAdapter.GameClientInitRequest = function GameClientInitRequest() {};
    GameAdapter.AddDogToGame = function AddDogToGame() {};
    GameAdapter.SendKeyInputToGame = function SendKeyInputToGameDummy() {};
    GameAdapter.SendMouseInputToGame = function SendMouseInputToGame() {};

    function SetupSocketEmits() {
        GameAdapter.GameClientInitRequest = function GameClientInitRequest() {
            socket.emit('game-client-init-request');
        };

        GameAdapter.AddDogToGame = function AddDogToGame(dogName, teamId) {
            socket.emit('game-add-dog', dogName, teamId);
        };
    }

    GameAdapter.SendKeyInputToGame = function SendKeyInputToGame(keyInput) {
        socket.emit('game-key-input', keyInput);
    };

    GameAdapter.SendMouseInputToGame = function SendMouseInputToGame(mousePosition) {
        if (GoatEnhancementHelpers.IsMouseInputEnabled()) {
            socket.emit('game-mouse-touch-input', mousePosition);
        }
    };

    function SetupSocketCallbacks() {
        socket.on('game-client-init-status', function (board) {
            clientInitStatusCallback(board);
        });

        socket.on('game-render', function NetworkRender(gameState) {
            clientRenderCallback(gameState);
        });

        socket.on('disconnect', function NetworkDisconnectSocket() {
            socket.disconnect();
        });
    }

    GameAdapter.InitializeGameAdapter = function InitializeGameAdapter() {
        socket = io({ reconnection: false });

        SetupSocketEmits();
        SetupSocketCallbacks();
    };

    GameAdapter.SetInitStatusCallback = function SetInitStatusCallback(initStatusCallback) {
        clientInitStatusCallback = initStatusCallback;
    };

    GameAdapter.SetRenderCallback = function SetRenderCallback(renderCallback) {
        clientRenderCallback = renderCallback;
    };
})();
