
var io = require('socket.io');
var util = require('util');
var Packet = require('packet').Packet;

/* Room class. Pass settings object in the form: {
    max_clients: int,    //10
    anyone_write: bool,  //false
    anyone_join: bool,   //false
}*/
var Room = function(settings) {
    var text;
    var url;
    
    var members = [];
    var applicants = [];
    
    var max_members = settings.max_members | 10;
    var anyone_write = settings.require_write_auth | false;
    var anyone_join = settings.require_join_auth | false;
    //TODO: Admins?
    
    // Return the number of places left in the room.
    this.getRemainingSpace = function() {
        return max_members - members.length;
    };
    
    //Add a member to this room.
    this.addMember = function(client) {
        var i;
        if (this.getRemainingSpace === 0) {
            client.Disconnect("Room has no free spaces",this);
            return;
        }
        //Broadcast info about this new member.
        new Packet().newMember(client).broadcastToRoom(client.listener, this);
        new Packet().acceptJoin(anyone_write).Send(client);
        
        //Remove the member from the applicants list
        if ((i = members.indexOf(client))>=-1) {
            applicants = applicants.slice(0, i).concat(applicants.slice(i + 1));
        }
    };
    
    //Add an applicant to this room.
    this.addApplicant = function(client) {
        new Packet().newApplicant(client).broadcastToRoom(client.listener, this);
        applicants.push(client);
    };
};



/* Server class.
*/
this.Server = function(app) {
    var socket = io.listen(app);
    var rooms = {};
    
    //Verify a token.
    var verify_token = function(token, onreply) {
    //TODO: Impliment this.
    };
    
    socket.on('connection', function(client) {
    
        client.Disconnect = function(reason, room) {
            if (reason) {
                new Packet().Reject(reason, room).Send(client);
            }
            client.connected = false;
            client.on('message',undefined); //no clue if this works.
        };
        
        //Inline Client class!
        client.collab = {
            verified: false,
            room: null,
            details: {
                userid: "",
                name: "",
                avatar_url: ""
            },
            can_write: false
        };
        
        client.on('message', function(data) {
            if (!client.connected) {
                return;
            }
            //Client has initiated the handshake procedure
            //TODO: mechanism for creating rooms.
            if ('connect' in data) {
                var room;
                if (client.verified === true) {
                    client.Disconnect("Illegal attempt to handshake twice.");
                    return;
                }
                if (client.collab.room) {
                    client.Disconnect("You are already in a room.");
                    return;
                }
                if (!(data.connect.room in rooms)) {
                    client.Disconnect("Invalid room ID.");
                    return;
                }
                else {
                    room = rooms[data.connect.room];
                }
                if (room.getRemainingSpace === 0) {
                    client.Disconnect("Room has no free spaces.", room);
                }
                //If the token is valid, update the client's details and attempt to join the room.
                verify_token(data.connect.token, function(response) {
                    if (response.accepted === true) {
                        client.collab.details = response.details;
                        
                        new Packet().acceptToken().Send(client);
                        if (room.anyone_join === true) {
                            room.addMember(client);
                        }
                        else {
                            room.addApplicant(client);
                        }
                    }
                    else {
                        client.Disconnect("Invalid token.");
                        return;
                    }
                });
            }
            //TODO: process 'write' 
            //TODO: process 'accept_applicant'
            
        });
    });
};

