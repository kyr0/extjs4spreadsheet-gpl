/**
 * @class Spread.grid.plugin.AbstractPlugin
 * @private
 * Abstract plugin implementation
 */
Ext.define('Spread.grid.plugin.AbstractPlugin', {

    'extend': 'Ext.AbstractComponent',

    'alias': 'abstract',

    /**
     * @property {Spread.grid.View} view
     * View instance reference
     */
    view: null,

    /**
     * @protected
     * Registers the clear key event handling (BACKSPACE, DEL keys).
     * @param {Spread.grid.View} view View instance
     * @return void
     */
    init: function(view) {

        var me = this;

        // Set view reference
        me.view = view;
    },

    /**
     * Returns the spread panel's view reference
     * @return {Spread.grid.View}
     */
    getView: function() {
        return this.view;
    },

    /**
     * Returns the selection model references
     * @return {Spread.selection.RangeModel}
     */
    getSelectionModel: function() {
        return this.getView().getSelectionModel();
    },

    /**
     * Returns the spread panel's reference
     * @return {Spread.grid.Panel}
     */
    getSpreadPanel: function() {
        return this.getView().getSpreadPanel();
    }
});