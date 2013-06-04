/**
 * @class Spread.grid.plugin.Copyable
 * @extends Spread.grid.plugin.AbstractPlugin
 * Allows copying data from a focused cell or a selected cell range by Ctrl/Cmd + C keystroke and
 * to be pasted in a native spreadsheet application like e.g. OpenOffice.org Calc.
 */
Ext.define('Spread.grid.plugin.Copyable', {

    'extend': 'Spread.grid.plugin.AbstractPlugin',

    'requires': ['Spread.grid.plugin.AbstractPlugin'],

    'alias': 'copyable',

    'mixins': {
        clipping: 'Spread.util.Clipping'
    },

    /**
     * @protected
     * Registers the copy keystroke event handling mechanism.
     * @param {Spread.grid.View} view View instance
     * @return void
     */
    init: function(view) {

        var me = this;

        me.callParent(arguments);

        // Add events
        me.addEvents(

            /**
             * @event beforecopy
             * Fires before a copy action happens. Return false in listener to stop the event processing.
             * @param {Spread.grid.plugin.Copyable} copyable Copyable plugin instance
             * @param {Spread.selection.RangeModel} selModel Selection model instance
             * @param {Array} selections Array of selected positions
             */
            'beforecopy',

            /**
             * @event copy
             * Fires when a copy action happened.
             * @param {Spread.grid.plugin.Copyable} copyable Copyable plugin instance
             * @param {Spread.selection.RangeModel} selModel Selection model instance
             * @param {Array} selections Array of selected positions
             */
            'copy'
        );

        // Initialize clipping mixin
        me.initClipping();

        // Init key navigation
        me.initKeyNav();
    },

    /**
     * @protected
     * Initializes the key navigation
     * @return void
     */
    initKeyNav: function(view) {

        var me = this, view = me.getView();

        if (!view.rendered) {
            view.on('render', Ext.Function.bind(me.initKeyNav, me, [view], 0), me, {single: true});
            return;
        }

        // Register key-stroke event detector
        view.getEl().on('keydown', me.detectCopyKeyStroke, me);
    },

    /**
     * @protected
     * Detects copy key-strokes (ctrl+c, cmd+c) and calls the
     * clipping mixin to hook the native event loop for clipboard
     * interaction. Also calls the TSVTransformer to transform
     * the data of an already selected range into TSV data.
     *
     * @param {Ext.EventObject} evt Key event
     * @return void
     */
    detectCopyKeyStroke: function(evt) {

        if (evt.getKey() === evt.C && evt.ctrlKey) {
            this.copyToClipboard();
        }
    },

    /**
     * @protected
     * Copies selected range data to the native system clipboard
     * @return void
     */
    copyToClipboard: function() {

        //console.log('copying to clipboard');

        var me = this, view = me.getView(), selModel = me.getSelectionModel(),
            selectionPositions = selModel.getSelectedPositionData();

        // Fire interceptable event
        if (me.fireEvent('beforecopy', me, selModel, selectionPositions) !== false) {

            // Prepare
            me.prepareForClipboardCopy(
                Spread.util.TSVTransformer.transformToTSV(selectionPositions),
                me.getView()
            );

            // Fire event
            me.fireEvent('copy', me, selModel, selectionPositions);
        }
    }
});