/**
 * @class Spread.grid.Panel
 * @extends Ext.grid.Panel
 *
 * # Spreadsheets
 *
 * The grid panel class ist the most important class of Ext JS 4 Spreadsheet component.
 * You can configure all features of a Spreadsheet through the configuration of an instance of Spread.grid.Panel.
 *
 *
 * ## A Simple Spreadsheet
 *
 * A very simple Spreadsheet example is:
 *
 * <code>
 *     // Creating an instance of the Spreadsheet's grid panel
 *     var spreadPanel = new Spread.grid.Panel({

         // Like all grids, a Spreadsheet grid also needs a store
         store: dataStore,

         // A config, relayed to Spread.selection.RangeModel.
         // Disables key navigation.
         enableKeyNav: false,

         // A config, relayed to Spread.grid.View.
         // Shows
         viewConfig: {
             stripeRows: true
         },

         listeners: {

             // Simple listening to a View's event (relayed)
             covercell: function() {
                 console.log('External listener to covercell', arguments);
             }
         },

         // A config, relayed to Spread.grid.plugin.Editable.
         // Allows editing in general (but column based it could be
         // disabled with the same config option per column)
         editable: true,

         // Configure visible grid columns
         columns: [{
             header: 'First name',
             dataIndex: 'firstname',

             // Lets disable selection for first column
             selectable: false
         }, {
             header: 'Last name',
             renderer: function(value) {
                 return '<b>' + value + '</b>';
             },
             dataIndex: 'lastname'
         }]
     });

 * </code>
 *
 * ## Anatomy of a Spreadsheet
 *
 * A Spreadsheet itself consists of three main classes:
 * <ul>
 *     <li>
 *         <u>The Panel</u> <code>Spread.grid.Panel</code><br />
 *         <br />
 *         This is the master class of a Spreadsheet. All configuration belongs to this class.
 *         Except the View class, you don't need to know about the internals of the other classes
 *         nor their config options and events because every config option and every event is
 *         relayed to the grid panel class itself.<br />
 *         <br />
 *         Note: After instantiation of a grid, it's possible to access the View and Selection Model instances
 *         by calling <code>gridPanelInstance.getView()</code> and <code>gridPanelInstance.getSelectionModel()</code>.
 *         <br />
 *         <br />
 *     </li>
 *     <li>
 *         <u>The View</u> <code>Spread.grid.View</code><br />
 *         <br />
 *         The view class extends a standard Ext.grid.View. It implements method to renders all spreadsheet-specific UI
 *         elements. It also handles all UI specific events for focusing and selecting cells.
 *
 *         The view of a Spreadsheet comes with it's own plugin architecture.
 *         Features like Spread.grid.plugin.Editable, Spread.grid.plugin.Copyable and Spread.grid.plugin.Pasteable
 *         are loosely coupled with the view instance itself. By default, you never need to care about them, because:
 *         <br />
 *         - All config options of this grid view are available through a single config
 *           option of the grid panel's <code>viewConfig</code> object.<br />
 *         - All events are available through this grid panel class too.
 *         <br />
 *         <br />
 *     </li>
 *     <li>
 *         <u>The Selection Model</u> <code>Spread.selection.RangeModel</code><br />
 *         <br />
 *         The selection model implements all the logic (key/mouse navigation, key/mouse selection) required for
 *         making focusing and selection feels like using a native spreadsheet application.
 *         By default, you never need to care about the selection model, because:<br />
 *         - All config options of this selection model are available through this grid panel class.<br />
 *         - All events are available through this grid panel class too.
 *         <br />
 *         <br />
 *     </li>
 * </ul>
 *
 * ## Header Columns
 *
 * todo
 *
 * ## Selection
 *
 * todo
 *
 * ## Editing
 *
 * todo
 *
 * ## Auto-Committing
 *
 * todo
 *
 * ### Special Edit Mode Colorization
 *
 * todo
 *
 * ## Special Eventing (Event Pipeline Interception)
 *
 * todo
 *
 * ## Styling (CSS)
 *
 * todo
 *
 */
