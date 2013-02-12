/**
 * @class Spread.grid.plugin.Editable
 * Allows the spreadsheet to get edited by a text field as known from standard spreadsheet applications.
 */
Ext.define('Spread.grid.plugin.Editable', {

    extend: 'Ext.AbstractComponent',

    alias: 'editable',

    /**
     * @property {Spread.grid.View}
     * View instance reference
     */
    view: null,

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

    // Private
    isEditing: false,

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

    // Internal storage (shadow-copy) of editable columns references
    editableColumns: [],

    // Internal list of indexes of the columns which are editable
    editableColumnIndexes: [],

    // Internal editable flag
    editable: false,

    /**
     * @protected
     * Registers the hook for cover-double-click editing
     * @param {Spread.grid.View} view View instance
     * @return void
     */
    init: function(view) {

        var me = this;

        // Set internal reference
        me.view = view;

        // Add events
        this.addEvents(

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
             * @event covercell
             * Fires after a cell got covered for editing.
             * @param {Spread.grid.View} view Spread view instance
             * @param {Spread.selection.Position} position Position to be covered
             * @param {Ext.dom.Element} coverEl Cover element
             */
            'covercell'
        );

        // Register eventing hook
        this.initCoverEventing();
    },

    /**
     * @protected
     * Registers key and mouse eventing on the cover element of the view
     * @return void
     */
    initCoverEventing: function() {

        var me = this;

        // Call the following methods after rendering...
        this.view.on('afterrender', function(view) {

            // Collect editable flags from the columns
            me.initEditingColumns(view);

            // Initialize editable eventing
            me.initEventing(view);
        });
    },

    /**
     * @protected
     * Implements listeners and hooks for eventing which belongs
     * to the edit field, cover element, view and selection model.
     * @param {Spread.grid.View} view View reference
     * @return void
     */
    initEventing: function(view) {


        // Handle eventing of cover element
        var me = this,
            coverEl = view.getCellCoverEl();

        //console.log('initEventing!', coverEl);
        if (coverEl) {

            //console.log('found a view to hook on', coverEl, this.cellCoverEditFieldEl);

            // Render the text field
            me.initTextField(coverEl);

            // Listen to cover double click
            //coverEl.on('dblclick', me.onCoverDblClick, me);

            // Double-click based edit mode handler
            me.view.getEl().on('dblclick', me.onCoverDblClick, me);

            // Listen to cover key pressed (up)
            view.getEl().on('keydown', me.onCoverKeyPressed, me);

            // Listen to view's cover
            view.on('covercell', me.onCellCovered, me);

            // Handle TAB and ENTER select while editing (save and focus next cell)
            //view.getSelectionModel().on('tabselect', me.blurEditFieldIfEditing, me);
            //view.getSelectionModel().on('enterselect', me.blurEditFieldIfEditing, me);
            view.getSelectionModel().on('beforecellfocus', me.blurEditFieldIfEditing, me);
            view.getSelectionModel().on('keynavigate', me.blurEditFieldIfEditing, me);
            view.getSelectionModel().on('cellblur', me.blurEditFieldIfEditing, me);

        } else {
            throw "Cover element not found, initializing editing failed! Please check proper view rendering.";
        }
    },

    /**
     * @protected
     * Collects the 'editable' flags from the columns and stores them in
     * this.editableColumns array initially.
     * @param {Spread.grid.View} view Grid view
     * @return void
     */
    initEditingColumns: function(view) {

        var columns = view.getHeaderCt().getGridColumns();

        // Initialize arrays
        this.editableColumns = [];
        this.editableColumnIndexes = [];

        for (var i=0; i<columns.length; i++) {

            if (columns[i].editable) {

                // Push to list of editable columns
                this.editableColumns.push(columns[i]);

                // Set reference on column
                columns[i].columnIndex = i;

                // Push to list of editable columns indexes
                this.editableColumnIndexes.push(i);
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

        // Check for field existence (already created?)
        if (!this.cellCoverEditFieldEl) {

            //console.log('initTextField', arguments);

            // Build editor field
            this.cellCoverEditFieldEl = Ext.get(

                Ext.DomHelper.append(coverEl, {
                    id: Ext.id() + '-cover-input',
                    tag: 'input',
                    type: 'text',
                    cls: 'spreadsheet-cell-cover-edit-field',
                    value: ''
                })
            );

            // Register key up handler
            this.cellCoverEditFieldEl.on('keypress', this.onEditFieldKeyPressed, this);
        }
    },

    /**
     * @protected
     * Stops the edit mode
     * @return void
     */
    onEditFieldBlur: function() {

        //console.log('onEditFieldBlur');

        // Fire interceptable event
        if (this.fireEvent('beforeeditfieldblur', this) !== false) {

            // Stop editing (mode)
            this.setEditing(false);

            // Write changed value back to record/field
            Spread.data.DataMatrix.setValueForPosition(
                this.activePosition,
                this.getEditingValue(),
                this.autoCommit
            );

            // Recolorize for dirty flag!
            this.handleDirtyMarkOnEditModeStyling();

            // Fire event
            this.fireEvent('editfieldblur', this);
        }
    },

    /**
     * @protected
     * Full redraw on edit mode styling after each edit field change
     * @return void
     */
    handleDirtyMarkOnEditModeStyling: function() {

        // Full redraw
        if (this.view.ownerCt.editModeStyling) {
            this.displayCellsEditing(true);
        } else {
            this.displayCellsEditing(false);
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

        //console.log('blurEditFieldIfEditing', this.isEditing)

        if (this.isEditing) {
            this.onEditFieldBlur();
        }
    },

    /**
     * @protected
     * Handles special keys (ENTER, TAB) and
     * allowed input character limiting.
     * @param {Ext.EventObject} evt Key event
     * @return void
     */
    onEditFieldKeyPressed: function(evt) {

        var me = this;

        if (this.isEditing) {

            if (Spread.util.Key.isCancelEditKey(evt)) {
                this.blurEditFieldIfEditing();
                return true;
            }
            //console.log('columns keys allowed? ', me.activePosition.columnHeader.allowedEditKeys);

            // If there is a list of allowed keys, check for them
            if (me.activePosition.columnHeader.allowedEditKeys.length > 0) {

                // Stop key input if not in allowed keys list
                if (Ext.Array.indexOf(me.activePosition.columnHeader.allowedEditKeys,
                        String.fromCharCode(evt.getCharCode())
                    ) === -1 && evt.getKey() !== evt.BACKSPACE)
                {
                    evt.stopEvent();
                }
            }

        } else {

            // Save and jump next cell
            if (evt.getKey() === evt.ENTER) {
                me.view.getSelectionModel().onKeyEnter(evt);
            }

            // Save and jump next cell
            if (evt.getKey() === evt.TAB) {
                me.view.getSelectionModel().onKeyTab(evt);
            }

            // Key navigation support (jumping out of field)
            if (evt.getKey() === evt.LEFT) {
                me.view.getSelectionModel().onKeyLeft(evt);
            }

            if (evt.getKey() === evt.RIGHT) {
                me.view.getSelectionModel().onKeyRight(evt);
            }

            if (evt.getKey() === evt.UP) {
                me.view.getSelectionModel().onKeyUp(evt);
            }

            if (evt.getKey() === evt.DOWN) {
                me.view.getSelectionModel().onKeyDown(evt);
            }
        }
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

        // Not already editing and not clicked outside of the table area
        if (!Ext.get(evt.getTarget()).hasCls('x-grid-view') && !this.isEditing) {

            if (this.fireEvent('beforecoverdblclick', this) !== false) {

                // Activates the editor
                this.setEditing(true);

                // Set current value of field in record
                this.setEditingValue(
                    Spread.data.DataMatrix.getValueOfPosition(this.activePosition)
                );

                this.fireEvent('coverdblclick', this);
            }
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

        if (Spread.util.Key.isStartEditKey(evt) && !this.isEditing) {

            //console.log('onCoverKeyPressed', evt.getKey(), evt.getCharCode());

            if (this.fireEvent('beforecoverkeypressed', this) !== false) {

                // Activates the editor
                this.setEditing(true);

                // Reset the editor value
                this.setEditingValue('');

                this.fireEvent('coverkeypressed', this);
            }
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

        // Set internal references
        this.activePosition = position;
        this.activeCellTdEl = tdEl;
        this.activeCoverEl = coverEl;
        this.activeCoverElSize = coverElSize;
        this.activeCoverElPosition = coverElPosition;

        // But hide, until this.setEditing() is called through UI event
        this.cellCoverEditFieldEl.dom.style.display = 'none';

        this.fireEvent('covercell', view, position, coverEl);
    },




    /**
     * Checks if the current position is editable
     * @return {Boolean}
     */
    isPositionEditable: function() {

        console.log('isPositionEditable', this.activePosition);

        // Check for row to be editable or not


        // Check for column to be editable or not
        if ((this.activePosition && !this.activePosition.columnHeader.editable) ||
            !this.editable) {

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
        if (!this.isPositionEditable) {
            return false;
        }

        //console.log('setEditing ', doEdit);

        // Set editing
        if (doEdit) {

            if (this.fireEvent('beforeeditingenabled', this) !== false) {

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

                this.fireEvent('editingenabled', this);
            }

        } else {

            if (this.fireEvent('beforeeditingdisabled', this) !== false) {

                // Hide the editor
                me.cellCoverEditFieldEl.dom.style.display = 'none';

                // Blur the edit field (and focus view element again to re-enable key-stroke navigation)
                setTimeout(function() {

                    try {
                        me.view.focus();
                    } catch(e) {}

                }, me.stopEditingFocusDelay);

                // Disable edit mode
                me.isEditing = false;

                this.fireEvent('editingdisabled', this);
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
                me.displayCellsEditing(false);
            }
        } else {

            // Set flag
            me.editable = true;

            // Loop and disable editing on columns
            toggleColumnsEditable(true);

            // Display cells in edit mode

            if (me.editModeStyling) {
                me.displayCellsEditing(true);
            }
        }
    },

    /**
     * Displays the grid cells in edit or read mode
     * @param {Boolean} displayEditing Display cells as editing?
     * @return void
     */
    displayCellsEditing: function(displayEditing) {

        var me = this, viewCells = me.view.getEl().query(
            me.view.cellSelector
        ), viewColumns = me.view.getHeaderCt().getGridColumns();

        if (Ext.isIE6 || Ext.isIE7 || Ext.isIE8) {
            me.chunkRenderDelay = 0.3;
            me.cellChunkSize = 200;
        }

        // Chunk-style cells
        var chunkCellProcessor = function(startIdx, stopIdx) {

            for (var i=startIdx; i<stopIdx; i++) {

                // Jump-over non-exiting AND non-editable cells (of non-editable columns) AND
                // when a column should be inked which has an implicit editModeStyling=false flag!
                if (!viewCells[i] ||
                    Ext.Array.indexOf(me.editableColumnIndexes, viewCells[i].cellIndex) < 0 ||
                    (viewColumns[viewCells[i].cellIndex] &&
                     viewColumns[viewCells[i].cellIndex].editModeStyling === false)) {
                    continue;
                }

                if (displayEditing) {

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
            }
        };

        // Chunk the for processing
        chunkCellProcessor(0, me.cellChunkSize);
    }
});