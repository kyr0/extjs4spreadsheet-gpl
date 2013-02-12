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

        // Setting if editing is allowed initially
        editable: false,

        // Configure visible grid columns
        columns: [{
            xtype: 'spreadheadercolumn',
            header: 'ID'
        }, {
            header: 'First name',
            dataIndex: 'firstname'
        }, {
            header: 'Last name',
            renderer: function(value) {
                return '<b>' + value + '</b>';
            },
            dataIndex: 'lastname'
        }, {
            allowedEditKeys: '0123456789.',
            header: 'Age',
            dataIndex: 'age',
            xtype: 'numbercolumn'
        }, {
            header: 'Birthday',
            dataIndex: 'birthday',
            xtype: 'datecolumn'
        }, {
            header: 'Is member?',
            dataIndex: 'isMember',
            xtype: 'booleancolumn',
            hidden: true
        }]
    });

    // Show spread inside a window
    var spreadWnd = new Ext.window.Window({
        title: 'Spread Example - Display Only, Member column initially hidden',
        layout: 'fit',
        maximizable: true,
        resizable: true,
        width: 1000,
        height: 600,
        items: [spreadPanel]
    });

    // Show the spread window
    spreadWnd.show();

    // And center it
    spreadWnd.center();
});