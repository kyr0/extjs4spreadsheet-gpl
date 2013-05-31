/**
 * @class Spread.command.Commander
 *
 * Class that implements a public command API for a more
 * simple and interactive use of the spreads internal features.
 * TODO: Check for out-of-bounds errors!
 */
Ext.define('Spread.command.Commander', {

    /**
     * @protected
     * @property {Spread.grid.Panel} spreadPanel Spread panel reference
     */
    spreadPanel: null,

    // private
    constructor: function(config) {
        Ext.apply(this, config);
    },

    /**
     * Simply redraws the edit mode styling.
     * Call this method if you have changed some
     * row/position/column edit mode styling settings using this API.
     * @return void
     */
    redrawEditModeStyling: function() {
        var speadView = spreadPanel.getView();
        speadView.editable.displayCellsEditing(speadView.editable.editModeStyling);
    },

    /**
     * Returns a position to work on
     * @param {Number} columnIndex Column index
     * @param {Number} rowIndex Row index
     * @return {Spread.selection.Position}
     */
    getPosition: function(columnIndex, rowIndex) {
        return new Spread.selection.Position(
            this.spreadPanel.getView(),
            columnIndex,
            rowIndex
        ).validate();
    },

    /**
     * Returns a range of positions of a row
     * @param {Number} rowIndex Row's index
     * @return {Spread.selection.Range}
     */
    getRowRange: function(rowIndex) {
        return Spread.selection.Range.fromSpreadRows(this.spreadPanel, [rowIndex]);
    },

    /**
     * Returns a range of positions of many rows
     * @param {Array} rowIndexes Row indexes e.g. [1, 2]
     * @return {Spread.selection.Range}
     */
    getRowsRange: function(rowIndexes) {
        return Spread.selection.Range.fromSpreadRows(this.spreadPanel, rowIndexes);
    },

    /**
     * Returns a range of positions of a column
     * @param {Number} columnIndex Column's index
     * @return {Spread.selection.Range}
     */
    getColumnRange: function(columnIndex) {
        return Spread.selection.Range.fromSpreadColumns(this.spreadPanel, [columnIndex]);
    },

    /**
     * Returns a range of positions of many column
     * @param {Array} columnIndexes Column indexes e.g. [1, 2]
     * @return {Spread.selection.Range}
     */
    getColumnsRange: function(columnIndexes) {
        return Spread.selection.Range.fromSpreadColumns(this.spreadPanel, columnIndexes);
    },

    /**
     * Selects a range of positions named by indexes
     * @param {Number} positionIndexes Position indexes array like [{row: 0, column: 2}, ...]
     * @param {Boolean} [virtual=false] Virtual selections do not update the view visually
     * @return {Spread.command.Commander}
     */
    select: function(positionIndexes, virtual) {
        Spread.selection.Range.fromSpreadPositions(this.spreadPanel, positionIndexes).select(virtual);
        return this;
    },

    /**
     * Selects a row named by it's row index
     * @param {Number} rowIndex Row to select
     * @param {Boolean} [virtual=false] Virtual selections do not update the view visually
     * @return {Spread.command.Commander}
     */
    selectRow: function(rowIndex, virtual) {
        return this.selectRows([rowIndex], virtual);
    },

    /**
     * Selects rows named by it's row indexes
     * @param {Array} rowIndexes Row indexes to select, e.g. [0, 1, 2]
     * @param {Boolean} [virtual=false] Virtual selections do not update the view visually
     * @return {Spread.command.Commander}
     */
    selectRows: function(rowIndexes, virtual) {
        Spread.selection.Range.fromSpreadRows(this.spreadPanel, rowIndexes).select(virtual);
        return this;
    },

    /**
     * Selects a column named by it's column index
     * @param {Number} columnIndex Column to select
     * @param {Boolean} [virtual=false] Virtual selections do not update the view visually
     * @return {Spread.command.Commander}
     */
    selectColumn: function(columnIndex, virtual) {
        return this.selectColumns([columnIndex], virtual);
    },

    /**
     * Selects columns named by it's column indexes
     * @param {Array} columnIndexes Columns to select, e.g. [2, 3, 4]
     * @param {Boolean} [virtual=false] Virtual selections do not update the view visually
     * @return {Spread.command.Commander}
     */
    selectColumns: function(columnIndexes, virtual) {
        Spread.selection.Range.fromSpreadColumns(this.spreadPanel, columnIndexes).select(virtual);
        return this;
    },

    /**
     * De-Selects a range of positions named by indexes
     * @param {Number} positionIndexes Position indexes array like [{row: 0, column: 2}, ...]
     * @param {Boolean} [virtual=false] Virtual selections do not update the view visually
     * @return {Spread.command.Commander}
     */
    deselect: function(positionIndexes, virtual) {
        Spread.selection.Range.fromSpreadPositions(this.spreadPanel, positionIndexes).deselect(virtual);
        return this;
    },

    /**
     * De-Selects a row named by it's row index
     * @param {Number} rowIndex Row to select
     * @param {Boolean} [virtual=false] Virtual selections do not update the view visually
     * @return {Spread.command.Commander}
     */
    deselectRow: function(rowIndex, virtual) {
        return this.deselectRows([rowIndex], virtual);
    },

    /**
     * De-Selects rows named by it's row indexes
     * @param {Array} rowIndexes Row indexes to select, e.g. [0, 1, 2]
     * @param {Boolean} [virtual=false] Virtual selections do not update the view visually
     * @return {Spread.command.Commander}
     */
    deselectRows: function(rowIndexes, virtual) {
        Spread.selection.Range.fromSpreadRows(this.spreadPanel, rowIndexes).deselect(virtual);
        return this;
    },

    /**
     * De-Selects a column named by it's column index
     * @param {Number} columnIndex Column to select
     * @param {Boolean} [virtual=false] Virtual selections do not update the view visually
     * @return {Spread.command.Commander}
     */
    deselectColumn: function(columnIndex, virtual) {
        return this.deselectColumns([columnIndex], virtual);
    },

    /**
     * De-Selects columns named by it's column indexes
     * @param {Array} columnIndexes Columns to select, e.g. [2, 3, 4]
     * @param {Boolean} [virtual=false] Virtual selections do not update the view visually
     * @return {Spread.command.Commander}
     */
    deselectColumns: function(columnIndexes, virtual) {
        Spread.selection.Range.fromSpreadColumns(this.spreadPanel, columnIndexes).deselect(virtual);
        return this;
    },

    /**
     * Focuses the named cell
     * @param {Number} columnIndex Cell index
     * @param {Number} rowIndex Row index
     * @return {Spread.command.Commander}
     */
    focusPosition: function(columnIndex, rowIndex) {
        new Spread.selection.Position(
            this.spreadPanel.getView(),
            columnIndex,
            rowIndex
        ).validate().focus();
    },

    /**
     * Focuses & Starts editing a position
     * @param {Number} columnIndex Cell index
     * @param {Number} rowIndex Row index
     * @param {Boolean} [noAutoFocus] Do not automatically focus the cell before starting edit mode
     * @return {Spread.command.Commander}
     */
    startEditPosition: function(columnIndex, rowIndex, noAutoFocus) {

        if (!Ext.isDefined(noAutoFocus)) {

            // Focus position
            this.focusPosition(columnIndex, rowIndex);
        }

        new Spread.selection.Position(
            this.spreadPanel.getView(),
            columnIndex,
            rowIndex
        ).validate().setEditing(true);
        return this;
    },

    /**
     * Stops editing a position
     * @param {Number} columnIndex Cell index
     * @param {Number} rowIndex Row index
     * @return {Spread.command.Commander}
     */
    stopEditPosition: function(columnIndex, rowIndex) {
        new Spread.selection.Position(
            this.spreadPanel.getView(),
            columnIndex,
            rowIndex
        ).validate().setEditing(false);
        return this;
    },

    /**
     * En/disable edit mode styling for positions
     * @param {Number} positionIndexes Position indexes array like [{row: 0, column: 2}, ...]
     * @param {Boolean} editModeStyling Activates/Deactivates edit mode styling
     * @return {Spread.command.Commander}
     */
    setEditModeStyling: function(positionIndexes, editModeStyling) {
        Spread.selection.Range.fromSpreadPositions(this.spreadPanel, positionIndexes).setEditModeStyling(editModeStyling);
        return this;
    },

    /**
     * Sets the edit mode styling for a row
     * @param {Number} rowIndex Row index to set edit mode styling for
     * @param {Boolean} editModeStyling Activates/Deactivates edit mode styling
     * @return {Spread.command.Commander}
     */
    setRowEditModeStyling: function(rowIndex, editModeStyling) {
        return this.setRowsEditModeStyling([rowIndex], editModeStyling);
    },

    /**
     * Sets the edit mode styling for many rows
     * @param {Array} rowIndexes Row indexes to set edit mode styling for
     * @param {Boolean} editModeStyling Activates/Deactivates edit mode styling
     * @return {Spread.command.Commander}
     */
    setRowsEditModeStyling: function(rowIndexes, editModeStyling) {
        Spread.selection.Range.fromSpreadRows(this.spreadPanel, rowIndexes).setEditModeStyling(editModeStyling);
        return this;
    },

    /**
     * Sets the edit mode styling for a column
     * @param {Number} columnIndex Column index to set edit mode styling for
     * @param {Boolean} editModeStyling Activates/Deactivates edit mode styling
     * @return {Spread.command.Commander}
     */
    setColumnEditModeStyling: function(columnIndex, editModeStyling) {
        return this.setColumnsEditModeStyling([columnIndex], editModeStyling);
    },

    /**
     * Sets the edit mode styling for many columns
     * @param {Array} columnIndexes Column indexes to set edit mode styling for
     * @param {Boolean} editModeStyling Activates/Deactivates edit mode styling
     * @return {Spread.command.Commander}
     */
    setColumnsEditModeStyling: function(columnIndexes, editModeStyling) {
        Spread.selection.Range.fromSpreadColumns(this.spreadPanel, columnIndexes).setEditModeStyling(editModeStyling);
        return this;
    },


    /**
     * Sets the position editable
     * @param {Number} columnIndex Cell index
     * @param {Number} rowIndex Row index
     * @param {Boolean} editable Shall the position be editable or not?
     * @return {Spread.command.Commander}
     */
    setPositionEditable: function(columnIndex, rowIndex, editable) {
        new Spread.selection.Position(
            this.spreadPanel.getView(),
            columnIndex,
            rowIndex
        ).validate().setEditable(editable);
        return this;
    },

    /**
     * Sets positions editable
     * @param {Number} positionIndexes Position indexes array like [{row: 0, column: 2}, ...]
     * @param {Boolean} editable Shall the position be editable or not?
     * @return {Spread.command.Commander}
     */
    setEditable: function(positionIndexes, editable) {
        Spread.selection.Range.fromSpreadPositions(this.spreadPanel, positionIndexes).setEditable(editable);
        return this;
    },

    /**
     * Sets the row editable or not
     * @param {Number} rowIndex Row index to allow editing for
     * @param {Boolean} editable Activates/Deactivates edit mode
     * @return {Spread.command.Commander}
     */
    setRowEditable: function(rowIndex, editable) {
        this.setRowsEditable([rowIndex], editable);
        return this;
    },

    /**
     * Sets many rows editable or not
     * @param {Array} rowIndexes Row indexes to allow editing for
     * @param {Boolean} editable Shall these rows editable or not?
     * @return {Spread.command.Commander}
     */
    setRowsEditable: function(rowIndexes, editable) {
        Spread.selection.Range.fromSpreadRows(this.spreadPanel, rowIndexes).setEditable(editable);
        return this;
    },

    /**
     * Sets the column editable or not
     * @param {Number} columnIndex Column index to set edit mode styling for
     * @param {Boolean} editable Activates/Deactivates edit mode
     * @return {Spread.command.Commander}
     */
    setColumnEditable: function(columnIndex, editable) {
        this.setColumnsEditable([columnIndex], editable);
        return this;
    },

    /**
     * Sets many columns editable or not
     * @param {Array} columnIndexes Row indexes to allow editing for
     * @param {Boolean} editable Shall these columns be editable or not?
     * @return {Spread.command.Commander}
     */
    setColumnsEditable: function(columnIndexes, editable) {
        Spread.selection.Range.fromSpreadColumns(this.spreadPanel, columnIndexes).setEditable(editable);
        return this;
    },

    /**
     * Sets the position selectable
     * @param {Number} columnIndex Cell index
     * @param {Number} rowIndex Row index
     * @param {Boolean} selectable Shall the position be selectable or not?
     * @return {Spread.command.Commander}
     */
    setPositionSelectable: function(columnIndex, rowIndex, selectable) {
        new Spread.selection.Position(
            this.spreadPanel.getView(),
            columnIndex,
            rowIndex
        ).validate().setSelectable(selectable);
        return this;
    },

    /**
     * Sets positions selectable
     * @param {Number} positionIndexes Position indexes array like [{row: 0, column: 2}, ...]
     * @param {Boolean} selectable Shall the position be selectable or not?
     * @return {Spread.command.Commander}
     */
    setSelectable: function(positionIndexes, selectable) {
        Spread.selection.Range.fromSpreadPositions(this.spreadPanel, positionIndexes).setSelectable(selectable);
        return this;
    },

    /**
     * Sets the row selectable or not
     * @param {Number} rowIndex Row index to set edit mode styling for
     * @param {Boolean} selectable Shall the row be selectable or not?
     * @return {Spread.command.Commander}
     */
    setRowSelectable: function(rowIndex, selectable) {
        this.setRowsSelectable([rowIndex], selectable);
        return this;
    },

    /**
     * Sets many rows selectable or not
     * @param {Array} rowIndexes Row indexes to allow selecting for
     * @param {Boolean} selectable Shall these rows selectable or not?
     * @return {Spread.command.Commander}
     */
    setRowsSelectable: function(rowIndexes, selectable) {
        Spread.selection.Range.fromSpreadRows(this.spreadPanel, rowIndexes).setSelectable(selectable);
        return this;
    },

    /**
     * Sets the column selectable or not
     * @param {Number} columnIndex Row index to set edit mode styling for
     * @param {Boolean} selectable Shall this column be selectable or not?
     * @return {Spread.command.Commander}
     */
    setColumnSelectable: function(columnIndex, selectable) {
        this.setColumnsSelectable([columnIndex], selectable);
        return this;
    },

    /**
     * Sets many column selectable or not
     * @param {Array} columnIndexes Row indexes to allow selecting for
     * @param {Boolean} selectable Shall these rows selectable or not?
     * @return {Spread.command.Commander}
     */
    setColumnsSelectable: function(columnIndexes, selectable) {
        Spread.selection.Range.fromSpreadColumns(this.spreadPanel, columnIndexes).setSelectable(selectable);
        return this;
    }
});