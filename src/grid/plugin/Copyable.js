/**
 * @class Spread.grid.plugin.Copyable
 * Allows copying data from a focused cell or a selected cell range by Ctrl/Cmd + C keystroke and
 * to be pasted in a native spreadsheet application like e.g. OpenOffice.org Calc.
 */
Ext.define('Spread.grid.plugin.Copyable', {

    extend: 'Ext.AbstractComponent',

    alias: 'copyable',

    mixins: {
        clipping: 'Spread.util.Clipping'
    },

    /**
     * @property {Spread.grid.View}
     * View instance reference
     */
    view: null,

    /**
     * @protected
     * Registers the copy keystroke event handling mechanism.
     * @param {Spread.grid.View} view View instance
     * @return void
     */
    init: function(view) {

        // Add events
        this.addEvents(

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
        this.initClipping();

        var me = this;

        // Set internal reference
        me.view = view;

        // Init key navigation
        this.initKeyNav(view);
    },

    /**
     * @protected
     * Initializes the key navigation
     * @param {Spread.grid.View} view View instance
     * @return void
     */
    initKeyNav: function(view) {

        var me = this;

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

        var selModel = this.view.getSelectionModel(),
            selectionPositions = selModel.getSelectedPositionData();

        // Fire interceptable event
        if (this.fireEvent('beforecopy', this, selModel, selectionPositions) !== false) {

            // Prepare
            this.prepareForClipboardCopy(
                Spread.util.TSVTransformer.transformToTSV(selectionPositions),
                this.view
            );

            // Fire event
            this.fireEvent('copy', this, selModel, selectionPositions);
        }
    }
});