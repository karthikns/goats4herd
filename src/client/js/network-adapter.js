const io = require('socket.io-client');

const NetworkAdapter = {};
module.exports = NetworkAdapter;

(function GoarEnhancementHelpersNamespace() {
    const socket = io({ reconnection: false });
    let clientBoardSetupCallback = function BoardSetupCallbackDummy() {};
    let clientRenderCallback = function RenderCallbackDummy() {};

    socket.on('game-board-setup', function NetworkBoardSetup(board) {
        clientBoardSetupCallback(board);
    });

    socket.on('game-render', function NetworkRender(gameState) {
        clientRenderCallback(gameState);
    });

    socket.on('disconnect', function NetworkDisconnectSocket() {
        NetworkAdapter.socket.disconnect();
    });

    NetworkAdapter.SetBoardSetupCallback = function SetBoardSetupCallback(boardSetupCallback) {
        clientBoardSetupCallback = boardSetupCallback;
    };

    NetworkAdapter.SetRenderCallback = function SetRenderCallback(renderCallback) {
        clientRenderCallback = renderCallback;
    };

    NetworkAdapter.SendNewPlayerMessage = function SendNewPlayerMessage(dogName, team) {
        socket.emit('game-new-player', dogName, team);
    };

    NetworkAdapter.SendKeyInputToGame = function SendKeyInputToGame(keyInput) {
        socket.emit('game-key-input', keyInput);
    };

    NetworkAdapter.SendMouseInputToGame = function SendMouseInputToGame(mousePosition) {
        if (GoatEnhancementHelpers.IsMouseInputEnabled()) {
            socket.emit('game-mouse-touch-input', mousePosition);
        }
    };
})();
