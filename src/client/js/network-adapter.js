const io = require('socket.io-client');
const GoatEnhancements = require('../../common/goat-enhancements.json');

const NetworkAdapter = {};
module.exports = NetworkAdapter;

(function GoarEnhancementHelpersNamespace() {
    NetworkAdapter.socket = io({ reconnection: false });

    NetworkAdapter.SendNewPlayerMessage = function SendNewPlayerMessage(dogName, team) {
        NetworkAdapter.socket.emit('game-new-player', dogName, team);
    };

    NetworkAdapter.SendKeyInputToGame = function SendKeyInputToGame(keyInput) {
        NetworkAdapter.socket.emit('game-key-input', keyInput);
    };

    NetworkAdapter.SendMouseInputToGame = function SendMouseInputToGame(mousePosition) {
        if (GoatEnhancementHelpers.IsMouseInputEnabled()) {
            NetworkAdapter.socket.emit('game-mouse-touch-input', mousePosition);
        }
    };
})();
