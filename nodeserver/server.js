
var io = require('socket.io');
var util = require('util');



var Room = function() {
    var text;
    var url;
    var clients;
    var max_clients=10;
    
    /* Return the number of places left in the room. */
    this.getRemainingSpace = function() {
        return max_clients - clients.length;
    }
}


/* Packet class. 
    Example use: client.send(new Packet().acceptJoin().fullText(room).clientList(room).data);
*/
var Packet = function() {
    
    this.data = {};
    
    //reject_join, sent to clients who have been rejected from a room for some reason
    this.Reject = function(reason,room) {
        data.reject {};
        data.reject.reason = reason;
        if (room) data.reject.room = room;
        return this;
    }
    
    //accept_token, client's token has been accepted
    this.acceptToken = function() {
        data.accept_join = true;
        return this;
    }
    
    //Send this packet to a client;
    this.send(client) {
        client.send(this.data);
    }
}

/* Server class.
*/
this.Server = function(app) {
    var socket = io.listen(app);
    var rooms = {};
    
    //Verify a token.
    var verify_token(token, onreply) {
    //TODO: Impliment this.
    }
    
    socket.on('connection', function(client) {
        
        var Disconnect = function() {
            client.connected = false;
            client.on('message',undefined); //no clue if this works.
        }
        
        //Set data for this new client.
        client.collab = {
            verified: false,
            room: null,
            userid: "",
            name: "",
            avatar_url: "",            
        }
        
        client.on('message', function(data) {
            if (!client.connected) return;
            
            //Client has initiated the handshake procedure
            if ('connect' in data) {
                if (client.verified == true) {
                    new Packet().Reject("Illegal attempt to handshake twice.").Send(client);
                    Disconnect();
                    return;
                }
                if (client.collab.room) {
                    new Packet().Reject("You are already in a room.").Send(client);
                    Disconnect();
                    return;
                }
                //If the token is valid, update the client's details and attempt to join the room.
                verify_token(data.token, function(response) {
                    if (response.accepted === true) {
                        client.collab.userid = response.details.userid;
                        client.collab.name = response.details.name;
                        client.avatar_url = response.details.avatar_url;
                        
                        new Packet().acceptToken().Send(client);
                    }
                    else {
                        new Packet().Reject("Invalid token.").Send(client);
                    }
                });
            }
        });
    });
}
