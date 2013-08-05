/**
 * @class Spread.grid.plugin.Pasteable
 * @extends Spread.grid.plugin.AbstractPlugin
 * Allows the spreadsheet to receive data from a native spreadsheet application like
 * e.g. OpenOffice.org Calc by pasting into a selected cell range or right-down direction from a focused cell
 * using the keystroke Ctrl/Cmd + V.
 */
Ext.define('Spread.grid.plugin.Pasteable', {

    'extend': 'Spread.grid.plugin.AbstractPlugin',

    'requires': ['Spread.grid.plugin.AbstractPlugin'],

    'alias': 'pasteable',

    'mixins': {
        clipping: 'Spread.util.Clipping'
    },

    /**
     * @cfg {Boolean}
     * Should changed cell data be automatically committed?
     * This config gets auto-applied from spread grid panel.
     */
    autoCommit: false,

    /**
     * @cfg {Boolean}
     * Indicator if a load mask should be shown while pasting
     */
    loadMask: true,

    /**
     * @cfg {Boolean}
     * Using internal API's allows a much faster record data changing.
     * Using internal API's is dangerous. If this method doesn't work
     * after a framework update anymore, just switch this flag to false!
     * EXPERIMENTAL. Dirty flag is known to be buggy in this release.
     */
    useInternalAPIs: false,

    /**
     * @protected
     * Registers the paste keystroke event handling mechanism.
     * @param {Spread.grid.View} view View instance
     * @return void
     */
    init: function(view) {

        var me = this;

        me.callParent(arguments);

        // Add events
        me.addEvents(

            /**
             * @event beforepaste
             * Fires before a paste action happens. Return false in listener to stop the event processing.
             * @param {Spread.grid.plugin.Pasteable} pasteable Pasteable plugin instance
             * @param {Spread.selection.RangeModel} selModel Selection model instance
             * @param {Array} selections Array of selected positions
             */
            'beforepaste',

            /**
             * @event paste
             * Fires when a paste action happened.
             * @param {Spread.grid.plugin.Pasteable} pasteable Pasteable plugin instance
             * @param {Spread.selection.RangeModel} selModel Selection model instance
             * @param {Array} selections Array of selected positions
             * @param {Array} pastedData Array of pasted data
             */
            'paste'
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
    initKeyNav: function() {

        var me = this, view = me.getView();

        if (!view.rendered) {
            view.on('render', Ext.Function.bind(me.initKeyNav, me, [view], 0), me, {single: true});
            return;
        }

        // Register key-stroke event detector
        view.getEl().on('keydown', me.detectPasteKeyStroke, me);
    },

    /**
     * @protected
     * Detects paste key-strokes (ctrl+v, cmd+v) and calls the
     * clipping mixin to hook the native event loop for clipboard
     * interaction. Also calls the TSVTransformer to transform
     * the pasted data into array data.
     *
     * @param {Ext.EventObject} evt Key event
     * @return void
     */
    detectPasteKeyStroke: function(evt) {

        if (evt.getKey() === evt.V && evt.ctrlKey) {
            this.pasteFromClipboard();
        }
    },

    /**
     * @protected
     * Pastes selected range data from the native clipboard to
     * the text area and then onto the record fields.
     * @return void
     */
    pasteFromClipboard: function() {

        //console.log('pasting from clipboard');

        var me = this,
            view = me.getView(),
            selModel = me.getSelectionModel(),
            selectionPositions = selModel.getSelectedPositionData();

        if (me.loadMask) {

            var maskEl = view.getEl();
            maskEl.target = maskEl;

            var loadMask = new Ext.LoadMask(maskEl);
            loadMask.show();
        }

        // Fire interceptable event
        if (me.fireEvent('beforepaste', me, selModel, selectionPositions) !== false) {

            me.prepareForClipboardPaste(function(clipboardData) {

                //console.log('Clipboard data:', clipboardData);

                // Call the transformer to transform and insert data
                var pastedDataArray = Spread.util.TSVTransformer.transformToArray(clipboardData);

                //console.log('Pasted data array:', pastedDataArray);

                // Call the method to paste the data into the store
                me.updateRecordFieldsInStore(pastedDataArray, selectionPositions, selModel);

                me.fireEvent('paste', me, selModel, selectionPositions, pastedDataArray);

                if (me.loadMask) {
                    //me.view.setLoading(false);
                    loadMask.hide();
                }

            }, view);
        }
    },

    /**
     * @protected
     * Update the store records selected in the range of selectionPositions.
     * @param {Array} pastedDataArray Clipboard data converted as flat array
     * @param {Array} selectionPositions Selected positions
     * @param {Spread.selection.RangeModel} selModel Selection model
     * @return void
     */
    updateRecordFieldsInStore: function(pastedDataArray, selectionPositions, selModel) {

        var me = this, view = me.getView();

        //console.log('updateRecordFieldsInStore', selModel, pastedDataArray, selectionPositions);

        // Selects a range of cells
        function selectRangeByNewPosition(newOriginSelectionPosition, newFocusPosition) {

            //console.log('select new range', newOriginSelectionPosition, newFocusPosition);

            // Switch position references
            selModel.currentFocusPosition = newFocusPosition;
            selModel.originSelectionPosition = newOriginSelectionPosition;

            // Try selecting range
            selModel.selectFocusRange(true);
        }

        // Do nothing, if nothing is selected or nothing was pasted
        if (selectionPositions.length === 0 || pastedDataArray.length === 0) {
            //console.log('return, because no selection was found');
            return;
        }

        // Single cell paste, just set data on focus position
        if (pastedDataArray.length === 1 && pastedDataArray[0].length === 1) {

            var newFocusPosition = selectionPositions[0].validate();

            /*console.log(
                'setting data value',
                newFocusPosition,
                pastedDataArray[0][0]
            );*/

            // Never paste on non-editable columns!
            if (!newFocusPosition.columnHeader.editable) {
                return;
            }

            // Set data on field of record
            newFocusPosition.setValue(
                pastedDataArray[0][0],
                me.autoCommit
            );

            // Redraw edit mode styling
            me.handleDirtyMarkOnEditModeStyling();

            return;
        }

        // Build real selectionPositions array
        if (selectionPositions.length === 1) {

            var newOriginSelectionPosition = selectionPositions[0].validate(),
                newFocusPosColumnIndex = newOriginSelectionPosition.column,
                newFocusPosRowIndex = newOriginSelectionPosition.row,
                newFocusPosition = null;

            //console.log('detect selection out of focus position', newFocusPosRowIndex);

            // Increment row (-2 because the selected position also is a row)
            newFocusPosRowIndex += (pastedDataArray.length - 1);

            // Selected (-1 because the selected position also is a column)
            newFocusPosColumnIndex += (pastedDataArray[0].length - 1);

            // Lets try this position
            newFocusPosition = new Spread.selection.Position(
                view,
                newFocusPosColumnIndex,
                newFocusPosRowIndex
            );

            //console.log('originPosition would be: ', newOriginSelectionPosition);
            //console.log('focusPosition would be: ', newFocusPosition);

            // Select range
            selectRangeByNewPosition(newOriginSelectionPosition, newFocusPosition);
        }

        // Update selection info
        selectionPositions = selModel.getSelectedPositionData();

        // Selection exists, change data for cells in selection
        //console.log('change data inside selection: ', selectionPositions, pastedDataArray);

        var newOriginSelectionPosition = selectionPositions[0].validate();
        var projectedColumnIndex = 0;
        var projectedRowIndex = 0;
        var lastProjectedRowIndex = 0;

        // Walk selected positions to set new field/cell values
        for (var i=0; i<selectionPositions.length; i++) {

            // Update record references
            selectionPositions[i].validate();

            // Never paste on non-editable columns!
            if (!selectionPositions[i].columnHeader.editable) {
                continue;
            }

            // Matrix-project row and column index of grid (coordinates) onto selected range (coordinates)
            projectedRowIndex = (selectionPositions[i].row-newOriginSelectionPosition.row);
            projectedColumnIndex = (selectionPositions[i].column-newOriginSelectionPosition.column)

            // Update last projected row index
            lastProjectedRowIndex = projectedRowIndex;

            /*
            console.log(
                'setting data values',
                selectionPositions[i],
                pastedDataArray[projectedRowIndex][projectedColumnIndex],
                projectedRowIndex,
                projectedColumnIndex
            );
            */

            // Set new data value
            selectionPositions[i].setValue(
                pastedDataArray[projectedRowIndex][projectedColumnIndex],
                me.autoCommit,
                me.useInternalAPIs
            );
        }


        // Using internal API's we've changed the internal
        // values now, but we need to refresh the view for
        // data values to be updates
        view.refresh();

        // Redraw edit mode styling
        me.handleDirtyMarkOnEditModeStyling();

        // Highlight pasted data selection cells
        view.highlightCells(selectionPositions);
    },

    /**
     * @protected
     * Full redraw on edit mode styling after each edit field change
     * @return void
     */
    handleDirtyMarkOnEditModeStyling: function() {

        var me = this, view = me.getView();

        if (view.editable) {

            // Full redraw
            view.editable.displayCellsEditing(false);

            if (view.ownerCt.editModeStyling) {
                view.editable.displayCellsEditing(true);
            }
        }
    }
});