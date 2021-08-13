//configuring environmental variables
require('dotenv').config();

//setting up external APIs
const deepai = require('deepai'); 
deepai.setApiKey(process.env.DEEPAI_KEY);


//setting up server, cors and web sockets
const server = require('http').createServer();
const io = require('socket.io')(server, {
  cors: {
    origin: 'chrome-extension://idfglfldodgboholaplhokbkffmcccdn',
    credentials : true
  }
});


//Whenever someone connects, this gets executed
io.on('connection', (socket) => {
   console.log('A user connected');
   const audioData = [];

   socket.on('audioData', (data) => {
      audioData.push(data);
   });

   socket.on('getNotes', data => {
     //console.log(typeof audioData);
     //config google service account to implement the rest of the logic
     //data = googleSpeechToText();
      
     deepai.callStandardApi("summarization", { text: data })
     .then(summary => {
       socket.emit('notes',JSON.stringify({response: summary}));
     })
     .catch(error => {
       console.log('Error in DeepAI api'+error);
       socket.emit('notes',JSON.stringify({error : 'Error in DeepAI api'+error}));
     })

     //socket.emit('notes','Smit Desai');
   })

   socket.on('disconnect', () => console.log('A user disconnected') );
});

server.listen(3000, () => console.log('listening on *:3000') );


