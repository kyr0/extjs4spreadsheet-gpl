/**
 * @class Spread.selection.Position
 *
 * Class for representing a position in the grid view / selection model.
 * Instances of this class are used for identifying all components which
 * belong to a single cell. Such as:
 * <ul>
 *     <li>The view</li>
 *     <li>The column index</li>
 *     <li>The row index</li>
 *     <li>The row data record</li>
 *     <li>The data record's model class</li>
 *     <li>The column header</li>
 *     <li>The row element (html)</li>
 *     <li>The cell element (html)</li>
 * </ul>
 *
 * Using this unified identification instance, extending and implementing
 * spreadsheets is much simpler than standard Ext JS grids.
 *
 * Before using a Position instance, please call update() to ensure all
 * references to be valid.
 */
Ext.define('Spread.selection.Position', {

    /**
     * @property {Spread.selection.Range} range
     * Stores the reference of the range this position belongs to (Only if it does belong to any range!)
     */
    range: null,

    /**
     * @property {Spread.grid.Panel} spreadPanel Reference to the spread grid panel
     */
    spreadPanel: null,

    /**
     * @property {Spread.grid.View} view
     * View instance the position belongs to
     */
    view: null,

    /**
     * @property {Number} column
     * Column index, the position belongs to
     */
    column: -1,

    /**
     * @property {Number} row
     * Row index, the position belongs to
     */
    row: -1,

    /**
     * @property {Ext.data.Model} record
     * Data record (instance of Ext.data.Model) the position belongs to (in store).
     * If not given, this will be auto-detected.
     */
    record: null,

    /**
     * @property {Function} model
     * Reference to the model class constructor of the record of the position.
     * If not given, this will be auto-detected.
     */
    model: null,

    /**
     * @property {Ext.grid.column.Column} columnHeader
     * Column instance (header) the position belongs to.
     * If not given, this will be auto-detected.
     */
    columnHeader: null,

    /**
     * @property {HTMLElement} rowEl
     * Row element instance <tr>, the position belongs to.
     * If not given, this will be auto-detected.
     */
    rowEl: null,

    /**
     * @property {HTMLElement} cellEl
     * Cell element instance <td>, the position belongs to.
     * If not given, this will be auto-detected.
     */
    cellEl: null,

    /**
     * @property {Boolean} editable
     * Indicator flag describing if the position is editable
     */
    editable: false,

    /**
     * @property {Boolean} selectable
     * Indicator flag describing if the position is selectable
     */
    selectable: true,

    /**
     * @property {Boolean} editModeStyling
     * Indicator flag describing if the position should be specially colored when editable
     */
    editModeStyling: true,

    /**
     * @property {Boolean} focused
     * Status flag if the position is currently being focused
     */
    focused: false,

    /**
     * @property {Boolean} editing
     * Status flag if the position is currently in edit mode
     */
    editing: false,

    /**
     * @property {Boolean} selected
     * Status flag if the position resists currently in a selected range
     */
    selected: false,

    /**
     * Creates a position object which points to a cell position, record, column-header
     * and view reference. For performance reasons, try to call this function with all
     * arguments. More arguments given, means less auto detection effort.
     * @param {Spread.grid.View} view Spread view instance reference
     * @param {Number} columnIndex Column index
     * @param {Number} rowIndex Row index
     * @param {Ext.data.Model} [record=auto-detect] Data record instance
     * @param {HTMLElement} [rowEl=auto-detect] Row's HTML element (tr-element)
     * @param {HTMLElement} [cellEl=auto-detect] Cell's HTML element (td-element)
     * @return {Object}
     */
    constructor: function(view, columnIndex, rowIndex, record, rowEl, cellEl) {

        //console.log('instantiation of Position', arguments);

        // Correct row and column index if outside of possible grid boundings
        var maxRowCount = view.getStore().getCount(),
            maxColumnCount = view.headerCt.getGridColumns(true).length;

        // Column boundary protection
        if (columnIndex >= maxColumnCount) {
            columnIndex = (maxColumnCount-1);
        }

        // Row boundary protection
        if (rowIndex >= maxRowCount) {
            rowIndex = (maxRowCount-1);
        }

        var rowEl = rowEl || view.getNode(rowIndex),
            record = record || view.getStore().getAt(rowIndex),
            model = null;

        // Try to auto-detect
        if (rowEl) {
            cellEl = cellEl || rowEl.childNodes[columnIndex];
        } else {
            cellEl = cellEl || null;
        }

        // If record was given or detected, map it's model reference
        if (record) {
            model = record.self;
        }

        //console.log('TRY FETCH ROW td', rowEl);
        //console.log('TRY FETCH CELL td', cellEl);

        Ext.apply(this, {
            view: view,
            spreadPanel: view.getSpreadPanel(),
            column: columnIndex,
            row: rowIndex,
            record: model,
            model: record ? record.self : undefined,
            columnHeader: view.getHeaderAtIndex(columnIndex),
            rowEl: rowEl,
            cellEl: cellEl
        });
    },

    /**
     * (Re)validates the position object and it's internal references.
     * This is useful when view has been refreshed and record or
     * cell or row of the position has been changed.
     * @return {Spread.selection.Position}
     */
    validate: function() {

        this.spreadPanel = this.view.getSpreadPanel();

        this.record = this.view.getStore().getAt(this.row);

        // If record was given or detected, map it's model reference
        if (this.record) {
            this.model = this.record.self;
        } else {
            this.model = null;
        }

        // Assign updated values/references
        this.columnHeader = this.view.getHeaderAtIndex(this.column);
        this.rowEl = this.view.getNode(this.row);

        if (this.rowEl) {
            this.cellEl = this.rowEl.childNodes[this.column];
        }

        //console.log('Position update()ed ', this);

        return this;
    },

    /**
     * Get field name by fetching the dataIndex
     * of a given column index from column header container of the view.
     * @return {String}
     */
    getFieldName: function() {

        var me = this,
            header = me.view.getHeaderAtIndex(me.column);

        if (header) {
            return header.dataIndex;
        } else {
            throw "No column found for column index: " + me.column;
        }
    },

    /**
     * Returns the primitive type of the position.
     * Returns either: auto, int, float, bool, string or date.
     * @return {String}
     */
    getType: function() {

        var me = this,
            type = 'auto',
            fieldName = me.getFieldName();

        // Caching type name on record instance
        if (!me.record['__' + fieldName + '_type']) {

            me.record.fields.each(function(field) {

                // Found the field and it's special type
                if (field.name === fieldName &&
                    field.type.type !== 'auto') {

                    type = field.type.type;
                }
            });
            return me.record['__' + fieldName + '_type'] = type;
        }
        return me.record['__' + fieldName + '_type'];
    },

    /**
     * Casts a new value into the primitive type
     * needed by the position's under-laying model.
     * @param {String} newValue New value
     * @return {*}
     */
    castNewValue: function(newValue) {

        var me = this;

        // null or undefined
        if (!Ext.isDefined(newValue) || newValue === null) {
            return newValue;
        }

        // Do casting
        switch(me.getType()) {
            case 'bool':
                return (newValue == 'true');
            case 'int':
                return parseInt(newValue);
            case 'float':
                return parseFloat(newValue);
            case 'auto':
            case 'string':
                return newValue.valueOf();
            case 'date':
                return new Date(newValue);
        }
    },

    /**
     * Returns, what Ext.data.Model's set() returns.
     * (An array of modified field names or null if nothing was modified)
     *
     * @param {Mixed} newValue New cell value
     * @param {Boolean} [autoCommit=false] Should the record be automatically committed after change
     * @param {Boolean} [useInternalAPIs=false] Force to use the internal Model API's
     * @return {String}
     */
    setValue: function(newValue, autoCommit, useInternalAPIs) {

        var me = this,
            fieldName,
            ret;

        // Update position
        me.validate();

        if (!autoCommit && !me.columnHeader.autoCommit) {
            //useInternalAPIs = true;
        }

        // Fetch field name
        fieldName = me.getFieldName();

        if (!me.record) {
            throw "No record found for row index: " + me.row;
        }

        // Check for pre-processor
        if (me.columnHeader.cellwriter &&
            Ext.isFunction(me.columnHeader.cellwriter)) {

            // Call pre-processor for value writing / change before write
            newValue = me.columnHeader.cellwriter(newValue, me);

        } else {

            // Auto-preprocessor (type conversion)

            // Casting the new value from text received from
            // the text input field into the origin data type
            newValue = me.castNewValue(newValue);
        }

        // Do not change the record's value if it hasn't changed
        if (me.record.get(fieldName) == newValue) {
            return newValue;
        }

        if (useInternalAPIs) {

            ret = me.record[
                me.record.persistenceProperty
            ][fieldName] = newValue;

            // Set record dirty
            me.record.setDirty();

        } else {

            // Set new value
            ret = me.record.set(fieldName, newValue);
        }
        // Automatically commit if wanted
        if (autoCommit &&
            me.columnHeader.autoCommit) {

            me.record.commit();
        }
        return ret;
    },

    /**
     * Returns the value of the position
     * @return {*}
     */
    getValue: function() {

        var me = this,
            fieldName, value;

        // Update position
        me.validate();

        // Fetch field name
        fieldName = me.getFieldName();

        if (!me.record) {
            throw "No record found for row index: " + me.row;
        }

        // Fetch raw value
        value = me.record.get(fieldName);

        // Check for pre-processor
        if (me.columnHeader.cellreader &&
            Ext.isFunction(me.columnHeader.cellreader)) {

            // Call pre-processor for value reading
            value = me.columnHeader.cellreader(value, me);
        }
        return value;
    },

    /**
     * Focuses the position
     * @return {Spread.selection.Position}
     */
    focus: function() {

        if (!this.isFocusable()) return this;

        // Set state flag
        this.focused = true;

        // Render selected
        this.view.getSelectionModel().setCurrentFocusPosition(this);

        return this;
    },

    /**
     * Returns true if the position is currently focused
     * @return {Boolean}
     */
    isFocused: function() {
        return this.focused;
    },

    /**
     * Returns true if the position is focusable
     * @return {Boolean}
     */
    isFocusable: function() {
        return this.isSelectable();
    },

    /**
     * En/disable the position to be editable
     * @param {Boolean} editable Should the position be editable?
     * @param {Boolean} [suppressNotify=false] Used for transactions when method gets called many times, only the last call should notify the view to trigger a re-rendering.
     * @return {Spread.selection.Position}
     */
    setEditable: function(editable, suppressNotify) {

        this.editable = editable;

        if (!Ext.isDefined(suppressNotify)) {
            // TODO: Inform plugin
            //console.log('unimplemented');
        }
        return this;
    },

    /**
     * Returns if the position is editable.
     * Also checks if the column the position resides in is editable.
     * @return {Boolean}
     */
    isEditable: function() {

        if (this.getColumn().editable && this.editable) {
            return true;
        }
        return false;
    },

    /**
     * Sets the position editing
     * @param {Boolean} editing Should the position be editable?
     * @return {Spread.selection.Position}
     */
    setEditing: function(editing) {

        if (!this.isEditable()) return this;

        this.editing = editing;

        if (editing) {
            // TODO: Activate editor
            //console.log('unimplemented');
        } else {
            // TODO: Deactivate editor (inform plugin)
            //console.log('unimplemented');
        }
        return this;
    },

    /**
     * Returns if the position is currently being edited
     * @return {Boolean}
     */
    isEditing: function() {
        return this.editing;
    },

    /**
     * En/disable the position to be selectable
     * @param {Boolean} selectable Should the position be editable?
     * @param {Boolean} [suppressNotify=false] Used for transactions when method gets called many times, only the last call should notify the view to trigger a re-rendering.
     * @return {Spread.selection.Position}
     */
    setSelectable: function(selectable, suppressNotify) {

        this.selectable = selectable;

        //console.log('setSelectable', this.row, this.column, selectable);

        if (!Ext.isDefined(suppressNotify)) {
            // TODO: Inform plugin
            //console.log('unimplemented');
        }
        return this;
    },

    /**
     * Returns if the position is selectable.
     * Also checks if the column the position resides in is selectable or not.
     * @return {Boolean}
     */
    isSelectable: function() {

        if (this.getColumn().selectable && this.selectable) {
            return true;
        }
        return false;
    },

    /**
     * En/disable the position to be styled specially when editable
     * @param {Boolean} editModeStyling Should the position be styled specially when editable?
     * @param {Boolean} [suppressNotify=false] Used for transactions when method gets called many times, only the last call should notify the view to trigger a re-rendering.
     * @return {Spread.selection.Position}
     */
    setEditModeStyling: function(editModeStyling, suppressNotify) {

        this.editModeStyling = editModeStyling;

        if (!Ext.isDefined(suppressNotify)) {
            // TODO: Inform plugin
            //console.log('unimplemented');
        }
        return this;
    },

    /**
     * Returns if the position is has edit mode styling enabled
     * @return {Boolean}
     */
    hasEditModeStyling: function() {
        return this.editModeStyling;
    },

    /**
     * @protected
     * Sets the internal selected status flag.
     * This method does not visually select a position.
     * Use the range.select() and range.deselect() methods or the
     * Commander API if you want to select positions (ranges!).
     * @param {Boolean} selected Indicates if the position should be set selected
     * @return {Spread.selection.Position}
     */
    setSelected: function(selected) {

        if (!this.isSelectable()) return this;

        this.selected = selected;

        return this;
    },

    /**
     * Returns if the position currently resists in a range currently being selected
     * @return {Boolean}
     */
    isSelected: function() {
        return this.selected;
    },

    /**
     * Sets the range instance reference
     * @param {Spread.selection.Range} range Selection range reference
     * @return {Spread.selection.Position}
     */
    setRange: function(range) {
        this.range = range;
        return this;
    },

    /**
     * Returns a range reference if given
     * @return {Spread.selection.Range/null}
     */
    getRange: function() {
        return this.range;
    },

    /**
     * Returns the selection model reference
     * @return {Ext.selection.Model}
     */
    getSelectionModel: function() {
        return this.getSpreadPanel().getSelectionModel();
    },

    /**
     * Returns the view reference
     * @return {Spread.grid.View}
     */
    getView: function() {
        return this.view;
    },

    /**
     * Returns the spread panel reference
     * @return {Spread.grid.Panel}
     */
    getSpreadPanel: function() {
        return this.spreadPanel;
    },

    /**
     * Returns the row index
     * @return {Number}
     */
    getRowIndex: function() {
        return this.row;
    },

    /**
     * Returns the column index
     * @return {Number}
     */
    getColumnIndex: function() {
        return this.column;
    },

    /**
     * Returns the column header instance
     * @return {Ext.grid.column.Column}
     */
    getColumn: function() {
        return this.columnHeader;
    },

    /**
     * Returns the grid data record
     * @return {Ext.data.Record}
     */
    getRowRecord: function() {
        return this.record;
    },

    /**
     * Returns the model class constructor function the record is an instance of
     * @return {Function}
     */
    getModelClass: function() {
        return this.model;
    }
});