Ext.define('Spread.grid.Panel', {

    extend: 'Ext.grid.Panel',

    alias: 'widget.spread',

    // use spread view
    viewType: 'spreadview',

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
     * @cfg {Boolean} editable
     * Configures if the grid is in edit mode initially
     */
    editable: true,

    /**
     * @cfg {Boolean} autoCommit
     * Automatically commit changed records or wait for manually store.sync() / record.commit()?
     * (Generally, can be specially configured per column config too)
     */
    autoCommit: false,

    /**
     * @cfg {Boolean} editModeStyling
     * Allows to style the cells when in edit mode
     */
    editModeStyling: true,

    // Show column lines by default
    columnLines: true,

    // Internal flag
    //stripeRows: false,

    /**
     * @cfg {Spread.grid.plugin.Editable}
     * Configured instance of an Spread.grid.plugin.Editable plugin.
     * To change the configuration of the plugin, you may just assign your own configured instance here.
     */
    editablePluginInstance: Ext.create('Spread.grid.plugin.Editable', {
    }),

    /**
     * @cfg {Spread.grid.plugin.Copyable}
     * Configured instance of an Spread.grid.plugin.Copyable plugin.
     * To change the configuration of the plugin, you may just assign your own configured instance here.
     */
    copyablePluginInstance: Ext.create('Spread.grid.plugin.Copyable', {
    }),

    /**
     * @cfg {Spread.grid.plugin.Pasteable}
     * Configured instance of an Spread.grid.plugin.Pasteable plugin.
     * To change the configuration of the plugin, you may just assign your own configured instance here.
     */
    pasteablePluginInstance: Ext.create('Spread.grid.plugin.Pasteable', {
    }),

    /**
     * Pre-process the column configuration to avoid incompatibilities
     * @return void
     */
    constructor: function(config) {

        var me = this;

        // Add events
        this.addEvents(

            /**
             * @event beforecovercell
             * @inheritdoc Spread.grid.View#beforecovercell
             */
            'beforecovercell',

            /**
             * @event covercell
             * @inheritdoc Spread.grid.View#covercell
             */
            'covercell',


            /**
             * @event beforehighlightcells
             * @inheritdoc Spread.grid.View#beforehighlightcells
             */
            'beforehighlightcells',

            /**
             * @event beforehighlightcells
             * @inheritdoc Spread.grid.View#beforehighlightcells
             */
            'highlightcells',

            /**
             * @event beforeeditfieldblur
             * @inheritdoc Spread.grid.View#beforeeditfieldblur
             */
            'beforeeditfieldblur',

            /**
             * @event editfieldblur
             * @inheritdoc Spread.grid.View#editfieldblur
             */
            'editfieldblur',

            /**
             * @event beforecoverdblclick
             * @inheritdoc Spread.grid.View#beforecoverdblclick
             */
            'beforecoverdblclick',

            /**
             * @event coverdblclick
             * @inheritdoc Spread.grid.View#coverdblclick
             */
            'coverdblclick',

            /**
             * @event beforecoverkeypressed
             * @inheritdoc Spread.grid.View#beforecoverkeypressed
             */
            'beforecoverkeypressed',

            /**
             * @event coverkeypressed
             * @inheritdoc Spread.grid.View#coverkeypressed
             */
            'coverkeypressed',

            /**
             * @event beforeeditingenabled
             * @inheritdoc Spread.grid.View#beforeeditingenabled
             */
            'beforeeditingenabled',

            /**
             * @event editingenabled
             * @inheritdoc Spread.grid.View#editingenabled
             */
            'editingenabled',

            /**
             * @event beforeeditingdisabled
             * @inheritdoc Spread.grid.View#beforeeditingdisabled
             */
            'beforeeditingdisabled',

            /**
             * @event editingdisabled
             * @inheritdoc Spread.grid.View#editingdisabled
             */
            'editingdisabled',

            /**
             * @event beforecopy
             * @inheritdoc Spread.grid.View#beforecopy
             */
            'beforecopy',

            /**
             * @event copy
             * @inheritdoc Spread.grid.View#copy
             */
            'copy',

            /**
             * @event beforepaste
             * @inheritdoc Spread.grid.View#beforepaste
             */
            'beforepaste',

            /**
             * @event paste
             * @inheritdoc Spread.grid.View#paste
             */
            'paste'
        );

        // Manage the view config instance configuration
        me.manageViewConfig(config);

        // Manage the selection model instance configuration
        me.manageSelectionModelConfig(config);

        me.callParent(arguments);

        // Relay events of view
        me.relayEvents(me.getView(), [
            'beforecovercell',
            'covercell',
            'beforehighlightcells',
            'highlightcells',
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
            'beforecopy',
            'copy',
            'beforepaste',
            'paste'
        ]);

        // Just relay autoCommit flag to pastable plugin
        if (me.pasteablePluginInstance) {
            me.pasteablePluginInstance.autoCommit = me.autoCommit;
        }

        // View refresh
        me.getView().on('viewready', function() {

            // Handle edit mode initially
            me.setEditable(me.editable);

            // Set edit mode styling
            me.setEditModeStyling(me.editModeStyling);
        });
    },

    /**
     * @protected
     * Initialize the columns before rendering them
     */
    initComponent: function() {

        //console.log('cols? ', this.columns);

        // Initialize columns
        this.initColumns();

        return this.callParent(arguments);
    },

    /**
     * @protected
     * Initializes the columns by referencing the view onto them
     * @return void
     */
    initColumns: function() {

        //console.log('gridColumns', this.columns);

        // Assign the plugin to the columns too
        for (var j=0; j<this.columns.length; j++) {

            // Reference the view on each column
            this.columns[j].view = this;

            // And set panel edit mode styleing
            this.columns[j].initialPanelEditModeStyling = this.editModeStyling;
        }
    },

    /**
     * @protected
     * Pays attention to the fact that the developer could define an own viewConfig,
     * so we need to merge-in our spreadPlugins array (apply the defaults)
     * @param {Object} config Grid config object
     * @return void
     */
    manageViewConfig: function(config) {

        var me = this, initSpreadPlugins = function(config) {

            // Init plugins array
            config.viewConfig.spreadPlugins = [];

            // Add default plugins
            config.viewConfig.spreadPlugins.push(
                me.editablePluginInstance,
                me.copyablePluginInstance,
                me.pasteablePluginInstance
            );
        };

        // User specified it's on viewConfig
        if (config.viewConfig) {

            // Maintain merging of spreadPlugins viewConfig section
            if (config.viewConfig.spreadPlugins && Ext.isArray(config.viewConfig.spreadPlugins)) {

                // Merges a plugin into spreadPlugins array if forgotten to be defined
                var pluginCheckMerge = function(classRef, pluginConfig) {

                    var pluginFound = false;

                    // Search for configured plugin
                    for (var i=0; i<config.viewConfig.spreadPlugins.length; i++) {
                        if (config.viewConfig.spreadPlugins[i] instanceof classRef) {
                            pluginFound = true;
                        }
                    }

                    if (!pluginFound) {
                        config.viewConfig.spreadPlugins.push(pluginConfig);
                    }
                };

                // Add plugins, forgotten by developer
                pluginCheckMerge(Spread.grid.plugin.Editable, this.editablePluginInstance);
                pluginCheckMerge(Spread.grid.plugin.Copyable, this.copyablePluginInstance);
                pluginCheckMerge(Spread.grid.plugin.Pasteable, this.pasteablePluginInstance);

            } else {

                // Initialize
                initSpreadPlugins(config);
            }

            // Lazy apply stripeRows config
            if (Ext.isDefined(config.viewConfig.stripeRows)) {
                config.viewConfig.stripeRows = config.viewConfig.stripeRows;
            } else {
                config.viewConfig.stripeRows = this.stripeRows;
            }

        } else {

            // Init the view config object
            config.viewConfig = {};

            // Initialize
            initSpreadPlugins(config);
        }

        // console.log('viewConfig', config.viewConfig);
    },

    /**
     * @protected
     * Simply merges the selection model specific options into the selModel configuration dynamically.
     * @param {Object} config Grid config object
     * @return void
     */
    manageSelectionModelConfig: function(config) {

        var selModelConfig = {
            selType: 'range'
        };

        // Apply autoFocusRootPosition
        if (Ext.isDefined(config.autoFocusRootPosition)) {
            selModelConfig.autoFocusRootPosition = config.autoFocusRootPosition;
        } else {
            selModelConfig.autoFocusRootPosition = this.autoFocusRootPosition;
        }

        // Apply enableKeyNav
        if (Ext.isDefined(config.enableKeyNav)) {
            selModelConfig.enableKeyNav = config.enableKeyNav;
        } else {
            selModelConfig.enableKeyNav = this.enableKeyNav;
        }

        //console.log('selModelConfig', selModelConfig);

        // Assign selection model instance
        this.selModel = selModelConfig;
    },

    /**
     * Enables/Disables editing grid-wide (overriding the column configuration at runtime)
     * @param {Boolean} allowEditing Is editing allowed?
     * @return void
     */
    setEditable: function(allowEditing) {

        // Set internal flag
        this.editable = allowEditing;

        // Call the editable plugin to handle edit mode switch
        if (this.getView().editable && this.getView().editable.setDisabled) {

            // Set editable disabled on plugin instance
            this.getView().editable.setDisabled(this.editable);

            // Set autoCommit flag
            this.getView().editable.autoCommit = this.autoCommit;

        } else {
            throw "You want the grid to be editable, but editing plugin isn't activated!";
        }
    },

    /**
     * Enables/Disables the edit mode styling on the whole grid
     * @param {Boolean} editModeStyling Allow edit mode styling?
     * @return void
     */
    setEditModeStyling: function(editModeStyling) {

        // Set internal flag
        this.editModeStyling = editModeStyling;

        // Call the editable plugin to handle edit mode style switch
        if (this.getView().editable && this.getView().editable.displayCellsEditing) {

            // Set flag
            this.getView().editable.editModeStyling = this.editModeStyling;

            // Re-render cells
            if (this.editModeStyling && this.editable) {

                // Render editable and styled
                this.getView().editable.displayCellsEditing(true);

            } else {

                // Render un-styled
                this.getView().editable.displayCellsEditing(false);
            }


        } else {
            throw "You want the grid to change it's edit mode styling, but editing plugin isn't activated!";
        }
    },

    /**
     * Returns true if grid is in edit mode
     * @return {Boolean}
     */
    isEditable: function() {
        return this.editable;
    }
});