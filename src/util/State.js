/**
 * @class Spread.util.State
 * @singleton
 */
Ext.define('Spread.util.State', {

    singleton: true,

    positionStates: {},

    setPositionState: function(position, name, value) {

        // Prepare
        if (!this.positionStates[position.row]) {
            this.positionStates[position.row] = {};
        }

        if (!this.positionStates[position.row][position.column]) {
            this.positionStates[position.row][position.column] = {};
        }

        // Set value
        this.positionStates[position.row][position.column][name] = value;

        // Persist it in DOM for faster rendering algorithms/lookup
        /*
        if (position.cellEl) {
            position.cellEl['data-spread-cell-' + name] = String(value);
        }
        */
    },

    getPositionState: function(position, name) {

        if (!this.positionStates[position.row]) {
            return undefined;
        }

        if (!this.positionStates[position.row][position.column]) {
            return undefined;
        }
        return this.positionStates[position.row][position.column][name];
    }
});