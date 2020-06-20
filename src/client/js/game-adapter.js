const io = require('socket.io-client');

const GameAdapter = {};
module.exports = GameAdapter;

(function GameAdapterNamespace() {
    const socket = io({ reconnection: false });
    let clientBoardSetupCallback = function BoardSetupCallbackDummy() {};
    let clientRenderCallback = function RenderCallbackDummy() {};

    GameAdapter.SendNewPlayerMessage = function SendNewPlayerMessageDummy() {};
    GameAdapter.SendKeyInputToGame = function SendKeyInputToGameDummy() {};
    GameAdapter.SendMouseInputToGame = function SendMouseInputToGame() {};

    function SetupSocketEmits() {
        GameAdapter.SendNewPlayerMessage = function SendNewPlayerMessage(dogName, team) {
            socket.emit('game-new-player', dogName, team);
        };

        GameAdapter.SendKeyInputToGame = function SendKeyInputToGame(keyInput) {
            socket.emit('game-key-input', keyInput);
        };

        GameAdapter.SendMouseInputToGame = function SendMouseInputToGame(mousePosition) {
            if (GoatEnhancementHelpers.IsMouseInputEnabled()) {
                socket.emit('game-mouse-touch-input', mousePosition);
            }
        };
    }

    function SetupSocketCallbacks() {
        socket.on('game-board-setup', function NetworkBoardSetup(board) {
            clientBoardSetupCallback(board);
        });

        socket.on('game-render', function NetworkRender(gameState) {
            clientRenderCallback(gameState);
        });

        socket.on('disconnect', function NetworkDisconnectSocket() {
            socket.disconnect();
        });
    }

    GameAdapter.InitializeGame = function InitializeGame() {
        SetupSocketEmits();
        SetupSocketCallbacks();
    };

    GameAdapter.SetBoardSetupCallback = function SetBoardSetupCallback(boardSetupCallback) {
        clientBoardSetupCallback = boardSetupCallback;
    };

    GameAdapter.SetRenderCallback = function SetRenderCallback(renderCallback) {
        clientRenderCallback = renderCallback;
    };
})();
