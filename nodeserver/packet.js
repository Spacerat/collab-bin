
/* Packet class. 
    Example use of chaining: new Packet().acceptJoin().fullText(room).clientList(room).Send(client);
*/
this.Packet = function() {
    var data = {};

    //reject_join, sent to clients who have been rejected from a room for some @reason
    this.Reject = function(reason, room) {
        data.reject = {};
        data.reject.reason = reason;
        if (room) {
            data.reject.room = room;
        }
        return this;
    };

    //accept_token, client's token has been accepted.
    this.acceptToken = function() {
        data.accept_token = true;
        return this;
    };

    //new_applicant, inform room members of a new applicant.
    this.newApplicant = function(client) {
        data.new_applicant = {
            details: client.details
        };
    };

    //new_member, inform room members of a new member.
    this.newMember = function(client) {
        data.new_member = {
            details: client.details,
            can_write: client.can_write
        };
    };

    //accept_join, inform a client that their request to join has been accepted.
    this.acceptJoin = function(can_write) {
        data.accept_join = {
            can_write: can_write
        };
        return this;
    };

    ///////////////////////////////
    //Send this packet to a client;
    this.Send = function(client) {
        client.send(data);
    };


    //Send this packet to all clients other than @exclude
    this.Broadcast = function(socket, exclude) {
        if (exclude) {
            socket.broadcast(data, exclude.sessionId);
        }
        else {
            socket.broadcast(data);
        }
    };

    //Send this packet to all clients in @room other than @exclude
    this.broadcastToRoom = function(socket, room, exclude, include_applicants) {
        var i;
        var dest = room.members;
        if (include_applicants===true) {dest=dest.concat(room.applicants);}
        for (i in dest) {
            if (dest[i]!==exclude) {dest[i].send(data);}
        }
    };
};
