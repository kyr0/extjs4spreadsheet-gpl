/**
 * @class Spread.command.Commander
 *
 * Class that implements a public command API for a more
 * simple and interactive use of the spreads internal features.
 */
Ext.define('Spread.command.Commander', {

    requires: ['Spread.selection.Range'],

    /**
     * @property {Spread.grid.Panel} spreadPanel Spread panel reference
     */
    spreadPanel: null,

    // private
    constructor: function(config) {
        Ext.apply(this, config);
    },

    // private, helper method
    _select: function(range, virtual) {

        var firstRecord = range.getFirst(),
            selModel;

        // Select if view is accessible
        if (firstRecord.view) {

            selModel = firstRecord.view.getSelectionModel();
            range.select(selModel, virtual);
        }
    },

     // private, helper method
    _deselect: function(range, virtual) {

        var firstRecord = range.getFirst(),
            selModel;

        // Select if view is accessible
        if (firstRecord.view) {

            selModel = firstRecord.view.getSelectionModel();
            range.deselect(selModel, virtual);
        }
    },

    /**
     * Selects a range of positions named by indexes
     * @param {Number} positionIndexes Position indexes array like [{row: 0, column: 2}, ...]
     * @param {Boolean} [virtual=false] Virtual selections do not update the view visually
     * @return {Spread.command.Commander}
     */
    select: function(positionIndexes, virtual) {

        var range = Spread.selection.Range.fromSpreadPositions(this.spreadPanel, positionIndexes);

        this._select(range, virtual);

        return this;
    },

    /**
     * Selects a row named by it's row index
     * @param {Number} rowIndex Row to select
     * @param {Boolean} [virtual=false] Virtual selections do not update the view visually
     * @return {Spread.command.Commander}
     */
    selectRow: function(rowIndex, virtual) {

        var range = Spread.selection.Range.fromSpreadRow(this.spreadPanel, rowIndex);

        this._select(range, virtual);

        return this;
    },

    /**
     * Selects rows named by it's row indexes
     * @param {Array} rowIndexes Row indexes to select, e.g. [0, 1, 2]
     * @param {Boolean} [virtual=false] Virtual selections do not update the view visually
     * @return {Spread.command.Commander}
     */
    selectRows: function(rowIndexes, virtual) {

        var range, positions = [];

        for (var i=0; i<rowIndexes.length; i++) {

            positions = Ext.Array.merge(
                positions,
                Spread.selection.Range.fromSpreadRow(this.spreadPanel, rowIndexes[i]).positions
            );
        }

        range = Ext.create('Spread.selection.Range', {
            positions: positions
        });

        this._select(range, virtual);

        return this;
    },

    /**
     * Selects a column named by it's column index
     * @param {Number} columnIndex Column to select
     * @param {Boolean} [virtual=false] Virtual selections do not update the view visually
     * @return {Spread.command.Commander}
     */
    selectColumn: function(columnIndex, virtual) {

        var range = Spread.selection.Range.fromSpreadColumn(this.spreadPanel, columnIndex);

        this._select(range, virtual);

        return this;
    },

    /**
     * Selects columns named by it's column indexes
     * @param {Array} columnIndexes Columns to select, e.g. [2, 3, 4]
     * @param {Boolean} [virtual=false] Virtual selections do not update the view visually
     * @return {Spread.command.Commander}
     */
    selectColumns: function(columnIndexes, virtual) {

        var positions = [], range;

        for (var i=0; i<columnIndexes.length; i++) {

            positions = Ext.Array.merge(
                positions,
                Spread.selection.Range.fromSpreadColumn(this.spreadPanel, columnIndexes[i]).positions
            );
        }

        range = Ext.create('Spread.selection.Range', {
            positions: positions
        });

        this._select(range, virtual);

        return this;
    },

    /**
     * De-Selects a range of positions named by indexes
     * @param {Number} positionIndexes Position indexes array like [{row: 0, column: 2}, ...]
     * @param {Boolean} [virtual=false] Virtual selections do not update the view visually
     * @return {Spread.command.Commander}
     */
    deselect: function(positionIndexes, virtual) {

        var range = Spread.selection.Range.fromSpreadPositions(this.spreadPanel, positionIndexes);

        this._deselect(range, virtual);

        return this;
    },

    /**
     * De-Selects a row named by it's row index
     * @param {Number} rowIndex Row to select
     * @param {Boolean} [virtual=false] Virtual selections do not update the view visually
     * @return {Spread.command.Commander}
     */
    deselectRow: function(rowIndex, virtual) {

        var range = Spread.selection.Range.fromSpreadRow(this.spreadPanel, rowIndex);

        this._deselect(range, virtual);

        return this;
    },

    /**
     * De-Selects rows named by it's row indexes
     * @param {Array} rowIndexes Row indexes to select, e.g. [0, 1, 2]
     * @param {Boolean} [virtual=false] Virtual selections do not update the view visually
     * @return {Spread.command.Commander}
     */
    deselectRows: function(rowIndexes, virtual) {

        var range, positions = [];

        for (var i=0; i<rowIndexes.length; i++) {

            positions = Ext.Array.merge(
                positions,
                Spread.selection.Range.fromSpreadRow(this.spreadPanel, rowIndexes[i]).positions
            );
        }

        range = Ext.create('Spread.selection.Range', {
            positions: positions
        });

        this._deselect(range, virtual);

        return this;
    },

    /**
     * De-Selects a column named by it's column index
     * @param {Number} columnIndex Column to select
     * @param {Boolean} [virtual=false] Virtual selections do not update the view visually
     * @return {Spread.command.Commander}
     */
    deselectColumn: function(columnIndex, virtual) {

        var range = Spread.selection.Range.fromSpreadColumn(this.spreadPanel, columnIndex);

        this._deselect(range, virtual);

        return this;
    },

    /**
     * De-Selects columns named by it's column indexes
     * @param {Array} columnIndexes Columns to select, e.g. [2, 3, 4]
     * @param {Boolean} [virtual=false] Virtual selections do not update the view visually
     * @return {Spread.command.Commander}
     */
    deselectColumns: function(columnIndexes, virtual) {

        var positions = [], range;

        for (var i=0; i<columnIndexes.length; i++) {

            positions = Ext.Array.merge(
                positions,
                Spread.selection.Range.fromSpreadColumn(this.spreadPanel, columnIndexes[i]).positions
            );
        }

        range = Ext.create('Spread.selection.Range', {
            positions: positions
        });

        this._deselect(range, virtual);

        return this;
    },

    /**
     * Focuses the named cell
     * @param {Number} columnIndex Cell index
     * @param {Number} rowIndex Row index
     * @return {Spread.command.Commander}
     */
    focusCell: function(columnIndex, rowIndex) {

        // TODO: Check for out-of-bounds error
        new Spread.selection.Position(
            this.spreadPanel.getView(),
            columnIndex,
            rowIndex
        ).validate().focus();
    }
});