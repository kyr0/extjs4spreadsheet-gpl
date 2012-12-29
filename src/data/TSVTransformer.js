/**
 * @class Spread.data.TSVTransformer
 * @private
 * Internal class for transforming data pasted from native spreadsheet applications to TSV and back.
 */
Ext.define('Spread.data.TSVTransformer', {

    singleton: true,

    /**
     * @property {String} lineSeparator
     * Line separator char sequence
     */
    lineSeparator: '\n',

    /**
     * @property {String} columnSeparator
     * Column separator char sequence
     */
    columnSeparator: '\t',

    /**
     * Transforms plain array data into TSV plaintext
     * @param {Array} selectionPositions Array of selected position instances
     * @return {String}
     */
    transformToTSV: function(selectionPositions) {

        var currentRow = -1,
            tsvText = '';

        //console.log('transformToTSV', selectionPositions);

        // Loop to already well-ordered array
        for (var i=0; i<selectionPositions.length; i++) {

            // Update record first
            selectionPositions[i].update();

            // Add line break
            if (currentRow !== selectionPositions[i].row &&
                currentRow !== -1) {
                tsvText = this.addLineBreak(tsvText);
            }
            currentRow = selectionPositions[i].row;

            // Add cell value
            tsvText = this.addValue(tsvText, selectionPositions[i]);

            // Add tabulator
            if (selectionPositions[i+1] &&
                selectionPositions[i+1].column !== selectionPositions[+1].view.getSelectionModel().rootPosition.column) {
                tsvText = this.addTabulator(tsvText);
            }
        }
        //console.log('tsvText', tsvText);

        return tsvText;
    },

    /**
     * Transforms pasted TSV data into plain array data
     * @param {String} clipboardData Pasted TSV or Excel plain clipboard data
     * @return {Array}
     */
    transformToArray: function(clipboardData) {

        var dataArray = [],
            rows = clipboardData.split(this.lineSeparator);

        //console.log('transformToArray', clipboardData, rows);

        for (var i=0; i<(rows.length-1); i++) {

            dataArray.push(
                rows[i].split(this.columnSeparator)
            );
        }
        return dataArray;
    },

    /**
     * Adds line break chars to buffer
     * @param {String} tsvText Current buffer
     * @return {String}
     */
    addLineBreak: function(tsvText) {
        return tsvText + this.lineSeparator;
    },

    /**
     * Adds a tabulator char to buffer
     * @param {String} tsvText Current buffer
     * @return {String}
     */
    addTabulator: function(tsvText) {
        return tsvText + this.columnSeparator;
    },

    /**
     * Adds the value to the buffer
     * @param {String} tsvText Current buffer
     * @param {Spread.selection.Position} position Position reference
     * @return {String}
     */
    addValue: function(tsvText, position) {
        return tsvText += Spread.data.DataMatrix.getValueOfPosition(position);
    }
});