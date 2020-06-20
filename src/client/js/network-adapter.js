const io = require('socket.io-client');
const GoatEnhancements = require('../../common/goat-enhancements.json');

const NetworkAdapter = {};
module.exports = NetworkAdapter;

(function GoarEnhancementHelpersNamespace() {
    NetworkAdapter.socket = io({ reconnection: false });

    NetworkAdapter.IsMouseInputEnabled = function IsMouseInputEnabled() {
        return false;
    };
})();
