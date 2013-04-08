/**
 * @class Spread.selection.Range
 * Represents a set of Spread.selection.Position instances
 * and it's helper methods and attributes.
 */
Ext.define('Spread.selection.Range', {

    /**
     * @property {Array} positions
     * Selection positions
     */
    positions: [],

    // private constructor
    constructor: function(config) {

        // Apply the positions onto the instance
        Ext.apply(this, config);
    },

    /**
     * Calls the callback method for each position in the store
     * @param {Function} cb Callback called for each position. Arguments: position, index, length
     * @param {Function} [onComplete] Function that gets called when all interation processing is done
     * @return void
     */
    each: function(cb, onComplete) {
        var me = this;
        for (var i=0; i<me.positions.length; i++) {

            if (Ext.isFunction(cb)) {
                cb(me.positions[i], i, me.positions.length);
            }
        }

        if (Ext.isFunction(onComplete)) {
            onComplete();
        }
    },

    /**
     * Removes all positions from the range
     * @return void
     */
    removeAll: function() {
        this.positions = [];
    },

    /**
     * Adds a position to the range
     * @param {Spread.selection.Position} position Position instance
     * @return void
     */
    add: function(position) {
        this.positions.push(position);
    },

    /**
     * Selects all positions of this range
     * @param {Spread.selection.RangeModel} selModel Selection model reference
     * @param {Boolean} [virtual=false] Virtual selections do not update the view visually
     * @return void
     */
    select: function(selModel, virtual) {

        selModel.currentSelectionRange = this;

        if (!virtual) {
            selModel.view.highlightCells(this.positions);
        }
    },

    /**
     * De-selects all positions of this range
     * @param {Spread.selection.RangeModel} selModel Selection model reference
     * @param {Boolean} [virtual=false] Virtual selections do not update the view visually
     * @return void
     */
    deselect: function(selModel, virtual) {

        if (!virtual) {
            selModel.view.unhighlightCells(this.positions);
        }
    },

    /**
     * Returns the count of positions stored inside this range
     * @return {Number}
     */
    count: function() {
        return this.positions.length;
    },

    /**
     * Returns all positions stored in this range as array
     * @return {Array}
     */
    toArray: function() {
        return this.positions;
    },

    /**
     * Returns the first position in the range
     * @return {Spread.selection.Position}
     */
    getFirst: function() {
        return this.positions[0];
    },

    /**
     * Returns the last position in the range
     * @return {Spread.selection.Position}
     */
    getLast: function() {
        return this.positions[this.positions.length-1];
    },

    statics: {

        /**
         * Builds a range instance holding all positions
         * of a spread's row.
         *
         * @param {Spread.grid.Panel} spreadPanel Spreadsheet panel instance
         * @param {Number} rowIndex Row index to collects position instances of
         * @return {Spread.selection.Range}
         */
        fromSpreadRow: function(spreadPanel, rowIndex) {

            // TODO: Check for out-of-bounds error!
            var positionCount = Spread.grid.Panel.getPositionCount(spreadPanel),
                positions = [];

            for (var i=0; i<positionCount.columnCount; i++) {

                positions.push(

                    new Spread.selection.Position(
                        spreadPanel.getView(),
                        i,
                        rowIndex
                    )
                )
            }

            return Ext.create('Spread.selection.Range', {
                positions: positions
            });
        },

        /**
         * Builds a range instance holding all positions
         * of a spread's column.
         *
         * @param {Spread.grid.Panel} spreadPanel Spreadsheet panel instance
         * @param {Number} columnIndex Column index to collects position instances of
         * @return {Spread.selection.Range}
         */
        fromSpreadColumn: function(spreadPanel, columnIndex) {

            // TODO: Check for out-of-bounds error!
            var positionCount = Spread.grid.Panel.getPositionCount(spreadPanel),
                positions = [];

            for (var i=0; i<positionCount.rowCount; i++) {

                positions.push(

                    new Spread.selection.Position(
                        spreadPanel.getView(),
                        columnIndex,
                        i
                    )
                )
            }

            return Ext.create('Spread.selection.Range', {
                positions: positions
            });
        },

        /**
         * Builds a range instance holding all positions
         * named as position indexes in the positionIndexes array.
         *
         * @param {Spread.grid.Panel} spreadPanel Spreadsheet panel instance
         * @param {Number} positionIndexes Position indexes array like [{row: 0, column: 2}, ...]
         * @return {Spread.selection.Range}
         */
        fromSpreadPositions: function(spreadPanel, positionIndexes) {

            // TODO: Check for out-of-bounds error!
            var positionCount = Spread.grid.Panel.getPositionCount(spreadPanel),
                positions = [];

            for (var i=0; i<positionIndexes.length; i++) {

                positions.push(

                    new Spread.selection.Position(
                        spreadPanel.getView(),
                        positionIndexes[i].column,
                        positionIndexes[i].row
                    )
                )
            }

            return Ext.create('Spread.selection.Range', {
                positions: positions
            });
        }
    }
});