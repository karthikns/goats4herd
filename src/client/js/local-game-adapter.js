const GoatGame = require('../../common/goat-game');
const GoatEnhancementHelpers = require('../../common/goat-enhancement-helpers');

const LocalGameAdapter = {};
module.exports = LocalGameAdapter;

(function GameAdapterNamespace() {
    let clientBoardSetupCallback = function BoardSetupCallbackDummy() {};

    LocalGameAdapter.SendNewPlayerMessage = function SendNewPlayerMessageDummy() {};
    LocalGameAdapter.SendKeyInputToGame = function SendKeyInputToGameDummy() {};
    LocalGameAdapter.SendMouseInputToGame = function SendMouseInputToGame() {};

    function SetupGameMessages() {
        LocalGameAdapter.SendNewPlayerMessage = function SendNewPlayerMessage(dogName, team) {
            GoatGame.AddDog('socket.id', dogName, team);
            clientBoardSetupCallback(GoatGame.board);
        };

        LocalGameAdapter.SendKeyInputToGame = function SendKeyInputToGame(keyInput) {
            GoatGame.SetInputKeyState('socket.id', keyInput);
        };

        LocalGameAdapter.SendMouseInputToGame = function SendMouseInputToGame(mousePosition) {
            if (GoatEnhancementHelpers.IsMouseInputEnabled()) {
                GoatGame.SetMouseTouchState('socket.id', mousePosition);
            }
        };
    }

    LocalGameAdapter.InitializeGame = function InitializeGame() {
        SetupGameMessages();
    };

    LocalGameAdapter.SetBoardSetupCallback = function SetBoardSetupCallback(boardSetupCallback) {
        clientBoardSetupCallback = boardSetupCallback;
    };

    LocalGameAdapter.SetRenderCallback = function SetRenderCallback(renderCallback) {
        GoatGame.onRenderState = renderCallback;
    };
})();
