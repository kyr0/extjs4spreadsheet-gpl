/**
 * @class Spread.grid.Panel
 * @extends Ext.grid.Panel
 *
 * # Ext JS 4 SpreadSheet panels
 *
 * The grid panel class ist the most important class of Ext JS 4 Spreadsheet component.
 * You can configure all features of a Spreadsheet through the configuration of an instance of Spread.grid.Panel.
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
 *         <u>The Panel:</u> <code>Spread.grid.Panel</code><br />
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
 *         xtype: <code>spread</code>
 *         <br />
 *         <br />
 *     </li>
 *     <li>
 *         <u>The View:</u> <code>Spread.grid.View</code><br />
 *         <br />
 *         The view class extends a standard Ext.grid.View. It implements method to renders all spreadsheet-specific UI
 *         elements. It also handles all UI specific events for focusing and selecting cells.
 *
 *         The view of a Spreadsheet comes with it's own plugin architecture.
 *         Features like Spread.grid.plugin.Editable, Spread.grid.plugin.Copyable and Spread.grid.plugin.Pasteable
 *         are loosely coupled with the view instance itself. By default, you never need to care about them, because:
 *         <br />
 *         - All config options of the grid view are available via the grid panel's <code>viewConfig</code> object too<br />
 *         - All view class events are available through the grid panel class too
 *         <br />
 *         <br />
 *         xtype: <code>spreadview</code>
 *         <br />
 *         <br />
 *     </li>
 *     <li>
 *         <u>The Selection Model:</u> <code>Spread.selection.RangeModel</code><br />
 *         <br />
 *         The selection model implements all the logic (key/mouse navigation, key/mouse selection) required for
 *         making focusing and selection feels like using a native spreadsheet application.
 *
 *         By default, you never need to care about the selection model, because:<br />
 *         - All config options of this selection model are available through on the grid panel class too<br />
 *         - All selecton model events are available on the grid panel class too
 *         <br />
 *         <br />
 *         xtype: <code>range</code>
 *         <br />
 *         <br />
 *     </li>
 * </ul>
 *
 * ## Grid view customization
 *
 * Like in any standard Ext JS grid you can customize the configuration of the grid's view using the <code>viewConfig</code>
 * configuration option:
 *
 * <code>

       ...
       // A config, relayed to Spread.grid.View.
       // Shows
       viewConfig: {
           stripeRows: true
       },
      ...

   </code>
 *
 * ## Using the special header column <code>Spread.grid.column.Header</code>
 *
 * Next to all standard grid columns you can configure a spreadsheet to contain one or more spreadsheet header columns.
 * Header columns are non-selectable and non-editable and belong to the dataIndex 'id' by default.
 *
 * Like any other grid column, add the spreadheadercolumn instance configuration(s) to the Grid panel's column-configuration:
 *
 * <code>

       ...

       columns: [{
            xtype: 'spreadheadercolumn',
            header: 'ID',
            dataIndex: 'id' // default value
       }, ...],

       ...

   </code>
 *
 * <br />
 *
 * xtype: <code>spreadheadercolumn</code>
 *
 * ## Customizing grid cell selection: <code>Spread.selection.RangeModel</code>
 *
 * The special Range Selection Model that comes with Ext JS 4 SpreadSheet is the heart of the SpreadSheet implementation.
 * It implements the logic behind the native-like feeling when using the SpreadSheet grid. There are two configurations
 * possible then configuring the selection model:
 *
 * <ul>
 *     <li><code>autoFocusRootPosition</code> (default: true) &ndash; Automatically focuses the top- and -left-most cell which is selectable after view rendering</li>
 *     <li><code>enableKeyNav</code> (default: true) &ndash; En-/disabled the navigation using arrow keys, shift key + arrow keys</li>
 * </ul>
 *
 * You can simply set these both options on the grid panel instance.
 *
 * ### Disabling selection of cells of specific columns
 *
 * If you'd like to disable the cells of a column from being selected by the user, just set the <code>selectable</code> flag to <code>false</code>.
 *
   <code>
       ...
       columns: [{
           header: 'Firstname',
           dataIndex: 'firstname',
           selectable: false,
           ...
       }, ...],
       ...
   </code>
 *
 * <strong>Note: Instead of header columns, all columns in a spreadsheet grid are selectable by  because of <code>Spread.grid.overrides.Column</code>.</strong>
 *
 * <br />
 *
 * xtype: <code>range</code>
 *
 * ## Editing of cells data using <code>Spread.grid.plugin.Editing</code>
 *
 * Cells of Ext JS 4 SpreadSheet can be edited like a standard Ext JS 4 grid. To gain a look and feel like using a
 * native spreadsheet application, there is a special plaintext editor getting active when start typing or double-clicking
 * on a grid cell. <strong>There is currently no support for Ext JS editor fields</strong> for the gain of being consistent
 * with the native spreadsheet look & feel.
 *
 * ### En-/disabling grid cell editing of the whole grid
 *
 * You can enable or disable grid editing on configuration time by setting the <code>editable</code> config option:
 *
 * <code>
       ...
       editable: false,
       ...
   </code>
 *
 * After instantiation (at runtime), you can access the SpreadSheet grid panel instance (e.g. using <code>Ext.getCmp(...)</code>)
 * and call the method <code>setEditable((Boolean) isEditable)</code> to en-/disable editing at runtime:
 *
 * <code>

       Ext.getCmp('$gridPanelId').setEditable(false);

   </code>
 *
 * <strong>Note: Disabling editing mode globally means that editing gets disabled on all columns, ignoring what you
 * configured for the columns before. Enabling edit mode globally means that editing gets enabled only on those
 * columns, editing was enabled by configuration.</strong>
 *
 * ### Disabling editing of cells of specific columns
 *
 * If you'd like to disable editing of cell data for a column, just set the <code>editable</code> flag to <code>false</code>.
 *
   <code>
       ...
       columns: [{
           header: 'Firstname',
           dataIndex: 'firstname',
           editable: false,
           ...
       }, ...],
       ...
   </code>
 *
 * <strong>Note: Instead of header columns, all columns in a spreadsheet grid are editable by default because of <code>Spread.grid.overrides.Column</code>.</strong>
 *
 * ### Colorization of editable cells
 *
 * Ext JS 4 SpreadSheet has a special feature to colorize the cell background of cells, which are editable.
 * By default this color is light yellow (see "Special Styling (CSS)" section if you'd like to change this).
 * You can en-/disable this feature by setting the <code>enableEditModeStyling</code> config
 * option in grid panel configuration:
 *
 * <code>
       ...
       enableEditModeStyling: true, // default value
       ...
   </code>
 *
 * <strong>Note that <code>editModeStyling</code> can cause problems when using special cell background colors.</strong>
 *
 * ### Advanced editing configuration
 *
 * The editing plugin features several configuration options. If you'd like to change the editing behaviour, instantiate
 * the grid panel with <strong>a configured instance</strong> of <code>Spread.grid.plugin.Editing</code> like shown below:
 *
 * <code>

       ...

       editablePluginInstance: Ext.create('Spread.grid.plugin.Editable', {
           editModeStyling: false, // disallows edit mode styling even if activated on columns
           ...
       }),

       ...

   </code>
 *
 * ## Cell data pre-processor functions
 *
 * Every column in a spreadsheet grid panel can be configured to use a custom getter and setter function
 * to read data from the record to be displayed or copied (reader function) or to pre-process pasted data
 * or edited values before getting written to a data record (writer function).
 *
 * ### Column based cell reader function
 *
 * Registering a cell data reader hook is easy. Simply set the <code>cellreader</code> property to a function:
 *
 * <code>
       ...
       columns: [{
           header: 'Firstname',
           dataIndex: 'firstname',
           cellreader: function(value, position) {
               // transform cell data value here...
               return value;
           }
           ...
       }, ...],
       ...
   </code>
 *
 * As you can see, the reader function gets called with two arguments:
 *
 * <ul>
 *     <li> <code>value</code> &ndash; The data value read from cell data record field</li>
 *     <li> <code>position Spread.selection.Position</code> &ndash; The cell's position</li>
 * </ul>
 *
 * <strong>The return value will be used for rendering cell data, value to be used in cell editor, copying cell data.</strong>
 *
 * ### Column based cell writer function
 *
 * If you configure a <code>cellwriter</code>-function for a column, the data which gets pasted or
 * submitted after leaving the edit mode (the text input field) of a cell, will be processed by this function.
 *
 * The first argument contains the new value (String). The second argument holds a reference to the current
 * focused cell position (Spread.selection.Position). The value you return in the <code>cellwriter</code> function
 * is the value which gets written onto the data record.
 *
 * Simply set the <code>cellwriter</code> property to a function:
 *
 * <code>
       ...
       columns: [{
           header: 'Firstname',
           dataIndex: 'firstname',
           cellwriter: function(newValue, position) {
               // pre-process new cell data value here before it's getting written to the data record...
               return newValue;
           }
           ...
       }, ...],
       ...
   </code>
 *
 * Attention: If you DONT SET a cellwriter, the spreadsheet tries to automatically cast the datatype
 * of the incoming new value (String) into the data type defined in the model (type) - e.g. int -> parseInt,
 * float -> parseFloat and so on. If you do not set a data type in the model or set the
 * data type to 'auto' String values will be stored. Have a look at Spread.selection.Position#setValue for details.
 *
 * As you can see, the writer function gets called with two arguments:
 *
 * <ul>
 *     <li> <code>newValue</code> &ndash; The data value to be written to the cell data record field</li>
 *     <li> <code>position Spread.selection.Position</code> &ndash; The cell's position</li>
 * </ul>
 *
 * <strong>The return value will be used to be written to the data record.
 * The new value may be supplied by pasting data into the cell or field editor.</strong>
 *
 * ## Auto-Committing of cell data on edit/paste
 *
 * When cell data gets changed by editing or pasting data the underlaying grid row's store record can be automatically
 * changed when auto-committing is enabled on the column and the grid panel. This prevents the red arrow dirty marker
 * from being displayed.
 *
 * Auto-committing of cell data is disabled by default on the grid panel but enabled on each grid column by default.
 * This means that you can enable auto-committing easily and globally by setting the <code>autoCommit</code> config
 * option to <code>true</code> on the grid panel instance:
 *
 * <code>

       ...,
       autoCommit: true,
       ...

   </code>
 *
 * ### Disabling auto committing for specific columns
 *
 * To disable auto committing of cell data on the cells of specific columns simply set the <code>autoCommit</code> config
 * option of a grid column to <code>false</code>:
 *
 * <code>
       ...,
       columns: [{
           header: 'Lastname',
           dataIndex: 'lastname',
           autoCommit: false
       }, ...],
       ...
   </code>
 *
 * ## Advanced: Event capturing
 *
 * In some special cases you may want to capture spreadsheet grid events to execute custom application code when needed.
 * E.g. you want to execute special logic when a cell gets covered (selection of a cell happened and covering view element
 * has been rendered and placed over the specific cell).
 *
 * For such purpose you may simply add an event listener to the specific grid event using the <code>listeners</code>
 * configuration option, bind an event handler to the instance using Ext.getCmp(...).on('covercell', function() {...})
 * or use the MVC's controller infrastructure to select a component and bind it's events:
 *
   <code>
       ...
       listeners: {

           // Simple listening to a View's event (relayed)
           covercell: function() {
               console.log('External listener to covercell', arguments);
           }
       },
       ...
   </code>
 *
 * <strong> Note that any special spreadsheet event fired by sub-components of the grid panel: the grid's view,
 * editable, pasteable and copyable plugin get relayed to the grid panel itself. So you don't need to care about these
 * sub-component instances for event handling.
 *
 * To capture selection model events, call <code>grid.getSelectionModel().on('$selectionModelEventName', function() {...})</code>.
 * </strong>
 *
 * ## Advanced: Custom styling
 *
 * Customizing the look of the spreadsheet grid can be accomplished by changing configuration options of the <code>viewConfig</code>
 * configuration option (see above). But if that doesn't help you may want to override CSS rules to e.g. change the color of the
 * background color when <code>editModeStyling</code> is enabled. Therefore you would just need to include your own
 * CSS stylesheet file or append a <code>style</code>-tag to the <code>head</code>-section of your web page containing something like this:
 *
 * <code>

     .x-grid-row .spreadsheet-cell-editable .x-grid-cell-inner {
         background-color: #cfffff;
     }

     .x-grid-row .spreadsheet-cell-editable-dirty .x-grid-cell-inner {
         background-color: #cfffff;
         background-image: url("dirty.gif");
         background-position: 0 0;
         background-repeat: no-repeat;
     }

   </code>
 *
 * <strong>Just copy and paste the CSS selectors of resources/spread.css to change the style of your spreadsheet grid.
 * Ensure to prepend your own styling rules.</strong>
 *
 * ## Advanced: Special copy & paste behaviour customization
 *
 * For fine tuning and in special cases you may want to change the default configuration of the pasteable and copyable
 * plugins of the spreadsheet grid panel. Thanks to the dependency injection architecture of the spreadsheet grid
 * implementation you can simply create your own plugin instance and inject it into the spreadsheet grid panel instance
 * configuration:
 *
 * <code>

       ...

       copyablePluginInstance: Ext.create('Spread.grid.plugin.Copyable', {

           // Overriding a method on instance level to change the keystroke for copying.
           // Using this it's CTRL+O instead of C but only for this instance of the spreadsheet gird.
           detectCopyKeyStroke: function(evt) {

              if (evt.getKey() === evt.O && evt.ctrlKey) {
                  this.copyToClipboard();
              }
          },
           ...
       }),

       pasteablePluginInstance: Ext.create('Spread.grid.plugin.Pasteable', {
           useInternalAPIs: true, // Enabling an experimental feature, much faster but dangerous
           ...
       }),

       ...

   </code>
 */
