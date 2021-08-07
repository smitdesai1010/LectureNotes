var WebSocketServer = require('websocket').server;
var http = require('http');

var server = http.createServer();
server.listen(1337, () => console.log(`Application running Port 1337`));

//remove other websocket modules

wsServer = new WebSocketServer({
  httpServer: server
});

wsServer.on('request', function(request) {
  var connection = request.accept(null, request.origin);

  // This is the most important callback for us, we'll handle
  // all messages from users here.
  connection.on('message', (message) => {
      console.log('message')
  });

 

  connection.on('close', function(connection) {
  });
});



