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

    /**
     * @property {Spread.grid.Panel} spreadPanel
     * Spreadsheet grid panel reference
     */
    spreadPanel: null,

    /**
     * Creates a range object referencing to a spread panel and managing/proxy-ing position instances
     * @param {Spread.grid.Panel} spreadPanel Spread panel instance reference
     * @param {Array} [positions] Optional array of initial positions to hold
     * @return {Object}
     */
    constructor: function(spreadPanel, positions) {

        if (!spreadPanel) {

            throw new Error("Please provide a spreadPanel reference when creating a selection range! " +
                            "Try: new Spread.selection.Range(spreadPanelReference)");
        }

        // Apply the positions onto the instance
        this.spreadPanel = spreadPanel;

        // Set initial positions
        this.setPositions(positions);
    },

    /**
     * Calls the callback method for each position in the store
     * @param {Function} cb Callback called for each position. Arguments: position, index, length
     * @param {Function} [onComplete] Function that gets called when all interation processing is done
     * @return {Spread.selection.Range}
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
        return this;
    },

    /**
     * Removes all positions from the range
     * @return {Spread.selection.Range}
     */
    removeAll: function() {
        this.positions = [];
        return this;
    },

    /**
     * Adds a position to the range
     * @param {Spread.selection.Position} position Position instance
     * @return {Spread.selection.Range}
     */
    add: function(position) {
        this.positions.push(position);
        return this;
    },

    /**
     * Returns true if the given position is already a member of this range
     * @param {Spread.selection.Position} position Position instance
     * @return {Boolean}
     */
    hasPosition: function(position) {

        var me = this, hasPosition = false;
        for (var i=0; i<me.positions.length; i++) {

            if (position === me.positions[i]) {
                hasPosition = true;
            }
        }
        return hasPosition;
    },

    /**
     * Selects all positions of this range
     * @param {Boolean} [virtual=false] Virtual selections do not update the view visually
     * @return {Spread.selection.Range}
     */
    select: function(virtual) {

        var me = this, selModel = this.getSelectionModel();

        // Set selected status on positions
        for (var i=0; i<me.positions.length; i++) {
            me.positions[i].setSelected(true);
        }

        selModel.currentSelectionRange = me;

        if (!virtual) {
            selModel.view.highlightCells(me.positions);
        }
        return me;
    },

    /**
     * De-selects all positions of this range
     * @param {Boolean} [virtual=false] Virtual selections do not update the view visually
     * @return {Spread.selection.Range}
     */
    deselect: function(virtual) {

        var me = this, selModel = this.getSelectionModel();

        // Set selected status on positions
        for (var i=0; i<me.positions.length; i++) {
            me.positions[i].setSelected(false);
        }

        if (!virtual) {
            selModel.view.unhighlightCells(me.positions);
        }
        return me;
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

    /**
     * En/disable the whole range to be editable
     * @param {Boolean} editable Should the whole range be editable?
     * @return {Spread.selection.Range}
     */
    setEditable: function(editable) {

        var me = this, lastPosition = false;

        for (var i=0; i<me.positions.length; i++) {

            if (i === (me.positions.length-1)) {
                lastPosition = true;
            }
            me.positions[i].setEditable(editable, lastPosition);
        }
        return me;
    },

    /**
     * En/disable the whole range to be selectable
     * @param {Boolean} selectable Should the whole range be editable?
     * @return {Spread.selection.Range}
     */
    setSelectable: function(selectable) {

        var me = this, lastPosition = false;

        //console.log('setSelectable', selectable, me.positions);

        for (var i=0; i<me.positions.length; i++) {

            if (i === (me.positions.length-1)) {
                lastPosition = true;
            }
            me.positions[i].setSelectable(selectable, lastPosition);
        }
        return me;
    },

    /**
     * En/disable the whole range to be styled specially when editable
     * @param {Boolean} editModeStyling Should the whole range be styled specially when editable?
     * @return {Spread.selection.Range}
     */
    setEditModeStyling: function(editModeStyling) {

        var me = this, lastPosition = false;

        for (var i=0; i<me.positions.length; i++) {

            if (i === (me.positions.length-1)) {
                lastPosition = true;
            }
            me.positions[i].setEditModeStyling(editModeStyling, lastPosition);
        }
        return me;
    },

    /**
     * Stores the given positions inside the range.
     * @param {Array} positions Array of positions
     * @return {Spread.selection.Range}
     */
    setPositions: function(positions) {

        var me = this;

        if (positions && Ext.isArray(positions)) {

            me.positions = positions;

            if (me.positions && Ext.isArray(me.positions)) {

                for (var i=0; i<me.positions.length; i++) {
                    me.positions[i].setRange(me);
                }
            }
        }
        return me;
    },

    /**
     * Returns the selection model instance the range belongs to
     * @return {Spread.selection.RangeModel}
     */
    getSelectionModel: function() {
        return this.spreadPanel.getSelectionModel();
    },

    /**
     * Returns the spread grid panel reference
     * @return {Spread.grid.Panel}
     */
    getSpreadPanel: function() {
        return this.spreadPanel;
    },

    statics: {

        /**
         * Builds a range instance holding all positions of a spread's row.
         *
         * @param {Spread.grid.Panel} spreadPanel Spreadsheet panel instance
         * @param {Number} rowIndex Row index to collects position instances of
         * @return {Spread.selection.Range}
         */
        fromSpreadRow: function(spreadPanel, rowIndex) {
            return Spread.selection.Range.fromSpreadRows(spreadPanel, [rowIndex]);
        },

        /**
         * Builds a range instance holding all positions of many spread rows.
         *
         * @param {Spread.grid.Panel} spreadPanel Spreadsheet panel instance
         * @param {Array} rowIndexes Row indexes to collect position instances of
         * @return {Spread.selection.Range}
         */
        fromSpreadRows: function(spreadPanel, rowIndexes) {

            // TODO: Check for out-of-bounds error!
            var positionCount = Spread.grid.Panel.getPositionCount(spreadPanel),
                positions = [];

            for (var i=0; i<positionCount.columnCount; i++) {

                for (var j=0; j<rowIndexes.length; j++) {

                    positions.push(

                        new Spread.selection.Position(
                            spreadPanel.getView(),
                            i,
                            rowIndexes[j]
                        )
                    )
                }
            }
            return new Spread.selection.Range(spreadPanel, positions);
        },

        /**
         * Builds a range instance holding all positions of a spread's column.
         *
         * @param {Spread.grid.Panel} spreadPanel Spreadsheet panel instance
         * @param {Number} columnIndex Column index to collect position instances of
         * @return {Spread.selection.Range}
         */
        fromSpreadColumn: function(spreadPanel, columnIndex) {
            return Spread.selection.Range.fromSpreadColumns(spreadPanel, [columnIndex]);
        },

        /**
         * Builds a range instance holding all positions of many spread columns.
         *
         * @param {Spread.grid.Panel} spreadPanel Spreadsheet panel instance
         * @param {Array} columnIndexes Column indexes to collects position instances of
         * @return {Spread.selection.Range}
         */
        fromSpreadColumns: function(spreadPanel, columnIndexes) {

            // TODO: Check for out-of-bounds error!
            var positionCount = Spread.grid.Panel.getPositionCount(spreadPanel),
                positions = [];

            for (var i=0; i<positionCount.rowCount; i++) {

                for (var j=0; j<columnIndexes.length; j++) {

                    positions.push(

                        new Spread.selection.Position(
                            spreadPanel.getView(),
                            columnIndexes[j],
                            i
                        )
                    )
                }
            }
            return new Spread.selection.Range(spreadPanel, positions);
        },

        /**
         * Builds a range instance holding all positions named as position indexes in the positionIndexes array.
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
            //console.log('fromSpreadPositions', positionIndexes, positions);
            return new Spread.selection.Range(spreadPanel, positions);
        }
    }
});