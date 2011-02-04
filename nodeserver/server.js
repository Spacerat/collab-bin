
var io = require('socket.io');
var util = require('util');

this.Server = function(app) {
    var socket = io.listen(app);
    var text = "Type stuff!";
    
    socket.on('connection', function(client) {
        
        
        
    });
}
