/**
 * @class Spread.grid.View
 *
 * The Spread view class extends the Ext.grid.View by implementing UI features like
 * covering cells with a border-marker (known from spreadsheet applications) and cell
 * selection background color change.
 *
 * <b>Please use the Grid's viewConfig-property for configuration of the view.</b>
 */
Ext.define('Spread.grid.View', {

    extend: 'Ext.grid.View',

    alias: 'widget.spreadview',

    stripeRows: false,
    trackOver: false,
    spreadViewBaseCls: 'spreadsheet-view',
    cellCoverEl: null,
    currentCoverPosition: null,
    currentHighlightPositions: [],
    dataChangedRecently: true,

    /**
     * @property {Spread.grid.Panel} spreadPanel Reference to the spread grid panel
     */
    spreadPanel: null,

    /**
     * @cfg {Boolean} autoFocus
     * Automatically focus spread view for direct key eventing/navigation after render
     */
    autoFocus: true,

    /**
     * @cfg {Number} autoFocusDelay
     * Auto focus delay in ms
     */
    autoFocusDelay: 50,

    /**
     * @cfg {Number} cellFocusDelay
     * Cell (re-)focus delay in ms
     */
    cellFocusDelay: 30,

    /**
     * @cfg {Number} cellCoverZIndex
     * Value of zIndex for cell covers
     */
    cellCoverZIndex: 2,

    /**
     * @cfg {Number} selectionCoverZIndex
     * Value of zIndex for selection covers
     */
    selectionCoverZIndex: 1,

    /**
     * @cfg {Number} coverPositionTopSubstract
     * Value to substract pixels from cover positioning (placing cover out of inner cell box)
     */
    coverPositionTopSubstract: 2,

    /**
     * @cfg {Number} coverPositionLeftSubstract
     * Value to substract pixels from cover positioning (placing cover out of inner cell box)
     */
    coverPositionLeftSubstract: 2,

    /**
     * @cfg {Number} coverWidthAddition
     * Value to add pixels to cover size (width)
     */
    coverWidthAddition: 3,

    /**
     * @cfg {Number} coverHeightAddition
     * Value to add pixels to cover size (height)
     */
    coverHeightAddition: 3,

    /**
     * @private
     */
    initComponent: function() {

        var me = this;

        // Disable row-striping
        me.stripeRows = false;

        // Add spread view CSS cls
        me.baseCls = me.baseCls + ' ' + me.spreadViewBaseCls;

        // Add events
        me.addEvents(

            /**
             * @event beforecovercell
             * Fires before a cell gets covered visually. Return false in listener to stop the event processing.
             * @param {Spread.grid.View} view Spread view instance
             * @param {Spread.selection.Position} position Position to be covered
             * @param {Ext.dom.Element} coverEl Cover element
             */
            'beforecovercell',

            /**
             * @event covercell
             * Fires when a cell got covered visually.
             * @param {Spread.grid.View} view Spread view instance
             * @param {Spread.selection.Position} position Position to be covered
             * @param {Ext.dom.Element} coverEl Cover element
             */
            'covercell',

            /**
             * @event beforehighlightcells
             * Fires before a range of cells get highlighted visually. Return false in listener to stop the event processing.
             * @param {Spread.grid.View} view Spread view instance
             * @param {Array} positions Array of selection positions identifying cells
             */
            'beforehighlightcells',

            /**
             * @event beforehighlightcells
             * Fires when a range of cells got highlighted visually.
             * @param {Spread.grid.View} view Spread view instance
             * @param {Array} positions Array of selection positions identifying cells
             */
            'highlightcells',

            /**
             * @event beforeeditfieldblur
             * @inheritdoc Spread.grid.plugin.Editable#beforeeditfieldblur
             */
            'beforeeditfieldblur',

            /**
             * @event editfieldblur
             * @inheritdoc Spread.grid.plugin.Editable#editfieldblur
             */
            'editfieldblur',

            /**
             * @event beforecoverdblclick
             * @inheritdoc Spread.grid.plugin.Editable#beforecoverdblclick
             */
            'beforecoverdblclick',

            /**
             * @event coverdblclick
             * @inheritdoc Spread.grid.plugin.Editable#coverdblclick
             */
            'coverdblclick',

            /**
             * @event beforecoverkeypressed
             * @inheritdoc Spread.grid.plugin.Editable#beforecoverkeypressed
             */
            'beforecoverkeypressed',

            /**
             * @event coverkeypressed
             * @inheritdoc Spread.grid.plugin.Editable#coverkeypressed
             */
            'coverkeypressed',

            /**
             * @event beforeeditingenabled
             * @inheritdoc Spread.grid.plugin.Editable#beforeeditingenabled
             */
            'beforeeditingenabled',

            /**
             * @event editingenabled
             * @inheritdoc Spread.grid.plugin.Editable#editingenabled
             */
            'editingenabled',

            /**
             * @event beforeeditingdisabled
             * @inheritdoc Spread.grid.plugin.Editable#beforeeditingdisabled
             */
            'beforeeditingdisabled',

            /**
             * @event editingdisabled
             * @inheritdoc Spread.grid.plugin.Editable#editingdisabled
             */
            'editingdisabled',

            /**
             * @event beforecopy
             * @inheritdoc Spread.grid.plugin.Copyable#beforecopy
             */
            'beforecopy',

            /**
             * @event copy
             * @inheritdoc Spread.grid.plugin.Copyable#copy
             */
            'copy',

            /**
             * @event beforepaste
             * @inheritdoc Spread.grid.plugin.Pasteable#beforepaste
             */
            'beforepaste',

            /**
             * @event paste
             * @inheritdoc Spread.grid.plugin.Pasteable#paste
             */
            'paste'
        );


        // Call parent
        var ret = me.callParent(arguments);

        //console.log('SpreadPlugins', this.spreadPlugins);

        // Create cover element if not already existing
        if (!me.cellCoverEl) {
            me.createCellCoverElement();
        }

        // Initialize view plugins
        me.initPlugins(me.spreadPlugins);

        // Initializes relay eventing
        me.initRelayEvents();

        return ret;
    },

    /**
     * @protected
     * Register relayed events
     * @return void
     */
    initRelayEvents: function() {

        // Relay editable plugin events
        this.relayEvents(this.editable, [
            'beforeeditfieldblur',
            'editfieldblur',
            'beforecoverdblclick',
            'coverdblclick',
            'beforecoverkeypressed',
            'coverkeypressed',
            'beforeeditingenabled',
            'editingenabled',
            'beforeeditingdisabled',
            'editingdisabled',
            'editablechange',
            'covercelleditable'
        ]);

        // Relay copyable plugin events
        this.relayEvents(this.copyable, [
            'beforecopy',
            'copy'
        ]);

        // Relay pasteable plugin events
        this.relayEvents(this.pasteable, [
            'beforepaste',
            'paste'
        ]);
    },

    /**
     * @protected
     * Initializes view plugins
     * @param {Array} plugins View plugins
     * @return void
     */
    initPlugins: function(plugins) {

        for (var i=0; i<plugins.length; i++) {

            // Reference the plugin
            this[plugins[i].alias] = plugins[i];

            // Initialize the plugin
            this[plugins[i].alias].init(this);
        }
    },

    /**
     * @protected
     * Creates the cell cover element used to cover a cell on focus
     * @return void
     */
    createCellCoverElement: function() {

        var me = this;

        this.on('afterrender', function() {

            // Tab eventing
            this.getEl().set({
                tabIndex: 0
            });

            // Focus view element if configured
            if (me.autoFocus) {

                setTimeout(function() {
                    try {
                        me.getEl().focus();
                    } catch(e) {}

                }, me.autoFocusDelay);
            }

            // Generate cell cover element
            this.cellCoverEl = Ext.DomHelper.append(this.getEl(), {
                tag: 'div',
                id: 'cover-el' + Ext.id(),
                cls: 'spreadsheet-cell-cover'
            });

            // Register a mousedown listener to let all mousedown events bubble to the cell (<td>) covering
            Ext.get(this.cellCoverEl).on('mousedown', this.bubbleCellMouseDownToSelectionModel, this);

            // Always resize cell cover on column resize
            this.headerCt.on('columnresize', function() {

                // Re-cover the cell covering
                this.coverCell();

            }, this);

        }, this);
    },

    /**
     * @protected
     * Bubble the mousedown event to the cell's <td> element which is covered by the coverEl.
     * @param {Ext.EventObject} evt Event of mousedown
     * @param {HTMLElement} coverEl Promise that this is a cover element, the user clicked on
     * @return void
     */
    bubbleCellMouseDownToSelectionModel: function(evt, coverEl) {

        var cellEl = coverEl.id.split('_'),
            rowEl, tableBodyEl, rowIndex, cellIndex, record, i;

        // Fetch <td> cell for given cover element and proove that
        if (cellEl[1] && Ext.fly(cellEl[1]) && Ext.fly(cellEl[1]).hasCls('x-grid-cell')) {

            // Cell <td> element
            cellEl = Ext.fly(cellEl[1]).dom;

            // Row <tr> element
            rowEl = Ext.fly(cellEl).up('tr').dom;

            // Fetch record with using node info
            record = this.getRecord(rowEl);

            // Table <table> element
            tableBodyEl = Ext.fly(rowEl).up('tbody').dom;

            // Analyze cell index
            for (i=0; i<rowEl.childNodes.length; i++) {
                if (rowEl.childNodes[i] === cellEl) {
                    cellIndex = i;
                    break;
                }
            }

            // Analyze row index
            for (i=0; i<tableBodyEl.childNodes.length; i++) {
                if (tableBodyEl.childNodes[i] === rowEl) {
                    rowIndex = (i-1);
                    break;
                }
            }

            // Bubble the event through
            this.getSelectionModel().onCellMouseDown('mousedown', this, cellEl, rowIndex, cellIndex, evt, record, rowEl);
        }
    },

    /**
     * Implements a re-styling of the view after refreshing when edit mode is enabled
     * @return {*}
     */
    refresh: function() {

        var me = this,
            ret = me.callParent(arguments);

        // Set panel reference
        me.spreadPanel = me.ownerCt;

        //console.log('refresh?!')

        if (me.dataChangedRecently) {
            me.dataChangedRecently = false;
            return ret;
        } else {

            if (me.editable) {

                me.editable.displayCellsEditing(
                    me.editable.editModeStyling && me.editable.editable
                );
            }
        }
        return ret;
    },

    /**
     * Initially shows/Updates the cell cover to cover a new position.
     * Sets the this.currentCoverPosition if a position is given (initial showing)
     * OR uses the current/already focused cover position (update mode).
     * @param {Spread.selection.Position} [position=this.currentCoverPosition] Position object reference
     * @return void
     */
    coverCell: function(position) {

        //console.log('coverCell', position);

        var me = this,
            coverEl = me.getCellCoverEl();

        // Do await event processing, a listener returning false may stop covering the cell
        if (me.fireEvent('beforecovercell', me, position, coverEl) !== false) {

            // Remove highlighting if new position is given
            if (position) {
                me.highlightCells();
            }

            // Auto-detect if not given (update mode)
            if (!position) {
                position = me.currentCoverPosition;
            } else {
                me.currentCoverPosition = position;
            }

            // Update position
            position.validate();

            var tdEl = Ext.get(position.cellEl),
                coverElSize, coverElPosition;

            // Show cover
            coverEl.setStyle('display', 'block');

            // Position calc
            coverElPosition = tdEl.getXY();
            coverElPosition[0] -= me.coverPositionTopSubstract;
            coverElPosition[1] -= me.coverPositionLeftSubstract;

            // Move cover in front of td (x, y)
            coverEl.setXY(coverElPosition);

            // Set in zIndex in front of td (z)
            coverEl.setStyle('z-index', me.cellCoverZIndex);

            // Size calc
            coverElSize = tdEl.getSize();
            coverElSize.width += me.coverWidthAddition;
            coverElSize.height += me.coverHeightAddition;

            // Set size
            coverEl.setSize(coverElSize);

            // Set cover id
            coverEl.dom.id = 'coverOf_' + tdEl.dom.id;

            // After a small timeout, focus cell (may scroll into view)
            setTimeout(function() {

                // Scroll view into cover position
                me.focusCell(position);

                // Re-focus on view, because focusCell() focus()'es cell <td> element
                try {
                    me.getEl().focus();
                } catch (e) {}

            }, me.cellFocusDelay);

            // Fire event
            me.fireEvent('covercell', me, position, coverEl, tdEl, coverElSize, coverElPosition);
        }
    },

    // private, helper method
    _highlight: function(methodName, positions) {

        for (var i=0; i<positions.length; i++) {

            // (Un-)highlight visually by adding/removing CSS class
            Ext.fly(positions[i].validate().cellEl)
                .down('div')[methodName]('spreadsheet-cell-selection-cover');
        }
    },

    /**
     * Highlights a range of cells identified by Spread.selection.Position instances.
     * Before highlighting, previously highlighted cells get un-highlighted again.
     *
     * TODO: Refactor to use a Spread.selection.Range to remember all current highlighted cells.
     * TODO: Maybe rewrite / reimplement a new method highlightCell() which does take care of the current positions view
     * TODO: Or maybe just rewrite to use a Range!!
     *
     * @param {Array} positions Array of position instances
     * @return void
     */
    highlightCells: function(positions) {

        var me = this;

        // Interceptable before-eventing
        if (this.fireEvent('beforehighlightcells', this, positions) !== false) {

            // Un-highlight first
            if (this.currentHighlightPositions.length > 0) {

                this.unhighlightCells(this.currentHighlightPositions);
            }

            if (positions) {

                // Switch local data
                this.currentHighlightPositions = positions;

                // Add CSS class to all cells
                me._highlight('addCls', this.currentHighlightPositions);
            }

            // Fire event
            this.fireEvent('highlightcells', this, positions);
        }
    },

    /**
     * Removes the highlighting maybe previously added by this.highlightCells().
     * @param {Array} positions Positions to remove highlighting from
     * @return void
     */
    unhighlightCells: function(positions) {

        // Remove CSS class from all cells
        this._highlight('removeCls', positions);

        if (this.currentHighlightPositions.length > 0) {

            // Substract all positions given from current highlighted positions
            this.currentHighlightPositions = Ext.Array.difference(this.currentHighlightPositions, positions);
        }
    },

    /**
     * Returns the cover element as Ext.dom.Element instance or null
     * @return {Ext.dom.Element|null}
     */
    getCellCoverEl: function() {
        return Ext.get(this.cellCoverEl);
    },

    /**
     * Returns the spread grid panel reference
     * @return {Spread.grid.Panel}
     */
    getSpreadPanel: function() {
        return this.spreadPanel;
    }
});