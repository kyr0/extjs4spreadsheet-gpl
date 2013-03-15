/**
 * @class Spread.selection.RangeModel
 *
 * The instance of this selection model can be fetched by a call of the method
 * getSelectionModel() on a spreadsheet's grid or view instance.
 *
 * This selection model is able to focus cells and select ranges of cells.
 * It implements the logic of selection by:
 * <ul>
 *     <li>click-mouse-drag cell range selection</li>
 *     <li>click-mouse, press shift key, click cell range selection</li>
 *     <li>navigate and focus by keys UP, DOWN, LEFT, RIGHT, TAB, ENTER</li>
 *     <li>press shift key and navigate by key cell range selection</li>
 *     <li>...and all of them in combination</li>
 * </ul>
 *
 * Using the interceptable eventing of this selection model, it's possible
 * to extend the selection and focussing logic.
 *
 */
Ext.define('Spread.selection.RangeModel', {

    extend: 'Ext.selection.Model',

    alias: 'selection.range',

    isRangeModel: true,

    // Internal indicator flag
    initialViewRefresh: true,

    // Internal indicator flag
    dataChangedRecently: false,

    // Internal keyNav reference
    keyNav: null,

    // Internal indicator flag
    keyNavigation: false,

    // Internal indicator flag
    mayRangeSelecting: false,

    /**
     * @property {Spread.selection.Position}
     * Dynamically calculated root position (initial focus position)
     */
    rootPosition: null,

    /**
     * @cfg {Boolean} autoFocusRootPosition
     * Automatically focusses the root position initially
     */
    autoFocusRootPosition: true,

    /**
     * @cfg {Boolean} enableKeyNav
     * Turns on/off keyboard navigation within the grid.
     */
    enableKeyNav: true,

    /**
     * @property {Array}
     * Internal array which contains all
     * position objects, identifying the current
     * range of selected cells.
     */
    currentSelectionRange: [],

    /**
     * @property {Spread.selection.Position}
     * Internal reference to the origin
     * selection position object identifying the cell:
     * - where the user clicked without shift pressed
     * - clicked the first time, before extending the range via shift + mouse drag
     * - moved to via key (up, down, left, right) without shift pressed
     * - moved to the first time via key before shift + key was pressed to extend the range
     */
    originSelectionPosition: null,

    /**
     * @property {Spread.selection.Position}
     * Internal reference to the last/current focus position,
     * which means the positioning object of the cell,
     * an event like mouseup or keyup was fired on the last time.
     */
    currentFocusPosition: null,

    /**
     * @property {Spread.grid.View} Internal view instance reference
     */
    view: null,


    /**
     * @property {Spread.grid.Panel} Internal grid reference
     */
    grid: null,

    /**
     * @private
     */
    constructor: function() {

        this.addEvents(

            /**
             * @event deselect
             * Fired after a cell range is deselected
             * @param {Spread.selection.RangeModel} this
             * @param {Array} range Array of selection positions identifying cells
             */
            'deselect',

            /**
             * @event select
             * Fired after a cell range is selected
             * @param {Spread.selection.RangeModel} this
             * @param {Array} range Array of selection positions identifying cells
             */
            'select',

            /**
             * @event beforecellfocus
             * Fired before a cell gets focussed
             * @param {Spread.selection.RangeModel} this
             * @param {Spread.selection.Position} position Cell position object reference
             */
            'beforecellfocus',

            /**
             * @event cellfocus
             * Fired after a cell has been focussed
             * @param {Spread.selection.RangeModel} this
             * @param {Spread.selection.Position} position Cell position object reference
             */
            'cellfocus',

            /**
             * @event cellblur
             * Fired when a cell blur event happens
             * @param {Spread.selection.RangeModel} this
             * @param {Ext.dom.Element} el Element clicked on
             */
            'cellblur',

            /**
             * @event tabselect
             * Fired after TAB has been pressed by user to focus (next) cell
             * @param {Spread.selection.RangeModel} this
             * @param {Ext.EventObject} evt Key event
             */
            'tabselect',

            /**
             * @event enterselect
             * Fired after ENTER has been pressed by user to focus (next) cell (below, left below)
             * @param {Spread.selection.RangeModel} this
             * @param {Ext.EventObject} evt Key event
             */
            'enterselect',

            /**
             * @event keynavigate
             * Fired after key navigation happened (up, down, left, right)
             * @param {Spread.selection.RangeModel} this
             * @param {String} direction Direction name
             * @param {Ext.EventObject} evt Key event
             */
            'keynavigate'
        );
        this.callParent(arguments);
    },

    // --- Initialization

    /**
     * @protected
     * Binds the view instance events to be handled inside of this class
     * @param {Spread.grid.View} view View instance
     * @return void
     */
    bindComponent: function(view) {

        var me = this;

        // Internal references
        me.view = view;
        me.grid = me.view.ownerCt;

        // Call parent
        me.callParent(arguments);

        // Initialize the root position
        me.initRootPosition();

        // Bind UI events for interaction handling
        me.bindUIEvents();

        // Initialize key nav if needed
        if (me.enableKeyNav) {
            me.initKeyNav(view);
        }
    },

    /**
     * @protected
     * Builds a root position to point to the top- and left-most cell available
     * @return void
     */
    initRootPosition: function() {

        var columnIndex = 0,
            currentColumnIsNotHeaderColumn = false,
            noNonHeaderColumnFound = false;

        // Look-ahead and increment starting column position until a column is
        // found which is not a header column
        while (!currentColumnIsNotHeaderColumn) {

            if (!this.view.getHeaderAtIndex(columnIndex)) {
                currentColumnIsNotHeaderColumn = true;
                noNonHeaderColumnFound = true;
            }

            if (this.view.getHeaderAtIndex(columnIndex) &&
                this.view.getHeaderAtIndex(columnIndex).selectable) {
                currentColumnIsNotHeaderColumn = true;
            } else {
                columnIndex++;
            }
        }

        // Create an instance of a root position object
        this.rootPosition = new Spread.selection.Position(
            this.view,
            columnIndex,
            0,
            this.view.getStore().getAt(0)
        );
    },

    /**
     * @protected
     * Binds the view instance events to be handled inside of this class
     * @return void
     */
    bindUIEvents: function() {

        var me = this;

        // Catch the view's cell dbl click event
        me.view.on({
            uievent: me.onUIEvent,
            refresh: me.onViewRefresh,
            scope: me
        });

        // Catch grid's events
        me.view.ownerCt.on({
            columnhide: me.reinitialize,
            columnmove: me.reinitialize,
            columnshow: me.reinitialize,
            scope: me
        });

        // On data change (e.g. filtering)
        me.view.store.on('datachanged', function() {

            //console.log('datachanged!');

            // Set indicator flag to reinitialize after store data has been changed
            me.dataChangedRecently = true;
        });

        // Register edit blur handler
        me.initEditBlurHandler();
    },

    /**
     * @protected
     * Registers and un-registers a document.body event listener
     * for clicks outside of the view area to stop editing.
     * @return void
     */
    initEditBlurHandler: function() {

        var me = this;

        // Un-register on grid destroy
        me.grid.on('destroy', function() {
            Ext.EventManager.un(document.body, 'mouseup', me.onCellMouseUp);
        });

        // Listen for mouseup globally (stable method to fetch mouseup)
        Ext.EventManager.on(document.body, 'mouseup', me.onCellMouseUp, me/*, {
            buffer: 50
        }*/);
    },

    /**
     * Re-initializes focus and selection so that column
     * moving, showing and hiding isn't an issue.
     * @return void
     */
    reinitialize: function() {

        //console.log('reinitialize!');

        // Reset root position
        this.initRootPosition();

        // Auto-focus the root position initially
        try {

            // This may fail due to non-rendered circumstances
            this.setCurrentFocusPosition(this.rootPosition);

        } catch (e) {}

        // Set the origin to the root position too
        this.setOriginSelectionPosition(this.rootPosition);
    },

    /**
     * @protected
     * Initializes the key navigation for single cell or range selection
     * @param {Spread.grid.View} view View instance
     * @return void
     */
    initKeyNav: function(view) {

        var me = this;

        // Handle not-already-rendered circumstances
        if (!view.rendered) {
            view.on('render', Ext.Function.bind(me.initKeyNav, me, [view], 0), me, {single: true});
            return;
        }

        // view.el has tabIndex -1 to allow for
        // keyboard events to be passed to it.
        view.el.set({
            tabIndex: -1
        });

        // DO NOT handle input field events to allow
        // left & right caret positioning while editing
        me.keyNav = new Ext.util.KeyNav({
            target: view.el,
            eventName: 'keydown',
            ignoreInputFields: true,
            right: me.onKeyRight,
            left: me.onKeyLeft,
            scope: me
        });

        // DO handle input field events
        me.keyNav = new Ext.util.KeyNav({
            target: view.el,
            eventName: 'keydown',
            ignoreInputFields: false,
            up: me.onKeyUp,
            down: me.onKeyDown,
            tab: me.onKeyTab,
            enter: me.onKeyEnter,
            scope: me
        });
    },

    // --- Event handler

    /**
     * @protected
     * Gets called when view gets refereshed
     * @return void
     */
    onViewRefresh: function() {

        //console.log('view refresh happened');

        if (this.dataChangedRecently) {

            // Reset root position
            this.reinitialize();

            // Reset flag
            this.dataChangedRecently = false;

        } else {

            // Update root position / record reference
            this.rootPosition.update();

            try {
                // Try re-focussing
                this.view.getEl().focus();
            } catch(e) {}
        }

        // May auto-focus root position
        if (this.autoFocusRootPosition && this.initialViewRefresh) {

            // Auto-focus the root position initially
            try {

                // This may fail due to non-rendered circumstances
                this.setCurrentFocusPosition(this.rootPosition);

            } catch (e) {}

            // Set the origin to the root position too
            this.setOriginSelectionPosition(this.rootPosition);

            // Update indicator flag
            this.initialViewRefresh = false;
        }
    },

    /**
     * @protected
     * UI Event processing
     * @param {String} type UI Event type (e.g. 'mousedown')
     * @param {Spread.grid.View} view Spread view instance reference
     * @param {HTMLElement} cell Cell HTML element reference (<td>)
     * @param {Number} rowIndex Row index
     * @param {Number} cellIndex Cell index
     * @param {Ext.EventObject} evt Event instance
     * @param {Ext.data.Model} record Data record instance
     * @param {HTMLElement} row Row HTML element reference (<tr>)
     * @return void
     */
    onUIEvent: function(type, view, cell, rowIndex, cellIndex, evt, record, row) {

        //console.log('uievent', type);
        var me = this, args = arguments;

        switch(type) {

            case "mouseover":
                me.onCellMouseOver.apply(me, args);
                break;

            case "mousedown":
                me.onCellMouseDown.apply(me, args);
                break;
        }
    },

    /**
     * @protected
     * Gets called when mouse down is detected
     * @param {String} type UI Event type (e.g. 'mousedown')
     * @param {Spread.grid.View} view Spread view instance reference
     * @param {HTMLElement} cell Cell HTML element reference (<td>)
     * @param {Number} rowIndex Row index
     * @param {Number} cellIndex Cell index
     * @param {Ext.EventObject} evt Event instance
     * @param {Ext.data.Model} record Data record instance
     * @param {HTMLElement} row Row HTML element reference (<tr>)
     * @param {Object} eOpts Event options
     * @return void
     */
    onCellMouseDown: function(type, view, cell, rowIndex, cellIndex, evt, record, row, eOpts) {

        //console.log('mouse down happened', arguments);

        // Without eOpts, click wasn't detected on a cell/row
        if (!eOpts) {
            return;
        }

        var position = new Spread.selection.Position(view, cellIndex, rowIndex, record, row, cell);

        // Set current focus position
        if (
            this.setCurrentFocusPosition(position)
        ) {

            // Try to select range, if special key was pressed too
            if (evt.shiftKey && !Spread.util.Key.isStartEditKey(evt)) {

                this.tryToSelectRange();

            } else {

                // Set origin position
                this.setOriginSelectionPosition(position);

                // Set the indicator flag that a range may be selected in the future (see onCellMouseOver)
                this.mayRangeSelecting = true;
            }
        }
    },

    /**
     * Returns the next valid row index.
     * If row index may be greater than store size,
     * it returns the last valid row index.
     * @param {Ext.data.Store} store Data store
     * @param {Number} rowIndex Current row index
     * @return {Number}
     */
    getNextRowIndex: function(store, rowIndex) {

        if ((rowIndex+1) < store.getCount()) {
            ++rowIndex;
        }
        return rowIndex;
    },

    /**
     * @protected
     * Gets called when mouse hovers a cell
     * @param {String} type UI Event type (e.g. 'mousedown')
     * @param {Spread.grid.View} view Spread view instance reference
     * @param {HTMLElement} cell Cell HTML element reference (<td>)
     * @param {Number} rowIndex Row index
     * @param {Number} cellIndex Cell index
     * @param {Ext.EventObject} evt Event instance
     * @param {Ext.data.Model} record Data record instance
     * @param {HTMLElement} row Row HTML element reference (<tr>)
     * @return void
     */
    onCellMouseOver: function(type, view, cell, rowIndex, cellIndex, evt, record, row) {

        // When range selection is happening,
        // it's of interest to select responsive
        if (this.mayRangeSelecting) {

            //console.log('cell mouse over', arguments);

            // Set last position
            if (
                this.setCurrentFocusPosition(
                    new Spread.selection.Position(view, cellIndex, rowIndex, record, row, cell)
                )
            ) {

                // Try selecting a range
                this.tryToSelectRange();
            }
        }
    },

    /**
     * @protected
     * Gets called when mouseup happens on a grid cell.
     * This handler breaks mouse-dragged range selection by setting the this.mayRangeSelecting flag.
     * @return void
     */
    onCellMouseUp: function(evt, el) {

        this.mayRangeSelecting = false;

        //console.log('cell mouse up -> blur', Ext.get(el));

        // Fire cellblur event
        if (!Ext.get(el).hasCls('spreadsheet-cell-cover') &&
            !Ext.get(el).hasCls('x-grid-cell-inner') &&
            !Ext.get(el).hasCls('spreadsheet-cell-cover-edit-field')) {

            this.fireEvent('cellblur', this, Ext.get(el));
        }
    },

    /**
     * @protected
     * Gets called when arrow UP key was pressed
     * @param {Ext.EventObject} evt Key event object
     * @return void
     */
    onKeyUp: function(evt) {

        if (!this.getCurrentFocusPosition()) return;

        this.keyNavigation = true;
        this.processKeyNavigation('up', evt);
        this.keyNavigation = false;
    },

    /**
     * @protected
     * Gets called when arrow DOWN key was pressed
     * @param {Ext.EventObject} evt Key event object
     * @return void
     */
    onKeyDown: function(evt) {

        if (!this.getCurrentFocusPosition()) return;

        this.keyNavigation = true;
        this.processKeyNavigation('down', evt);
        this.keyNavigation = false;
    },

    /**
     * @protected
     * Gets called when arrow LEFT key was pressed
     * @param {Ext.EventObject} evt Key event object
     * @return void
     */
    onKeyLeft: function(evt) {

        if (Ext.get(evt.target).hasCls('spreadsheet-cell-cover-edit-field')) {
            return;
        }

        if (!this.getCurrentFocusPosition()) return;

        this.keyNavigation = true;
        this.processKeyNavigation('left', evt);
        this.keyNavigation = false;

    },

    /**
     * @protected
     * Gets called when arrow RIGHT key was pressed
     * @param {Ext.EventObject} evt Key event object
     * @return void
     */
    onKeyRight: function(evt) {

        if (Ext.get(evt.target).hasCls('spreadsheet-cell-cover-edit-field')) {
            return;
        }

        if (!this.getCurrentFocusPosition()) return;

        this.keyNavigation = true;
        this.processKeyNavigation('right', evt);
        this.keyNavigation = false;

    },

    /**
     * @protected
     * Gets called when TAB key was pressed
     * @param {Ext.EventObject} evt Key event object
     * @return void
     */
    onKeyTab: function(evt) {

        // Do not handle key event if no focus is given
        if (!this.getCurrentFocusPosition() || !evt) return;

        // Fire event
        this.fireEvent('tabselect', this, evt);

        // Set tab pressed flag
        //this.tabPressedRecently = true;

        //console.log('onKeyTab', evt);

        this.keyNavigation = true;

        if (!evt.shiftKey) {
            this.processKeyNavigation('right', evt);
        } else {
            this.processKeyNavigation('left', evt);
        }
        this.keyNavigation = false;
    },

    /**
     * @protected
     * Gets called when ENTER key was pressed
     * @param {Ext.EventObject} evt Key event object
     * @return void
     */
    onKeyEnter: function(evt) {

        // Do not handle key event if no focus is given
        if (!this.getCurrentFocusPosition()) return;

        // Fire event
        this.fireEvent('enterselect', this, evt);

        // Standard move-down on ENTER
        this.keyNavigation = true;
        this.processKeyNavigation('down', evt);
        this.keyNavigation = false;
    },

    // --- Selection logic / algorithms

    /**
     * Tries to focus a cell position
     * @param {Spread.selection.Position} position Position object reference
     * @return void
     */
    setCurrentFocusPosition: function(position) {

        // Remove last focus reference
        if (!position) {
            this.currentFocusPosition = null;
            return false;
        }

        // Never allow to focus a cell/position which resists inside a header column
        if (!position.columnHeader.selectable) {
            return false;
        }

        //console.log('[before] setCurrentFocusPosition ', position);

        // Focus is stoppable if a listener returns false / stops the event
        if (this.fireEvent('beforecellfocus', position) !== false) {

            //console.log('setCurrentFocusPosition ', position);

            // Set internal reference
            this.currentFocusPosition = position;

            //console.log('try to focus the position: ', position);

            //console.log('FOCUS ', this.getCurrentFocusPosition().row + ',' + this.getCurrentFocusPosition().column);

            // Reset current selection range
            this.currentSelectionRange = [];

            // Inform the view to focus the cell
            this.view.coverCell(position);

            // Fire event
            this.fireEvent('cellfocus', position);

            return true;
        }
        return false;
    },

    /**
     * Returns the last focus position
     * @return {Spread.selection.Position}
     */
    getCurrentFocusPosition: function() {
        return this.currentFocusPosition;
    },

    /**
     * Sets the origin selection position
     * @param {Spread.selection.Position} position Position object reference
     * @return void
     */
    setOriginSelectionPosition: function(position) {

        //console.log('setORIGINSelectionPosition', position);

        // Set internal reference
        this.originSelectionPosition = position;
    },

    /**
     * Returns the origin selection position
     * @return {Spread.selection.Position}
     */
    getOriginSelectionPosition: function() {
        return this.originSelectionPosition;
    },

    /**
     * @protected
     * Processes any key navigation. Therefore receives a (already filtered) key event
     * and a direction to move to (from already given this.currentFocusPosition and this.originSelectionPosition).
     * @param {String} direction Direction to jump/extend range to
     * @param {Ext.EventObject} evt Key event object
     * @return void
     */
    processKeyNavigation: function(direction, evt) {

        setTimeout(Ext.Function.bind(function() {

            // Fire event
            this.fireEvent('keynavigate', this, direction, evt);

            //console.log('processKeyNavigation: ', direction);

            var newCurrentFocusPosition = this.tryMoveToPosition(
                this.getCurrentFocusPosition(), direction, evt
            );

            //console.log('Focus single cell; Reset current range selection.');

            // Focus a new position
            if (
                this.setCurrentFocusPosition(newCurrentFocusPosition)
            ) {

                // Try to select range, if special key was pressed too
                // Shift + Tab is special navigation behaviour (left navigation without selection)
                if (evt.shiftKey && evt.getKey() !== evt.TAB) {

                    this.tryToSelectRange();

                } else {

                    // Set origin position
                    this.setOriginSelectionPosition(
                        newCurrentFocusPosition
                    );
                }
            }
        }, this), 50);
    },

    /**
     * @protected
     * Tries to move to a position starting at this.currentFocusPosition
     * and moving on into direction (next cell). If this isn't possible,
     * this method returns the this.currentFocusPosition, otherwise, it
     * returns the position object of the next cell.
     * @param {Object} currentFocusPosition Position object reference
     * @param {String} direction Direction to jump/extend range to
     * @param {Ext.EventObject} evt Key event object
     * @return {Object}
     */
    tryMoveToPosition: function(currentFocusPosition, direction, evt) {

        var newPosition = this.view.walkCells(currentFocusPosition, direction, evt, true);

        //console.log('tryMoveToPosition, newPosition: ', newPosition);

        // When right end is reached, go to row below, first allowed column
        if (!newPosition && !evt.shiftKey && direction === 'right') {

            // Jump to next row, starting column
            newPosition = new Spread.selection.Position(
                currentFocusPosition.view,
                this.rootPosition.column,
                this.getNextRowIndex(
                    currentFocusPosition.view.getStore(),
                    currentFocusPosition.row
                )
            );

        } else if (!newPosition) {

            // But normally, stay where you are
            newPosition = currentFocusPosition;
        }

        // Build a valid position object
        return new Spread.selection.Position(this.view, newPosition.column, newPosition.row);
    },

    /**
     * @protected
     * Tries to select a range by information from _previously_ internally set
     * this.originSelectionPosition and (to) this.currentFocusPosition.
     * @param {Boolean} [virtual=false] Virtual calculation but no UI change
     * @return void
     */
    tryToSelectRange: function(virtual) {

        // private method to interpolate numbers and return them as index array
        var interpolate = function(startIdx, endIdx) {
            var indexes = [];
            do {
                indexes.push(startIdx);
                startIdx++;
            } while(startIdx <= endIdx);

            return indexes;
        };

        //console.log('tryToSelectRange: ', this.getOriginSelectionPosition(), ' to ', this.getCurrentFocusPosition());

        /*
        console.log('SELECT RANGE FROM ', this.getOriginSelectionPosition().row + ',' + this.getOriginSelectionPosition().column,
                    ' TO ', this.getCurrentFocusPosition().row + ',' + this.getCurrentFocusPosition().column);
        */

        var rowCount = this.view.getStore().getCount(),
            columnCount = this.view.headerCt.getGridColumns(true).length,
            originRow = this.getOriginSelectionPosition().row,
            focusRow = this.getCurrentFocusPosition().row,
            originColumn = this.getOriginSelectionPosition().column,
            focusColumn = this.getCurrentFocusPosition().column,
            rowIndexes = [],
            columnIndexes = [],
            selectedPositions = [],
            selPosition = null;

        // Interpolate selected row indexes
        if (focusRow <= originRow) {
            rowIndexes = interpolate(focusRow, originRow);
        } else {
            rowIndexes = interpolate(originRow, focusRow);
        }

        // Interpolate selected column indexes
        if (focusColumn <= originColumn) {
            columnIndexes = interpolate(focusColumn, originColumn);
        } else {
            columnIndexes = interpolate(originColumn, focusColumn);
        }

        //console.log('selectedRows', rowIndexes, 'selectedColumns', columnIndexes);

        // Walk cells of grid and check for being in selected range
        for (var rowIndex=0; rowIndex<rowCount; rowIndex++) {

            for (var colIndex=0; colIndex<columnCount; colIndex++) {

                // Match positioning indexes
                if (Ext.Array.indexOf(rowIndexes, rowIndex) > -1 &&
                    Ext.Array.indexOf(columnIndexes, colIndex) > -1) {

                    // Fetch already-updated position instance
                    selPosition = new Spread.selection.Position(this.view, colIndex, rowIndex).update();

                    // Only add position to selection if column isn't hidden currently
                    if (!selPosition.columnHeader.hidden) {
                        selectedPositions.push(selPosition);
                    }
                }
            }
        }

        //console.log('SELECTED', selectedPositions);

        // Update local selection range cache
        this.currentSelectionRange = selectedPositions;

        // Tell the view which cells to highlight
        if (!virtual) {
            this.view.highlightCells(selectedPositions);
        }
    },

    /**
     * Returns the currently focussed cell data or selected range data
     * (like represented in grid itself).
     * @return {Array}
     */
    getSelectedPositionData: function() {

        var selectionToTransform;

        if (this.currentSelectionRange.length === 0) {
            selectionToTransform = [this.currentFocusPosition];
        } else {
            selectionToTransform = this.currentSelectionRange;
        }
        //console.log('transform to array', selectionToTransform);

        return selectionToTransform;
    }
});