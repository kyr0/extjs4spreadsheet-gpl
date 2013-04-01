/**
 * Ext.spread.command.Commander
 * Class that implements a public command API for a more
 * simple usage of the spreads features.
 */
Ext.define('Spread.command.Commander', {

    requires: ['Spread.selection.Range'],

    /**
     * Selects a range of positions
     * @param {Spread.selection.Range} range Range of positions to select
     * @param {Boolean} [virtual=false] Virtual selections do not update the view visually
     * @return {Spread.selection.Range}
     */
    select: function(range, virtual) {

        var firstRecord = range.getFirst(),
            selModel;

        // Select if view is accessible
        if (firstRecord.view) {
            selModel = firstRecord.view.getSelectionModel();
            range.select(selModel, virtual);
        }
    }
});