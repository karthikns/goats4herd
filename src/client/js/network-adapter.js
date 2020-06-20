const io = require('socket.io-client');
const GoatEnhancements = require('../../common/goat-enhancements.json');

const NetworkAdapter = {};
module.exports = NetworkAdapter;

(function GoarEnhancementHelpersNamespace() {
    const socket = io({ reconnection: false });
    NetworkAdapter.socket = socket;

    socket.on('disconnect', function NetworkDisconnectSocket() {
        NetworkAdapter.socket.disconnect();
    });

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
