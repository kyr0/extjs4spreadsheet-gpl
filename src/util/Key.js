/**
 * @class Spread.util.Key
 * Utility class to determine key codes and possible actions to happen.
 */
Ext.define('Spread.util.Key', {

    singleton: true,

    /**
     * Checks for key code to if editing should be canceled
     * @param {Ext.EventObject} evt Event object instance
     * @return {Boolean}
     */
    isCancelEditKey: function(evt) {

        var k = evt.normalizeKey(evt.keyCode);

        return (k >= 33 && k <= 40) ||  // Page Up/Down, End, Home, Left, Up, Right, Down
            k == evt.RETURN ||
            k == evt.TAB ||
            k == evt.ESC ||
            k == 91 || // Windows key
            (!Ext.isIE && k === 224) || // Mac command key
            (k == 44 || k == 46) // Print Screen, Insert, Delete
    },

    /**
     * Checks for key code to if editing should begin
     * @param {Ext.EventObject} evt Event object instance
     * @return {Boolean}
     */
    isStartEditKey: function(evt) {

        var k = evt.normalizeKey(evt.keyCode);

        // Do never start editing when CTRL or CMD was pressed
        if (evt.ctrlKey) {
            return false
        }

        return (k >= 48 && k <= 57) || // 0-9
               (k >= 65 && k <= 90) || // a-z
               (k >= 96 && k <= 111) || // numpad keys
               (k >= 173 && k <= 222)
    }
});