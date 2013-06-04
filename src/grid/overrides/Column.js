/**
 * @class Spread.overrides.Column
 * @overrides Ext.grid.column.Column
 * Overrides to the standard gird column to implement spreadsheet-specific features.
 */
Ext.define('Spread.overrides.Column', {

    'override': 'Ext.grid.column.Column',

    initialPanelEditModeStyling: false,

    /**
     * @cfg {Boolean} selectable
     * If a column is configured as header column, the values aren't selectable nor focusable
     */
    selectable: true,

    /**
     * @cfg {Boolean} editable
     * If the column is editable, the edit fields gets active on key type-in or double-clicking
     */
    editable: true,

    /**
     * @cfg {Boolean} autoCommit
     * Auto-commit cell data changes on record automatically
     * (otherwise the data change indicator will be shown and record needs to be commit()'ed manually!
     */
    autoCommit: false,

    /**
     * @cfg {Function} cellwriter
     * Pre-processor function for cell data write operations - if you want to modify cell data before record update.
     * (e.g. when edit field gets blur()'ed and updates the record AND when selection paste (ctrl+v) happens,
     * this function gets called, when it's defined. The return value of this function will be used as new data value.
     */
    cellwriter: null,

    /**
     * @cfg {Function} cellreader
     * Pre-processor function for cell read operations - if you want to modify cell data while reading from record.
     * (e.g. when edit field gets active and loads cell data AND when selection copy (ctrl+c) happens,
     * this function gets called, when it's defined. The return value of this function will be used.
     */
    cellreader: null,

    /**
     * @cfg {Boolean} editModeStyling
     * If you enable special styles for editable columns they will
     * be displayed with a special background color and selection color.
     */
    editModeStyling: true,

    /**
     * @cfg {Array} allowedEditKeys
     * Specifies the allowed keys so that only these keys can be typed into the edit field
     */
    allowedEditKeys: [],

    // private
    initComponent: function() {

        // Handle UI stuff
        this.initDynamicColumnTdCls();

        // Call parent
        this.callParent(arguments);
    },

    /**
     * @private
     * Handles cell <td> addition of CSS classes
     * @return void
     */
    initDynamicColumnTdCls: function() {

        if (!this.selectable) {

            // If not selectable, then editing is impossible
            this.editable = false;

            // Add unselectable class
            this.tdCls = 'spreadsheet-cell-unselectable';
        }

        // Check for editable flag and for edit mode styling
        if (this.editable && this.editModeStyling &&
            this.initialPanelEditModeStyling) {

            // Add editable class
            this.tdCls += ' ' + 'spreadsheet-cell-editable';
        }
    }
});
