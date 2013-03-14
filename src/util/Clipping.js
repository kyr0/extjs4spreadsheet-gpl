/**
 * @private
 * Class which implements clipping for clipboard interaction
 * using a hidden textarea-element.
 */
Ext.define('Spread.util.Clipping', {

    /**
     * @property {Ext.dom.Element}
     * Internal clipboard textarea instance/reference
     */
    el: null,

    /**
     * @property {Number} refocusDelay
     * Re-focus delay in milliseconds from textarea of clipboard back to grid's view
     */
    refocusDelay: 150,

    /**
     * @protected
     * Initialize clipboard on instance create
     * @return void
     */
    initClipping: function() {

        var me = this;

        Ext.onReady(function() {

            if (!me.hasClipboard()) {
                me.createClipboard();
            }
        });
    },

    /**
     * @protected
     * Needs to be called from an key event handler! (Timing matters)
     *
     * Method for preparing clipboard copying by focussing
     * the textarea element and inserting the tsv content.
     * @param {String} tsvData TSV content
     * @param {Spread.grid.View} view Spread view reference
     * @return void
     */
    prepareForClipboardCopy: function(tsvData, view) {

        var me = this;

        me.el.dom.style.display = "block";
        me.el.dom.value = tsvData;

        try {

            me.el.dom.focus();

            // To let the os copy selected text
            me.selectClippingText();

        } catch(e) {}

        // Re-focus the view
        me.refocusView(view);
    },

    /**
     * @protected
     * Selects the contents of the text area.
     * Used to make use of the operating system's default behaviour
     * of copying and pasting when a text area is focused and selected.
     * @return void
     */
    selectClippingText: function() {

        var me = this,
            range;

        // Code to prevent time-async double-paste os behaviours
        if (Ext.isIE) {

            range = me.el.dom.createTextRange();
            range.collapse(true);
            range.moveStart('character', 0);
            range.moveEnd('character', me.el.dom.value.length + 1);
            range.select();

        } else {
            me.el.dom.select();
        }
    },

    /**
     * @protected
     * Needs to be called from an key event handler! (Timing matters)
     *
     * Method for preparing clipboard pasting by focussing
     * the textarea element. Calls the pasteDataCallback
     * function after native paste event has been processed.
     * @param {Function} pasteDataCallback Paste function (first argument is clipboard data)
     * @param {Spread.grid.View} view Spread view reference
     * @return void
     */
    prepareForClipboardPaste: function(pasteDataCallback, view) {

        var me = this;

        me.el.dom.style.display = "block";

        try {

            me.el.dom.focus();

            // Code to prevent time-async double-paste os behaviours
            me.selectClippingText();

        } catch (e) {}

        setTimeout(function() {

            //console.log('Fetch data from clipboard: ', me.el.dom.value.length);

            // Call callback with pasted data
            pasteDataCallback(me.el.dom.value);

            // Reset textarea value
            me.el.dom.value = '';

        }, 150);

        // Re-focus the view
        me.refocusView(view);
    },

    /**
     * @protected
     * Creates a shadow clipboard element
     * @return void
     */
    createClipboard: function() {

        this.el = Ext.get(

            Ext.DomHelper.append(Ext.getBody(), {
                tag: 'textarea',
                cls: 'clipboard-textarea',
                style: {
                    display: 'none',
                    zIndex: -400,
                    position: 'absolute',
                    left: '0px',
                    top: '0px',
                    width: '0px',
                    height: '0px'
                },
                value: ''
            })

        );
    },

    /**
     * @protected
     * Checks if a clipboard element is available
     * @return {Boolean|Ext.dom.Element}
     */
    hasClipboard: function() {

        var el = Ext.select('.clipboard-textarea').elements[0];

        if (el) {

            this.el = Ext.get(el);
            return true;
        }
        return false;
    },


    /**
     * @protected
     * Re-focusses the view after a small time delay
     * @param {Spread.grid.View} view Spread view reference
     * @return void
     */
    refocusView: function(view) {

        var me = this;

        setTimeout(function() {

            try {
                view.getEl().focus();
            } catch (e) {}

            me.el.dom.style.display = "none";

        }, me.refocusDelay);
    }
});