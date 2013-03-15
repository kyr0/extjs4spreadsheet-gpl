/**
 * @class Spread.data.DataMatrix
 * @private
 * Internal class for data matrix operation logic.
 * Implements methods for changing data/reading data of grid cells/records.
 */
Ext.define('Spread.data.DataMatrix', {

    singleton: true,

    /**
     * Get field name for column index by fetching the dataIndex
     * of a given column index from column header container of the view.
     * @param {Spread.grid.View} view View instance
     * @param {Number} columnIndex Column index
     * @return {String}
     */
    getFieldNameForColumnIndex: function(view, columnIndex) {

        var header = view.getHeaderAtIndex(columnIndex);

        if (header) {
            return header.dataIndex;
        } else {
            throw "No column found for column index: " + columnIndex;
        }
    },

    /**
     * Sets a new value of a cell identified by row and column index.
     * Returns, what Ext.data.Model's set() returns.
     * (An array of modified field names or null if nothing was modified)
     *
     * @param {Spread.selection.Position} position Position reference
     * @param {Mixed} newValue New cell value
     * @param {Boolean} [autoCommit=false] Should the record be automatically committed after change
     * @param {Boolean} [useInternalAPIs=false] Force to use the internal Model API's
     * @return {String}
     */
    setValueForPosition: function(position, newValue, autoCommit, useInternalAPIs) {

        //useInternalAPIs = true;

        // Update position
        position.update();

        var fieldName = this.getFieldNameForColumnIndex(position.view, position.column), fieldType;

        if (!position.record) {
            throw "No record found for row index: " + position.row;
        }

        // Caching type name on record instance
        if (!position.record['__' + fieldName + '_type']) {
            position.record['__' + fieldName + '_type'] = this.getTypeForFieldName(fieldName, position.record);
        }

        // Check for pre-processor
        if (position.columnHeader.cellwriter &&
            Ext.isFunction(position.columnHeader.cellwriter)) {

            // Call pre-processor for value writing / change before write
            newValue = position.columnHeader.cellwriter(newValue, position);

        } else {

            // Auto-preprocessor (type conversion)

            // Casting the new value from text received from the text input field into the origin data type
            newValue = this.castFromString(newValue, position.record['__' + fieldName + '_type']);
        }

        // Do not change the record's value if it hasn't changed
        if (position.record.get(fieldName) == newValue) {
            return newValue;
        }

        if (useInternalAPIs) {

            var ret = position.record[
                position.record.persistenceProperty
            ][fieldName] = newValue;

            // Set record dirty
            position.record.setDirty();

        } else {

            // Set new value
            var ret = position.record.set(fieldName, newValue);
        }
        // Automatically commit if wanted
        if (autoCommit &&
            position.columnHeader.autoCommit) {

            position.record.commit();
        }
        return ret;
    },

    /**
     * Returns the primitive type of a field of a record,
     * known by it's field name (dataIndex on column).
     * Returns either: auto, int, float, bool, string or date.
     * @param {String} fieldName Name of the field
     * @param {Ext.data.Model} record Record instance
     * @return {String}
     */
    getTypeForFieldName: function(fieldName, record) {

        var type = 'auto';

        record.fields.each(function(field) {

            // Found the field and it's special type
            if (field.name === fieldName &&
                field.type.type !== 'auto') {

                type = field.type.type;
            }
        });
        return type;
    },

    /**
     * Casts a input string (coming from a text input field)
     * into an object or primitive type. Allowed are all Ext.data.Field types.
     * @param {String} stringValue String value to be casted
     * @param {String} typeName Name of the type. Either: auto, int, float, bool, string or date.
     * @return {*}
     */
    castFromString: function(stringValue, typeName) {

        switch(typeName) {
            case 'bool':
                return (stringValue == 'true');
            case 'int':
                return parseInt(stringValue);
            case 'float':
                return parseFloat(stringValue);
            case 'auto':
            case 'string':
                return stringValue.valueOf();
            case 'date':
                return new Date(stringValue);
        }
    },

    /**
     * Returns the value of a cell identified by row and column index.
     * @param {Spread.selection.Position} position Position reference
     * @return {Mixed}
     */
    getValueOfPosition: function(position) {

        // Update position
        position.update();

        var fieldName = this.getFieldNameForColumnIndex(position.view, position.column),
            value = null;

        if (!position.record) {
            throw "No record found for row index: " + position.row;
        }

        // Fetch raw value
        value = position.record.get(fieldName);

        // Check for pre-processor
        if (position.columnHeader.cellreader &&
            Ext.isFunction(position.columnHeader.cellreader)) {

            // Call pre-processor for value reading
            value = position.columnHeader.cellreader(value, position);
        }
        return value;
    }
});