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

    GoatEnhancementHelpers.IsMouseTouchInputEnabled = function IsMouseTouchInputEnabled() {
        return IsCheckEnabled('mouse-touch-input');
    };

    GoatEnhancementHelpers.IsAnimationEnabled = function IsAnimationEnabled() {
        return IsCheckEnabled('animation');
    };

    GoatEnhancementHelpers.IsLocalGameEnabled = function IsLocalGameEnabled() {
        return IsCheckEnabled('local-game');
    };
})();
