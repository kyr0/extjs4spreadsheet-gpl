/**
 * @class Spread.grid.plugin.ClearRange
 * @extends Spread.grid.plugin.AbstractPlugin
 * Allows to clears a currently selected range.
 */
Ext.define('Spread.grid.plugin.ClearRange', {

    'extend': 'Spread.grid.plugin.AbstractPlugin',

    'requires': ['Spread.grid.plugin.AbstractPlugin'],

    'alias': 'clearrange',

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
     * @cfg {Boolean} autoCommit
     * Automatically commit changed records or wait for manually store.sync() / record.commit()?
     * (Generally, can be specially configured per column config too)
     */
    autoCommit: true,

    /**
     * @protected
     * Registers the clear key event handling (BACKSPACE, DEL keys).
     * @param {Spread.grid.View} view View instance
     * @return void
     */
    init: function(view) {

        var me = this;

        me.callParent(arguments);

        // Add events
        me.addEvents(

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

        // Listen to the key events
        me.listenToKeyEvents();
    },

    listenToKeyEvents: function() {

        var me = this;

        // Un-register on grid destroy
        me.getView().on('destroy', function() {
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
            view = me.getView(),
            targetEl = Ext.get(evt.getTarget());

        // If grid isn't editable, return
        if ((view.editable && !view.editable.editable) ||
            me.getSelectionModel().currentSelectionRange.count() === 0) {
            evt.stopEvent();
            return;
        }

        if (!targetEl.hasCls('spreadsheet-cell-cover-edit-field') &&
            Spread.util.Key.isDelKey(evt)) {

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
            view = me.getView(),
            selectionRange = me.getSelectionModel().getCurrentSelectionRange();

        if (me.loadMask) {

            var maskEl = view.getEl();
            maskEl.target = maskEl;

            var loadMask = new Ext.LoadMask(maskEl);
            loadMask.show();
            //me.view.setLoading(true);
        }

        // May use requestAnimationFrame here
        setTimeout(function() {

            // Clear data of each position
            selectionRange.each(function(position) {

                // Clear cell data
                me.clearPosition(position);

            }, function onComplete() {

                if (view.editable && view.editable.editModeStyling && view.editable.editable) {
                    view.editable.displayCellsEditing(true);
                }

                if (me.loadMask) {
                    //me.view.setLoading(false);
                    loadMask.hide();
                }
            });

        }, 30);
    },

    /**
     * Clears the currently focused/covered position
     * @return void
     */
    clearCurrentFocusPosition: function() {
        this.clearPosition(
            this.getSelectionModel().getCurrentFocusPosition()
        );
    },

    /**
     * Clears a position
     * @param {Spread.selection.Position} position Position to clear
     * @return void
     */
    clearPosition: function(position) {

        var me = this, view = me.getView();

        position.setValue(
            me.nullValue,
            me.autoCommit
        );

        if (view.editable && view.editable.editModeStyling && view.editable.editable) {
            view.editable.displayCellsEditing(true);
        }
    }
});