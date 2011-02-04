
/* class Synchroniser(string url, string() getFunc, void(string) setFunc)
Create a Synchroniser, connecting to a node server at the given URL.
Must be supplied with getFunc() - to get the value of whatever is being synchronised,
And setFunc(string), to set it.
*/
Synchroniser = function(url, getFunc, setFunc) {
    var t = this;
    
    var last_applied, //The last command sent by the server which has been applied.
        last_sent,    //The last command sent to the server
        last_state,   //The last known synchronised state
        outbox_queue = Array(), //A queue of commands to send
        inbox_queue = Array(),  //A buffer of commands to apply once confirmation of the last sent command is recieved
        write_count = 0,        //Number of commands this client has written
        
        callbacks = {}
        
        socket = new io.Socket(url);
        

    /* Add a callback function to the Synchroniser
    */
    this.addCallback = function(name, func) {
        if (!(name in callbacks)) {
            callbacks[name] = Array();
        }
        callbacks[name].push(func);
    }
    
    /* runCallback(name, arg1, arg2...)
        Run said callback with given arguments.
    */
    var runCallback = function(name) {
        if (name in callbacks) {
            return;
        }
        var args = arguments.slice(1);
        callbacks[name].apply(this, args);  
    }

    /* Input commands to synchronise.
        pos (int)         : position to start the command.
        deletetext(string): content of text deleted at pos.
        newtext (string)  : content of text added after any deletion.
        
    */    
    this.Write = function(pos, newtext, deletetext) {
        
        command = {
            id: socket.sessionId+''+write_count,
            pos: pos,
            text: newtext,
            del: deletetext
        }
        write_count += 1;
        if (last_sent) {
            outbox_queue.push(command);
        }
        else {
            t.sendWrite(command);
            //The last known synchronised state is the current one.
            last_state = getFunc();
        }
    }
    
    /* Send a command to the server.
    */
    this.sendWrite = function(command) {
        //Parent the command off to the most recently saved server command.
        command.parent = last_applied.id;
        
        last_sent = command;
        socket.send({'write':command});
    }
    
    /* Return value that v becomes after being transformed by 'write'
    */
    this.applyWrite(text, write) {
        
        var slice1 = text.slice(0, write.pos);
        var slice2 = text.slice(write.pos + write.del.length + write.text.length);
        return v = slice1 + write.text + slice2;
    }
    
    socket.on('connect', function() {
        this.runCallback('connect');
    });    
    
    // Recieved data from the server
    socket.on('message', function(data) {
    
        if ('write' in data) {
            var write = data.write;
            
            if (!last sent) {
                //If we are not waiting for feedback from a previous send:
                //Directly apply the update - there will be no conflict.
                setFunc(t.applyWrite(last_state, write));
            }
            else if (write.id = last_sent.id) {
                //If this IS the feedback from our previous send:
                //Apply all updates since the last known synchronised state.
                var s = last_state, n = data.write, u;
                for (var i in inbox_queue) {
                    u = inbox_queue[i];
                    s = t.applyWrite(s, u);
                }
                s = t.applyWrite(s, write);
                setFunc(s);
            }
            else {
                //If we are still waiting for feedback from the previous send:
                //Add this command to the inbox.
                inbox_queue.push(write);
            }
        }
    });
    
}

