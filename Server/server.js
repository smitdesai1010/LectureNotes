var server = require('http').createServer();
var io = require('socket.io')(server, {
  cors: {
    origin: 'chrome-extension://idfglfldodgboholaplhokbkffmcccdn',
    credentials : true
  }
});

//Whenever someone connects this gets executed
io.on('connection', (socket) => {
   console.log('A user connected');

   socket.on('disconnect', () => console.log('A user disconnected') );

});

server.listen(3000, () => console.log('listening on *:3000') );