Ext.define('Spread.grid.Panel', {

    extend: 'Ext.grid.Panel',

    requires: ['Spread.command.Commander'],

    alias: 'widget.spread',

    // use spread view
    viewType: 'spreadview',

    closeAction: 'destroy',

    /**
     * @cfg {Boolean} autoFocusRootPosition
     * Automatically focuses the root position initially
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
     * @cfg {Object}
     * Config object to configure a Spread.grid.plugin.Editable plugin.
     * To change the configuration of the plugin, you may just assign your own config here.
     */
    editablePluginConfig: {},

    /**
     * @cfg {Object}
     * Config object to configure a Spread.grid.plugin.Copyable plugin.
     * To change the configuration of the plugin, you may just assign your own config here.
     */
    copyablePluginConfig: {},

    /**
     * @cfg {Object}
     * Config object to configure a Spread.grid.plugin.Pasteable plugin.
     * To change the configuration of the plugin, you may just assign your own config here.
     */
    pasteablePluginConfig: {},

    /**
     * @cfg {Object}
     * Config object to configure a Spread.grid.plugin.ClearRange plugin.
     * To change the configuration of the plugin, you may just assign your own config here.
     */
    clearRangePluginConfig: {},

    // Internal plugin registry map
    pluginRegistry: {},

    /**
     * Pre-process the column configuration to avoid incompatibilities
     * @return void
     */
    constructor: function(config) {

        var me = this;

        // Create instances of plugins
        this.instantiatePlugins();

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
            'editablechange',

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
            'paste',
            'editablechange',
            'covercelleditable'
        ]);

        // Just relay autoCommit flag to pastable plugin
        if (me.pasteablePluginInstance) {
            me.pasteablePluginInstance.autoCommit = me.autoCommit;
        }

        //console.log('my view', me.view);

        // View refresh
        me.editablePluginInstance.on('covercelleditable', function() {

            // Handle edit mode initially
            me.setEditable(me.editable);

            // Set edit mode styling
            me.setEditModeStyling(me.editModeStyling);

        }, this, {
            single: true
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
     * Returns the Commander API
     * @return {Spread.command.Commander}
     */
    getCommander: function() {

        // Create and return an instance of the commander
        return Ext.create('Spread.command.Commander', {
            grid: this
        });
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
        }
    },

    /**
     * @protected
     * Creates instances of plugins from local configuration
     * @return void
     */
    instantiatePlugins: function() {

        this.editablePluginInstance = Ext.create('Spread.grid.plugin.Editable', this.editablePluginConfig);
        this.pluginRegistry['Spread.grid.plugin.Editable'] = this.editablePluginInstance;

        this.copyablePluginInstance = Ext.create('Spread.grid.plugin.Copyable', this.copyablePluginConfig);
        this.pluginRegistry['Spread.grid.plugin.Copyable'] = this.copyablePluginInstance;

        this.pasteablePluginInstance = Ext.create('Spread.grid.plugin.Pasteable', this.pasteablePluginConfig);
        this.pluginRegistry['Spread.grid.plugin.Pasteable'] = this.pasteablePluginInstance;

        this.clearRangePluginInstance = Ext.create('Spread.grid.plugin.ClearRange', this.clearRangePluginConfig);
        this.pluginRegistry['Spread.grid.plugin.ClearRange'] = this.clearRangePluginInstance;
    },

    /**
     * Returns an instance of the plugin named by class name or returns undefined
     * @param {String} pluginClassName Class name of the plugin to fetch instance of
     * @return {Ext.AbstractComponent}
     */
    getPlugin: function(pluginClassName) {
        return this.pluginRegistry[pluginClassName];
    },

    /**
     * @protected
     * Pays attention to the fact that the developer could define an own viewConfig,
     * so we need to merge-in our spreadPlugins array (apply the defaults)
     * @param {Object} config Grid config object
     * @return void
     */
    manageViewConfig: function(config) {

        this.hasView = false;

        var me = this, initSpreadPlugins = function(config) {

            // Init plugins array
            config.viewConfig.spreadPlugins = [];

            // Add default plugins
            config.viewConfig.spreadPlugins.push(
                me.editablePluginInstance,
                me.copyablePluginInstance,
                me.pasteablePluginInstance,
                me.clearRangePluginInstance
            );
        };

        // User specified it's on viewConfig
        if (config.viewConfig) {

            // Maintain merging of spreaiewonfig section
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
                pluginCheckMerge(Spread.grid.plugin.ClearRange, this.clearRangePluginInstance);

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