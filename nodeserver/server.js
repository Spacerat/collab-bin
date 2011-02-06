
var io = require('socket.io');
var util = require('util');

/* Room class. Pass settings object in the form: {
    max_clients: int,    //10
    anyone_write: bool,  //false
    anyone_join: bool,   //false
}*/
var Room = function(settings) {
    var text;
    var url;
    
    var members = Array();
    var applicants = Array();
    
    var max_members = settings.max_members | 10;
    var anyone_write = settings.require_write_auth | false;
    var anyone_join = settings.require_join_auth | false;
    //TODO: Admins?
    
    // Return the number of places left in the room.
    this.getRemainingSpace = function() {
        return max_members - members.length;
    }
    
    //Add a member to this room.
    this.addMember = function(client) {
        var i;
        if (getRemainingSpace === 0) {
            client.Disconnect("Room has no free spaces",this);
            return;
        }
        //Broadcast info about this new member.
        new Packet().newMember(client).broadcastToRoom(socket, room);
        new Packet().acceptJoin(anyone_write).Send(client)
        
        //Remove the member from the applicants list
        if ((i = members.indexOf(client))>=-1) {
            applicants = applicants.slice(0, i).concat(applicants.slice(i + 1));
        }
    }
    
    //Add an applicant to this room.
    this.addApplicant = function(client) {
        new Packet().newApplicant(client).broadcastToRoom(socket, room);
        applicants.push(client);
    }
}


/* Packet class. 
    Example use of chaining: new Packet().acceptJoin().fullText(room).clientList(room).Send(client);
*/
var Packet = function() {
    
    this.data = {};
    
    //reject_join, sent to clients who have been rejected from a room for some @reason
    this.Reject = function(reason, room) {
        data.reject {};
        data.reject.reason = reason;
        if (room) data.reject.room = room;
        return this;
    }
    
    //accept_token, client's token has been accepted.
    this.acceptToken = function() {
        data.accept_token = true;
        return this;
    }
    
    //new_applicant, inform room members of a new applicant.
    this.newApplicant = function(client) {
        data.new_applicant = {
            details: client.details
        }
    }
    
    //new_member, inform room members of a new member.
    this.newMember = function(client) {
        data.new_member = {
            details: client.details,
            can_write: client.can_write
        }
    }
    
    //accept_join, inform a client that their request to join has been accepted.
    this.acceptJoin = function(can_write) {
        data.accept_join = {
            can_write: can_write;
        }
        return this;
    }
    
    ///////////////////////////////
    //Send this packet to a client;
    this.Send(client) {
        client.send(this.data);
    }
    
    
    //Send this packet to all clients other than @exclude
    this.Broadcast(socket, exclude) {
        if (exclude) {
            socket.broadcast(this.data, exclude.sessionId);
        }
        else {
            socket.broadcast(this.data);
        }
    }
    
    //Send this packet to all clients in @room other than @exclude
    this.broadcastToRoom(socket, room, exclude, include_applicants) {
        var i;
        var dest = room.members;
        if (include_applicants===true) {dest=dest.concat(room.applicants);}
        for (i in dest) {
            if (dest[i]!==exclude) {dest[i].send(this.data);}
        }
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
    
        client.Disconnect = function(reason, room) {
            if (reason) {
                new Packet().Reject(reason, room).Send(client);
            }
            client.connected = false;
            client.on('message',undefined); //no clue if this works.
        }
        
        //Inline Client class!
        client.collab = new (function(){
            this.verified = false;
            this.room: null;
            this.details {
                userid: "",
                name: "",
                avatar_url: ""
            }
            this.can_write = false;
        })();
        
        client.on('message', function(data) {
            if (!client.connected) return;
            
            //Client has initiated the handshake procedure
            //TODO: mechanism for creating rooms.
            if ('connect' in data) {
                var room;
                if (client.verified == true) {
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
                if (room.getRemainingSpace==0) {
                    client.Disconnect("Room has no free spaces.", room);
                }
                //If the token is valid, update the client's details and attempt to join the room.
                verify_token(data.connect.token, function(response) {
                    if (response.accepted === true) {
                        client.collab.details = response.details;
                        
                        new Packet().acceptToken().Send(client);
                        if (room.anyone_join===true) {
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
}

