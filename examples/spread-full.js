/**
 * Ext Calc example code.
 */
Ext.onReady(function() {

    var fields = ['id', 'firstname', 'lastname', 'age', 'birthday', 'isMember', 'loginCount'],
        dataGenerator = function(count) {

            var data = [];

            // Generate data rows
            for (var i=0; i<count; i++) {

                data.push({
                    id: i+1,
                    firstname: 'Eddie ' + (i+1),
                    lastname: 'Crash ' + (i+1),
                    age: parseInt(i+20),
                    birthday: new Date(),
                    isMember: i % 2 ? true : false,
                    loginCount: parseInt(Math.random()) + i
                });
            }
            return data;
        };

    var localDataStore = new Ext.data.Store({
        storeId: 'persons',
        data: dataGenerator(100),
        proxy: {
            type: 'memory',
            reader: {
                type: 'json'
            }
        },
        fields: fields
    });

    // Create an instance of the Ext Calc panel
    var spreadPanel = new Spread.grid.Panel({

        store: localDataStore,

        // You can supply your own viewConfig to change
        // the config of Spread.grid.View!
        /*
        viewConfig: {
            stripeRows: true
        },
        */

        listeners: {
            covercell: function() {
                //console.log('External listener to covercell', arguments);
            }
        },

        // Setting if editing is allowed initially
        editable: true,

        // Setting if edit mode styling shall be activated
        editModeStyling: true,

        // Enable summary feature
        features: [{
            ftype: 'summary'
        }, {
            ftype: 'filters',
            autoReload: true,
            local: true,
            filters: [{
                type: 'string',
                dataIndex: 'lastname'
            }]
        }],

        // Configure visible grid columns
        columns: [{
            xtype: 'spreadheadercolumn',
            header: 'ID'
        }, {
            header: 'First name',
            dataIndex: 'firstname',
            selectable: false
        }, {
            header: 'Last name',
            renderer: function(value) {
                return '<b>' + value + '</b>';
            },
            dataIndex: 'lastname'
        }, {
            allowedEditKeys: '0123456789.',
            header: 'Age',
            //hidden: true,
            dataIndex: 'age',
            xtype: 'numbercolumn',
            summaryType: 'sum',
            summaryRenderer: function(value, summaryData, dataIndex) {
                return '<b>' + value + '</b>';
            }
        }, {
            header: 'Birthday',
            dataIndex: 'birthday',
            xtype: 'datecolumn',

            // Column based auto-commit setting
            autoCommit: false
        }, {

            // Special column-based edit mode inking deny
            //editModeStyling: false,

            header: 'Is member?',
            dataIndex: 'isMember',
            xtype: 'booleancolumn',
            cellreader: function(value, position) {

                //console.log('[Before] Reading value: ', value, ' from ', position);

                // Change the return value here!
                // Meta-data is accessible through position.record etc.

                return value;
            },
            cellwriter: function(value, position) {

                //console.log('[Before] Writing value: ', value, ' to ', position);

                // Change the return value here!
                // Meta-data is accessible through position.record etc.

                return value;
            }
        }, {
            header: 'Login count (cnt)',
            dataIndex: 'loginCount',
            editModeStyling: false,
            xtype: 'templatecolumn',
            summaryType: 'count',
            summaryRenderer: function(value, summaryData, dataIndex) {
                return '<b>' + value + '</b>';
            },
            tpl: '{firstname} (<i>{loginCount}</i>)'//,
            //editable: false
        }]
    });

    // Show spread inside a window
    var spreadWnd = new Ext.window.Window({
        title: 'Spread Example',
        layout: 'fit',
        maximizable: true,
        resizable: true,
        width: 1000,
        height: 600,
        tbar: [{
            text: 'Enable edit mode',
            handler: function() {
                spreadPanel.setEditable(true);
            }
        }, {
            text: 'Disable edit mode',
            handler: function() {
                spreadPanel.setEditable(false);
            }
        }],
        items: [spreadPanel]
    });

    // Show the spread window
    spreadWnd.show();

    // And center it
    spreadWnd.center();
});