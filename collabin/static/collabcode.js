
/********
Editor utilising only a visible textarea
********/
Editor = function(id, url) {
    var textarea = document.getElementById(id);
    var prevtext = textarea.value;
    var sync;
    
    //Start the synchroniser.
    this.connect = function() {
        sync = new Synchroniser(url, this.getValue, this.setValue);
    };
    
    //Get the editor's text
    this.getValue = function() {
        return textarea.value;
    };
    
    //Set the editor's text
    this.setValue = function() {
        textarea.value = value;
    };

    //Send typing data    
    textarea.onkeyup = function(argument) {
        var startchange = -1;
        var pos = textarea.selectionStart;
        var c;
        
        for (c in textarea.value) {
            if (textarea.value[c] !== prevtext[c]) {
                startchange = parseInt(c,10);
                break;
            }
        }
        if (startchange===-1) {
            if (s.length<prevtext.length) {
                startchange=s.length;
            }
            else {
                return;
            }
        }
        
        var str = textarea.value.slice(startchange, pos);
        var del = prevtext.slice(startchange, startchange + prevtext.length - textbox.value.length);
        
        sync.Write(startchange, str, del);
        prevtext = textbox.value;
    };
};


