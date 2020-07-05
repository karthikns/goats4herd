const GoatGame = require('../../common/goat-game');
const GoatEnhancementHelpers = require('../../common/goat-enhancement-helpers');

const LocalGameAdapter = {};
module.exports = LocalGameAdapter;

(function GameAdapterNamespace() {
    let clientInitStatusCallback = function InitStatusCallback() {};

    LocalGameAdapter.GameClientInitRequest = function GameClientInitRequestDummy() {};
    LocalGameAdapter.SendKeyInputToGame = function SendKeyInputToGameDummy() {};
    LocalGameAdapter.SendMouseInputToGame = function SendMouseInputToGame() {};

    function SetupGameMessages() {
        LocalGameAdapter.GameClientInitRequest = function GameClientInitRequest() {
            clientInitStatusCallback(GoatGame.board);
        };

        LocalGameAdapter.AddDogToGame = function AddDogToGame(dogName, teamId) {
            GoatGame.AddDog('socket.id', dogName, teamId);
        };

        LocalGameAdapter.SendKeyInputToGame = function SendKeyInputToGame(keyInput) {
            GoatGame.SetInputKeyState('socket.id', keyInput);
        };

        LocalGameAdapter.SendMouseTouchInputToGame = function SendMouseTouchInputToGame(mouseTouchPosition) {
            if (GoatEnhancementHelpers.IsMouseTouchInputEnabled()) {
                GoatGame.SetMouseTouchState('socket.id', mouseTouchPosition);
            }
        };
    }

    LocalGameAdapter.InitializeGameAdapter = function InitializeGameAdapter() {
        SetupGameMessages();
    };

    LocalGameAdapter.SetInitStatusCallback = function SetInitStatusCallback(initStatusCallback) {
        clientInitStatusCallback = initStatusCallback;
    };

    LocalGameAdapter.SetRenderCallback = function SetRenderCallback(renderCallback) {
        GoatGame.onRenderState = renderCallback;
    };
})();
