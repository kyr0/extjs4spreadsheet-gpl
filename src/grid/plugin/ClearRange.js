/**
 * @class Spread.grid.plugin.ClearRange
 * Allows to clears a currently selected range.
 */
Ext.define('Spread.grid.plugin.ClearRange', {

    extend: 'Ext.AbstractComponent',

    alias: 'clearrange',

    /**
     * @property {Spread.grid.View}
     * View instance reference
     */
    view: null,

    /**
     * @property {Spread.grid.Panel}
     * Grid instance reference
     */
    grid: null,

    /**
     * @cfg {Boolean}
     * Should a load mask being displayed when clearing cell data?
     */
    loadMask: true,

    /**
     * @cfg {*}
     * Null value that should be used for clearing cell data
     */
    nullValue: '',

    /**
     * @protected
     * Registers the clear key event handling (BACKSPACE, DEL keys).
     * @param {Spread.grid.View} view View instance
     * @return void
     */
    init: function(view) {

        // Add events
        this.addEvents(

            /**
             * @event beforeclearrange
             * Fires before a copy action happens. Return false in listener to stop the event processing.
             * @param {Spread.grid.plugin.ClearRange} clearRange ClearRange plugin instance
             * @param {Spread.selection.RangeModel} selModel Selection model instance
             * @param {Spread.selection.Range} range Range of selected position
             */
            'beforeclearrange',

            /**
             * @event clearrange
             * Fires when a range clearing has happened.
             * @param {Spread.grid.plugin.ClearRange} clearRange ClearRange plugin instance
             * @param {Spread.selection.RangeModel} selModel Selection model instance
             * @param {Spread.selection.Range} range Range of selected position
             */
            'clearrange'
        );

        var me = this;

        // Set internal reference
        me.view = view;

        // Listen to the key events
        me.listenToKeyEvents();
    },

    listenToKeyEvents: function() {

        var me = this;

        // Un-register on grid destroy
        me.view.on('destroy', function() {
            Ext.EventManager.un(document.body, 'keyup', me.onKeyUp);
        });

        // Listen for keyup globally (stable method to fetch keyup)
        Ext.EventManager.on(document.body, 'keyup', me.onKeyUp, me);
    },

    /**
     * @protected
     * Listen to DEL and BACKSPACE
     * @param {Ext.EventObject} evt Event
     * @return void
     */
    onKeyUp: function(evt) {

        var me = this,
            targetEl = Ext.get(evt.getTarget());

        // If grid isn't editable, return
        if (me.view.editable && !me.view.editable.editable) {
            evt.stopEvent();
            return;
        }

        // 46 is the DEL key
        if (!targetEl.hasCls('spreadsheet-cell-cover-edit-field') &&
            evt.normalizeKey(evt.keyCode) === 46) {

            me.clearCurrentSelectedRange();

            evt.stopEvent();
        }
    },

    /**
     * Fetches the current selected range and clears it's data
     * @return void
     */
    clearCurrentSelectedRange: function() {

        var me = this,
            selectionRange = me.view.getSelectionModel().getCurrentSelectionRange();

        if (me.loadMask) {

            var loadMask = new Ext.LoadMask(me.view.getEl());
            loadMask.show();
            //me.view.setLoading(true);
        }

        // May use requestAnimationFrame here
        setTimeout(function() {

            // Clear data of each position
            selectionRange.each(function(position) {

                // Clear cell data
                position.setValue(me.nullValue);

            }, function onComplete() {

                if (me.view.editable && me.view.editable.editModeStyling && me.view.editable.editable) {
                    me.view.editable.displayCellsEditing(true);
                }

                if (me.loadMask) {
                    //me.view.setLoading(false);
                    loadMask.hide();
                }
            });

        }, 30);
    }
});