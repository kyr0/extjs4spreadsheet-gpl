/**
 * @class Spread.util.Key
 * Utility class to determine key codes and possible actions to happen.
 */
Ext.define('Spread.util.Key', {

    singleton: true,

    specialKeyPressedBefore: null,

    /**
     * Checks for key code to if editing should be canceled
     * @param {Ext.EventObject} evt Event object instance
     * @return {Boolean}
     */
    isCancelEditKey: function(evt) {

        var k = evt.normalizeKey(evt.keyCode);

        return (k >= 33 && k <= 40) ||  // Page Up/Down, End, Home, Up, Down
            k == evt.RETURN ||
            k == evt.TAB ||
            k == evt.ESC ||
            k == 91 || // Windows key
            (!Ext.isIE && k === 224)
    },

    /**
     * Checks for key code to if editing should begin
     * @param {Ext.EventObject} evt Event object instance
     * @return {Boolean}
     */
    isStartEditKey: function(evt) {

        var me = this,
            k = evt.normalizeKey(evt.keyCode);

        //console.log('isStartEditKey?', k, evt.ctrlKey);

        if (me.specialKeyPressedBefore) {
            me.specialKeyPressedBefore = false;
            return false;
        }

        // Do never start editing when CTRL or CMD was pressed
        // Or last key was 91 in IE (windows key) and now someone presses a different key
        if (evt.ctrlKey) {
            return false;
        }

        // Windows key in IE is a special key
        if (Ext.isIE && k === 91) {
            me.specialKeyPressedBefore = true;
        }

        return (k >= 48 && k <= 57) || // 0-9
               (k >= 65 && k <= 90) || // a-z
               (k >= 96 && k <= 111) || // numpad keys
               (k >= 173 && k <= 222)
    },

    /**
     * Checks if the key given is a key navigation key (LEFT, UP, DOWN, RIGHT)
     * @param {Ext.EventObject} evt Event object instance
     * @return {Boolean}
     */
    isNavigationKey: function(evt) {

        var k = evt.normalizeKey(evt.keyCode);

        if (k >= 37 && k <= 40) {
            return true;
        }
        return false;
    },

    /**
     * Checks if DEL key is given
     * @param {Ext.EventObject} evt Event object instance
     * @return {Boolean}
     */
    isDelKey: function(evt) {
        var k = evt.normalizeKey(evt.keyCode);
        if (k === 46) {
            return true;
        }
        return false;
    }
});