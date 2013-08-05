/**
 * @class Spread.util.State
 * @singleton
 *
 * Holds the cell's state values for one or many spread instances.
 */
Ext.define('Spread.util.State', {

    singleton: true,

    positionStates: {},

    setPositionState: function(position, name, value) {

        var spreadId,
            states = this.positionStates;

        if (position.spreadPanel) {
            spreadId = position.spreadPanel.instanceStateId;
        } else {
            spreadId = 'undefined';
        }

        if (!states[spreadId]) {
            states[spreadId] = {};
        }

        // Prepare
        if (!states[spreadId][position.row]) {
            states[spreadId][position.row] = {};
        }

        if (!states[spreadId][position.row][position.column]) {
            states[spreadId][position.row][position.column] = {};
        }

        // Set value
        states[spreadId][position.row][position.column][name] = value;

        // Persist it in DOM for faster rendering algorithms/lookup
        /*
        if (position.cellEl) {
            position.cellEl['data-spread-cell-' + name] = String(value);
        }
        */
    },

    getPositionState: function(position, name) {

        var spreadId,
            states = this.positionStates;

        if (position.spreadPanel) {
            spreadId = position.spreadPanel.instanceStateId;
        } else {
            spreadId = 'undefined';
        }

        if (!states[spreadId]) {
            return undefined;
        }

        if (!states[spreadId][position.row]) {
            return undefined;
        }

        if (!states[spreadId][position.row][position.column]) {
            return undefined;
        }
        return states[spreadId][position.row][position.column][name];
    },

    /**
     * Clears the state data for a given spread id
     * @param {String} spreadId Spread id
     * @return void
     */
    clear: function(spreadId) {
        this.positionStates[spreadId] = {};
    }
});