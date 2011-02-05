
var io = require('socket.io');
var util = require('util');



var Room = function() {
    var text;
    var url;
    var clients;
}

var RejectPacket = function(reason, room) {
    return {'reject' {
        'reason': reason,
        'room_url': room.url
    }}
}


this.Server = function(app) {
    var socket = io.listen(app);
    var rooms = {};
    
    //Verify a token.
    var verify_token(token, onreply) {
    //TODO: Impliment this.
    }
    
    socket.on('connection', function(client) {
            
        //Set data for this new client.
        client.collab = {
            verified: false,
            room: null,
            name: ""
            
        }
        
        client.on('message', function(data) {
            //Client has initiated the handshake procedure
            if ('connect' in data) {
                if (client.verified == true) {
                    throw "Client already verified?!";
                }
                //If the token is valid, update the client's details. Reject them otherwise.
                verify_token(data.token, function(response) {
                    
                });
            }
        
            //Client has requested to join a room.
            if ('reject_join' in data) {
                if (client.collab.room) {
                    client.send(RejectPacket("You are already in a room."));
                }
            }
        });
        
    });
}
