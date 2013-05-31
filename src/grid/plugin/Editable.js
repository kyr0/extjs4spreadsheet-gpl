/**
 * @class Spread.grid.plugin.Editable
 * @extends Spread.grid.plugin.AbstractPlugin
 * Allows the spreadsheet to get edited by a text field as known from standard spreadsheet applications.
 *
 * TODO: Support string fields without allowedKeys config to enter special chars!
 */
Ext.define('Spread.grid.plugin.Editable', {

    extend: 'Spread.grid.plugin.AbstractPlugin',

    requires: ['Spread.grid.plugin.AbstractPlugin'],

    alias: 'editable',

    editableColumns: [],
    editableColumnIndexes: [],
    editable: false,
    isEditing: false,
    cellClear: false,

    /**
     * @cfg {Boolean} autoCommit
     * Automatically commit changed records or wait for manually store.sync() / record.commit()?
     * (Generally, can be specially configured per column config too)
     */
    autoCommit: true,

    /**
     * @cfg {Number} stopEditingFocusDelay
     * Delay of timeout until view gets focused again after editing in ms
     */
    stopEditingFocusDelay: 50,

    /**
     * @cfg {Number} retryFieldElFocusDelay
     * Delay of timeout until the edit field gets tried to focused again (special case)
     */
    retryFieldElFocusDelay: 20,

    /**
     * @cfg {Number} chunkRenderDelay
     * Delay of rendering chunks in ms (too low values may let the browser freeze if grid is very big).
     * This performance optimization technique is used only when editModeStyling is activated and cells
     * need to be re-inked on this.setDisabled() / grid's setEditable() calls.
     */
    chunkRenderDelay: 0.1,

    /**
     * @cfg {Number} cellChunkSize
     * Size of the chunks (cells) to render at once (see chunkRenderDelay for further information)
     */
    cellChunkSize: 300,

    /**
     * @property {Spread.selection.Position}
     * Currently active editing position
     */
    activePosition: null,

    /**
     * @property {Ext.dom.Element}
     * Currently active cover element
     */
    activeCoverEl: null,

    /**
     * @property {Ext.dom.Element}
     * Currently active cell td element
     */
    activeCellTdEl: null,

    /**
     * @property {Object}
     * Currently active cover element size (containing width, height properties measured in pixels)
     */
    activeCoverElSize: null,

    /**
     * @property {Array}
     * Currently active cover element position (top, left pixel position relative to view)
     */
    activeCoverElPosition: null,

    /**
     * @property {Ext.dom.Element}
     * Reference to the origin edit field input-HTML-element
     */
    cellCoverEditFieldEl: null,

    /**
     * @cfg {Boolean} editModeStyling
     * Allows to style the cells when in edit mode
     */
    editModeStyling: true,

    /**
     * @cfg {String} editableCellCls
     * Name of the css class for editable spreadsheet cells
     */
    editableCellCls: 'spreadsheet-cell-editable',

    /**
     * @cfg {String} editableDirtyCellCls
     * Name of the css class for editable spreadsheet cells which are dirty too
     */
    editableDirtyCellCls: 'spreadsheet-cell-editable-dirty',

    /**
     * @property {Mixed} lastEditFieldValue
     * Stores the last edit field value
     */
    lastEditFieldValue: null,

    /**
     * @protected
     * Registers the hook for cover-double-click editing
     * @param {Spread.grid.View} view View instance
     * @return void
     */
    init: function(view) {

        var me = this;

        me.callParent(arguments);

        // Add events
        me.addEvents(

            /**
             * @event beforeeditfieldblur
             * Fires before a edit field gets blur()'ed. Return false in listener to stop the event processing.
             * @param {Spread.grid.plugin.Editable} editable Editable plugin instance
             */
            'beforeeditfieldblur',

            /**
             * @event editfieldblur
             * Fires when a edit field gets blur()'ed.
             * @param {Spread.grid.plugin.Editable} editable Editable plugin instance
             */
            'editfieldblur',

            /**
             * @event beforecoverdblclick
             * Fires before a covers dbl-click action happened (starting editing). Return false in listener to stop the event processing.
             * @param {Spread.grid.plugin.Editable} editable Editable plugin instance
             */
            'beforecoverdblclick',

            /**
             * @event coverdblclick
             * Fires when a covers dbl-click action happened (starting editing).
             * @param {Spread.grid.plugin.Editable} editable Editable plugin instance
             */
            'coverdblclick',

            /**
             * @event beforecoverkeypressed
             * Fires before a cover's keypress-click action happened (starting editing). Return false in listener to stop the event processing.
             * @param {Spread.grid.plugin.Editable} editable Editable plugin instance
             */
            'beforecoverkeypressed',

            /**
             * @event coverkeypressed
             * Fires when a cover's keypress-click action happened (starting editing).
             * @param {Spread.grid.plugin.Editable} editable Editable plugin instance
             */
            'coverkeypressed',

            /**
             * @event beforeeditingenabled
             * Fires before editing gets generally activated. Return false in listener to stop the event processing.
             * @param {Spread.grid.plugin.Editable} editable Editable plugin instance
             */
            'beforeeditingenabled',

            /**
             * @event editingenabled
             * Fires when editing gets generally activated.
             * @param {Spread.grid.plugin.Editable} editable Editable plugin instance
             */
            'editingenabled',

            /**
             * @event beforeeditingdisabled
             * Fires before editing gets generally deactivated. Return false in listener to stop the event processing.
             * @param {Spread.grid.plugin.Editable} editable Editable plugin instance
             */
            'beforeeditingdisabled',

            /**
             * @event editingdisabled
             * Fires when editing gets generally deactivated.
             * @param {Spread.grid.plugin.Editable} editable Editable plugin instance
             */
            'editingdisabled',

            /**
             * @event covercelleditable
             * Fires after a cell got covered for editing.
             * @param {Spread.grid.plugin.Editable} editable Editable plugin instance
             * @param {Spread.grid.View} view Spread view instance
             * @param {Spread.selection.Position} position Position to be covered
             * @param {Ext.dom.Element} coverEl Cover element
             */
            'covercelleditable',

            /**
             * @event editablechange
             * Fires after the editable flag has changed and all re-rendering has been done.
             * Use this event if you e.g. want to reload the store "directly" after calling setEditable() etc.
             * @param {Spread.grid.plugin.Editable} editable Editable plugin instance
             * @param {Boolean} isEditable Indicator if the spread is now editable or not
             */
            'editablechange'
        );

        // Register eventing hook
        me.initCoverEventing();
    },

    /**
     * @protected
     * Registers key and mouse eventing on the cover element of the view
     * @return void
     */
    initCoverEventing: function() {

        var me = this;

        // Call the following methods after rendering...
        me.getView().on('afterrender', function() {

            // Collect editable flags from the columns
            me.initEditingColumns();

            // Initialize editable eventing
            me.initEventing();
        });
    },

    /**
     * @protected
     * Implements listeners and hooks for eventing which belongs
     * to the edit field, cover element, view and selection model.
     * @return void
     */
    initEventing: function() {

        // Handle eventing of cover element
        var me = this,
            view = me.getView(),
            coverEl = view.getCellCoverEl();

        //console.log('initEventing!', coverEl);
        if (coverEl) {

            //console.log('found a view to hook on', coverEl, this.cellCoverEditFieldEl);

            // Render the text field
            me.initTextField(coverEl);

            // Listen to cover double click
            //coverEl.on('dblclick', me.onCoverDblClick, me);

            // Double-click based edit mode handler
            view.getEl().on('dblclick', me.onCoverDblClick, me);

            // Listen to cover key pressed (up)
            view.getEl().on('keydown', me.onCoverKeyPressed, me);

            // Listen to view's cover
            view.on('covercell', me.onCellCovered, me);

            // Handle TAB and ENTER select while editing (save and focus next cell)
            //me.getSelectionModel().on('tabselect', me.blurEditFieldIfEditing, me);
            //me.getSelectionModel().on('enterselect', me.blurEditFieldIfEditing, me);
            me.getSelectionModel().on('beforecellfocus', me.blurEditFieldIfEditing, me);
            me.getSelectionModel().on('keynavigate', me.blurEditFieldIfEditing, me);
            //me.getSelectionModel().on('cellblur', me.blurEditFieldIfEditing, me);

        } else {
            throw "Cover element not found, initializing editing failed! Please check proper view rendering.";
        }
    },

    /**
     * @protected
     * Collects the 'editable' flags from the columns and stores them in
     * this.editableColumns array initially.
     * @return void
     */
    initEditingColumns: function() {

        var me = this, view = me.getView(),
            columns = view.getHeaderCt().getGridColumns();

        // Initialize arrays
        me.editableColumns = [];
        me.editableColumnIndexes = [];

        for (var i=0; i<columns.length; i++) {

            if (columns[i].editable) {

                // Push to list of editable columns
                me.editableColumns.push(columns[i]);

                // Set reference on column
                columns[i].columnIndex = i;

                // Push to list of editable columns indexes
                me.editableColumnIndexes.push(i);
            }
        }
    },

    /**
     * @protected
     * For initializing, the text field DOM elements need to be generated.
     * @param {Ext.dom.Element} coverEl Cover element reference
     * @return void
     */
    initTextField: function(coverEl) {

        var me = this;

        // Check for field existence (already created?)
        if (!me.cellCoverEditFieldEl) {

            //console.log('initTextField', arguments);

            // Build editor field
            me.cellCoverEditFieldEl = Ext.get(

                Ext.DomHelper.append(coverEl, {
                    id: Ext.id() + '-cover-input',
                    tag: 'input',
                    type: 'text',
                    cls: 'spreadsheet-cell-cover-edit-field',
                    value: ''
                })
            );

            // Register key up handler
            me.cellCoverEditFieldEl.on('keypress', me.onEditFieldKeyPressed, me);
        }
    },

    /**
     * @protected
     * Stops the edit mode
     * @return void
     */
    onEditFieldBlur: function() {

        //console.log('onEditFieldBlur');
        var me = this;

        // Fire interceptable event
        if (me.fireEvent('beforeeditfieldblur', me) !== false) {

            // Internal flag to prevent two-time rendering
            me.view.dataChangedRecently = true;

            // Stop editing (mode)
            me.setEditing(false);

            // Write changed value back to record/field
            me.activePosition.setValue(
                me.getEditingValue(),
                me.autoCommit
            );

            // Recolorize for dirty flag!
            me.handleDirtyMarkOnEditModeStyling();

            // Fire event
            me.fireEvent('editfieldblur', me);
        }
    },

    /**
     * @protected
     * Full redraw on edit mode styling after each edit field change
     * @return void
     */
    handleDirtyMarkOnEditModeStyling: function() {

        var me = this;

        // Full redraw
        if (me.getView().ownerCt.editModeStyling) {
            me.displayCellsEditing(true);
        } else {
            me.displayCellsEditing(false);
        }
    },

    /**
     * @protected
     * Blurs the editor field if editing is happening and
     * the user pressed TAB or ENTER to focus next cell.
     * (blur causes the editor to save its changed data)
     * @return void
     */
    blurEditFieldIfEditing: function() {

        var me = this;
        //console.log('blurEditFieldIfEditing', this.isEditing)

        if (me.isEditing) {
            me.onEditFieldBlur();
        }
    },

    /**
     * @protected
     * Handles special keys (ENTER, TAB) and
     * allowed input character limiting.
     * @param {Ext.EventObject} evt Key event
     * @return {Boolean}
     */
    onEditFieldKeyPressed: function(evt) {

        var me = this,
            view = me.getView();

        if (me.isEditing) {

            if (Spread.util.Key.isNavigationKey(evt) || Spread.util.Key.isDelKey(evt)) {
                return true;
            }

            if (Spread.util.Key.isCancelEditKey(evt)) {

                //console.log('is cancel edit key')
                me.blurEditFieldIfEditing();
                return true;
            }

            // If there is a list of allowed keys, check for them
            if (me.activePosition.columnHeader.allowedEditKeys.length) {

                // Stop key input if not in allowed keys list
                if (
                    Ext.Array.indexOf(me.activePosition.columnHeader.allowedEditKeys,
                        String.fromCharCode(evt.getCharCode())
                    ) === -1
                    && evt.getKey() !== evt.BACKSPACE
                )
                {
                    evt.stopEvent();
                }
            }

        } else {

            // Save and jump next cell
            if (evt.getKey() === evt.ENTER) {
                me.getSelectionModel().onKeyEnter(evt);
            }

            // Save and jump next cell
            if (evt.getKey() === evt.TAB) {
                me.getSelectionModel().onKeyTab(evt);
            }

            // Key navigation support (jumping out of field)
            if (evt.getKey() === evt.LEFT) {
                me.getSelectionModel().onKeyLeft(evt);
            }

            if (evt.getKey() === evt.RIGHT) {
                me.getSelectionModel().onKeyRight(evt);
            }

            if (evt.getKey() === evt.UP) {
                me.getSelectionModel().onKeyUp(evt);
            }

            if (evt.getKey() === evt.DOWN) {
                me.getSelectionModel().onKeyDown(evt);
            }
        }
    },

    // Internal method for checking if a user clicked on a cell cover
    // which is covering the currently focused cell.
    isOriginCellClick: function(evt) {

        var me = this, clickedOnCell = false,
            clickTargetElIdTextParent = evt.getTarget().parentNode.parentNode.id,
            clickTargetElIdText = evt.getTarget().parentNode.id,
            clickTargetElId = evt.getTarget().id,
            currentPosCellElId = me.getSelectionModel().getCurrentFocusPosition().cellEl.id;

        if (Ext.isIE) {

            if (clickTargetElId.indexOf(currentPosCellElId) > -1 ||
                clickTargetElIdText.indexOf(currentPosCellElId) > -1 ||
                clickTargetElIdTextParent.indexOf(currentPosCellElId) > -1) {
                clickedOnCell = true;
            }

        } else {

            if (clickTargetElId.indexOf(currentPosCellElId) > -1) {
                clickedOnCell = true;
            }
        }
        return clickedOnCell;
    },


    /**
     * @protected
     * When a user double-clicks on a cell cover, this method
     * gets called and chooses if the text field should be shown
     * based on the pre-annotation already made by this.onCellCovered.
     * @param {Ext.EventObject} evt Key event
     * @return void
     */
    onCoverDblClick: function(evt) {

        var me = this;

        if (me.fireEvent('beforecoverdblclick', me) !== false) {

            // Clicked on grid view
            // ...and not already editing
            // ...and clicked on cell cover of the current selected cell position
            // ...and if position is generally editable
            if (!Ext.get(evt.getTarget()).hasCls('x-grid-view') &&
                !me.isEditing &&
                me.isOriginCellClick(evt) &&
                me.isPositionEditable()) {

                //console.log('onCoverDblClick, setEditable!');

                // Activates the editor
                me.setEditing(true);

                // Set current value of field in record
                me.setEditingValue(
                    me.activePosition.getValue()
                );
            }
            me.fireEvent('coverdblclick', me);
        }
    },

    /**
     * @protected
     * Handles key-up-events when a key is pressed when a cell is covered and focused.
     * @param {Ext.EventObject} evt Key event
     * @param {Ext.dom.Element} viewEl View's element
     * @return void
     */
    onCoverKeyPressed: function(evt, viewEl) {

        var me = this;

        // no key is pressed on a cover,
        // if we're editing...
        if (me.isEditing) {
            return;
        }

        if (me.fireEvent('beforecoverkeypressed', me) !== false) {

            if (Spread.util.Key.isDelKey(evt) && !me.isEditing) {

                if (me.isPositionEditable()) {

                    var clearRangePlugin = me.getSpreadPanel().getPlugin('Spread.grid.plugin.ClearRange');

                    if (clearRangePlugin) {
                        clearRangePlugin.clearCurrentFocusPosition();
                    }
                }
            }

            if (Spread.util.Key.isStartEditKey(evt) && !me.isEditing) {

                if (me.isPositionEditable()) {

                    // Activates the editor
                    me.setEditing(true);

                    // Reset the editor value
                    me.setEditingValue('');
                }
            }
            me.fireEvent('coverkeypressed', me);
        }
    },

    /**
     * @protected
     * When a cell gets covered, this method chooses if the text field,
     * generated by this.initTextField() gets active or not based on the
     * cell columns editable flag. It also updates the text fields meta
     * properties to react fast and responsive on UI eventing
     * (pre-annotation of field value etc. pp.)
     * @return void
     */
    onCellCovered: function(view, position, coverEl, tdEl, coverElSize, coverElPosition) {

        //console.log('onCellCovered', position);
        var me = this;

        // Set internal references
        me.activePosition = position;
        me.activeCellTdEl = tdEl;
        me.activeCoverEl = coverEl;
        me.activeCoverElSize = coverElSize;
        me.activeCoverElPosition = coverElPosition;

        // But hide, until this.setEditing() is called through UI event
        me.cellCoverEditFieldEl.dom.style.display = 'none';

        me.fireEvent('covercelleditable', me, view, position, coverEl);
    },

    /**
     * Checks if the current position is editable
     * @return {Boolean}
     */
    isPositionEditable: function() {

        var me = this;
        // Check for row to be editable or not
        // TODO!

        // Check for column to be editable or not
        if ((me.activePosition && !me.activePosition.columnHeader.editable) ||
            !me.editable || !me.activePosition.isEditable()) {

            //console.log('!this.activePosition.columnHeader.editable || !this.editable', !this.activePosition.columnHeader.editable, !this.editable)
            return false;
        }
        return true;
    },

    /**
     * Sets the editor active or inactive
     * @param {Boolean} doEdit=true Should edit mode be started?
     * @return void
     */
    setEditing: function(doEdit) {

        var me = this;

        // Default value = true
        if (!Ext.isDefined(doEdit)) {
            doEdit = true;
        }

        // Check global and column edit-ability
        if (!me.isPositionEditable()) {
            return false;
        }

        //console.log('setEditing ', doEdit);

        // Set editing
        if (doEdit) {

            if (me.fireEvent('beforeeditingenabled', me) !== false) {

                // Enable edit mode
                me.isEditing = true;

                // Show the editor
                me.cellCoverEditFieldEl.dom.style.display = 'inline';

                // Focus the edit field
                try {
                    me.cellCoverEditFieldEl.dom.focus();
                } catch(e) {}

                // Re-try after a small delay to ensure focus
                // (e.g. when rendering delay takes place while cell-to-cell edit mode jumps)
                setTimeout(function() {

                    try {
                        me.cellCoverEditFieldEl.dom.focus();
                    } catch(e) {}

                }, me.retryFieldElFocusDelay);

                me.fireEvent('editingenabled', me);
            }

        } else {

            if (me.fireEvent('beforeeditingdisabled', me) !== false) {

                // Hide the editor
                me.cellCoverEditFieldEl.dom.style.display = 'none';

                // Blur the edit field (and focus view element again to re-enable key-stroke navigation)
                setTimeout(function() {

                    try {
                        me.getView().focus();
                    } catch(e) {}

                }, me.stopEditingFocusDelay);

                // Disable edit mode
                me.isEditing = false;

                me.fireEvent('editingdisabled', me);
            }
        }
    },

    /**
     * Sets the edit field value
     * @param {String} value Editing value
     * @return void
     */
    setEditingValue: function(value) {

        // Set value in editor field
        this.cellCoverEditFieldEl.dom.value = value;
    },

    /**
     * Returns the current edit field value
     * @return {String}
     */
    getEditingValue: function() {
        return this.cellCoverEditFieldEl.dom.value;
    },

    /**
     * En/Disables editing grid-wide
     * @param {Boolean} allowEditing Is editing allowed?
     * @return void
     */
    setDisabled: function(allowEditing) {

        //console.log('en/disable editing globally:', allowEditing, this);

        // Closure, column editable processor
        var me = this,
            toggleColumnsEditable = function(isEditable) {

            for (var i=0; i<me.editableColumns.length; i++) {
                me.editableColumns[i].editable = isEditable;
            }
        };

        if (!allowEditing) {

            // Disable editing if currently
            me.setEditing(false);

            // Set flag
            me.editable = false;

            // Loop and disable editing on columns
            toggleColumnsEditable(false);

            // Display cells in read mode
            if (me.editModeStyling) {

                me.displayCellsEditing(false, function() {

                    // Fire event
                    me.fireEvent('editablechange', me, allowEditing);
                });
            } else {

                // Fire event
                me.fireEvent('editablechange', me, allowEditing);
            }

        } else {

            // Set flag
            me.editable = true;

            // Loop and disable editing on columns
            toggleColumnsEditable(true);

            // Display cells in edit mode

            if (me.editModeStyling) {

                me.displayCellsEditing(true, function() {

                    // Fire event
                    me.fireEvent('editablechange', me, allowEditing);
                });
            } else {

                // Fire event
                me.fireEvent('editablechange', me, allowEditing);
            }
        }
    },

    /**
     * Displays the grid cells in edit or read mode
     * @param {Boolean} displayEditing Display cells as editing?
     * @param {Function} [onRenderReady] Function to be called when ready
     * @return void
     */
    displayCellsEditing: function(displayEditing, onRenderReady) {

        var me = this, view = me.getView(), viewCells = view.getEl().query(
            view.cellSelector
        ), viewColumns = view.getHeaderCt().getGridColumns(),
        columnCount = viewColumns.length,
        displayCellEditing = true, row, displayCellEditingState;

        if (Ext.isIE6 || Ext.isIE7 || Ext.isIE8) {
            me.chunkRenderDelay = 0.3;
            me.cellChunkSize = 200;
        }

        // Chunk-style cells
        var chunkCellProcessor = function(startIdx, stopIdx) {

            for (var i=startIdx; i<stopIdx; i++) {

                // Evaluate cell edit mode displaying
                displayCellEditing = true;

                if (viewCells[i]) {

                    // Calculate row index from cell index/column count
                    row = Math.floor(i/columnCount);

                    displayCellEditingState = Spread.util.State.getPositionState({
                        row: row,
                        column: viewCells[i].cellIndex
                    }, 'editmodestyling');

                    if (Ext.isDefined(displayCellEditingState)) {
                        displayCellEditing = displayCellEditingState;
                    }
                }

                // Jump-over non-exiting AND non-editable cells (of non-editable columns) AND
                // when a column should be inked which has an implicit editModeStyling=false flag!
                if (!viewCells[i] ||
                    Ext.Array.indexOf(me.editableColumnIndexes, viewCells[i].cellIndex) < 0 ||
                    (viewColumns[viewCells[i].cellIndex] &&
                     viewColumns[viewCells[i].cellIndex].editModeStyling === false)) {
                    continue;
                }

                if (displayEditing && displayCellEditing) {

                    // Add css class
                    if (!Ext.fly(viewCells[i]).hasCls(me.editableCellCls)) {

                        if (Ext.fly(viewCells[i]).hasCls('x-grid-dirty-cell')) {
                            Ext.fly(viewCells[i]).addCls(me.editableDirtyCellCls);
                        } else {
                            Ext.fly(viewCells[i]).addCls(me.editableCellCls);
                        }
                    }

                } else {

                    Ext.fly(viewCells[i]).removeCls(me.editableCellCls);
                    Ext.fly(viewCells[i]).removeCls(me.editableDirtyCellCls);
                }
            }

            if (stopIdx < viewCells.length) {

                startIdx += me.cellChunkSize;
                stopIdx += me.cellChunkSize;

                // Render delayed
                setTimeout(function() {

                    // Recursive call
                    chunkCellProcessor(startIdx, stopIdx);

                }, me.chunkRenderDelay);
            } else {

                if (onRenderReady && Ext.isFunction(onRenderReady)) {
                    onRenderReady();
                }
            }
        };

        // Chunk the for processing
        chunkCellProcessor(0, me.cellChunkSize);
    }
});