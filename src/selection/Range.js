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
    }
});