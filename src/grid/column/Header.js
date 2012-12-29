/**
 * @class Spread.grid.column.Header
 *
 * A grid column which cells look and feel like column headers. (Grayed out)
 * Typically used as first column like a row numberer - known from spreadsheet applications.
 */
Ext.define('Spread.grid.column.Header', {

    extend: 'Ext.grid.RowNumberer',

    alias: 'widget.spreadheadercolumn',

    /**
     * @cfg {Boolean} editable
     * If a column is configured as header column, the values aren't editable by default.
     * If it should be editable, it needs to be selectable too.
     */
    editable: false,

    /**
     * @cfg {Number} columnWidth
     * Width of the header column width in pixel
     */
    columnWidth: 60,

    /**
     * @cfg {Boolean} selectable
     * If a column is configured as header column, the values aren't selectable nor focusable by default
     */
    selectable: false,

    /**
     * @cfg {String} dataIndex
     * Index of the column id by default
     */
    dataIndex: 'id',

    // Resizing is allowed by default
    resizable: true,

    /**
     * @private
     */
    constructor: function(config) {

        // Reinvent the logic of Ext.grid.column.Column and prevent RowNumberer logic
        config.width = config.columnWidth || this.columnWidth;

        // TODO: Handle renderer given by instance configuration (config!)

        this.callParent(arguments);
    },

    // private
    renderer: function(value, metaData, record, rowIdx, colIdx, store) {

        var rowspan = this.rowspan;

        if (rowspan){
            metaData.tdAttr = 'rowspan="' + rowspan + '"';
        }
        metaData.tdCls = Ext.baseCSSPrefix + 'grid-cell-header ' +
                         Ext.baseCSSPrefix + 'grid-cell-special';
        return value;
    }
});