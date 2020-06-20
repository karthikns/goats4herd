const GoatEnhancements = require('./goat-enhancements.json');

const GoatEnhancementHelpers = {};
module.exports = GoatEnhancementHelpers;

(function GoarEnhancementHelpersNamespace() {
    function IsCheckEnabled(enhancementName) {
        if (GoatEnhancements[enhancementName] && GoatEnhancements[enhancementName].enabled === true) {
            return true;
        }

        return false;
    }

    GoatEnhancementHelpers.IsMouseInputEnabled = function IsMouseInputEnabled() {
        return IsCheckEnabled('mouse-input');
    };
})();
