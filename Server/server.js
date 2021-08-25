//configuring environmental variables
require('dotenv').config();

//setting up external APIs
const speech = require('@google-cloud/speech');
const client = new speech.SpeechClient();
const deepai = require('deepai'); 
deepai.setApiKey(process.env.DEEPAI_KEY);

//setting up server, cors and web sockets
const util = require('util');
const cors = require('cors');
const { WebSocketServer } = require('ws');
const express = require('express');
const app = express();
const server = require('http').createServer(app);

const PORT = 8080;
const wss = new WebSocketServer({ server });

let userData = {};
let userID = 0;

//set cors opqque for other users
app.use(cors({
    origin: 'chrome-extension://okffaginjdbcdkkhoepjeghoiegbhohf',
    credentials : true
}));

app.use(express.json());
app.post('/', (req, res) => {

  console.log(util.inspect(req.body, false, null, true))
  const ID = req.body.ID;
  const config = req.body.config == null ? userData[ID].config : req.body.config;   //use default config if not provided

  if (ID == null) {
    res.sendStatus(404);
    return;
  }

  //speechToText(userData[ID].audioByte);
    
  client.recognize({
    audio: {
      content: userData[ID].audioByte
    },
    config: config
  })
  .then( ([response]) => {
    const transcription = response.results.map(result => result.alternatives[0].transcript).join('\n');
    console.log(`Transcription: ${transcription}`);
    console.log(util.inspect(response, false, null, true))
    res.send(transcription)
  })
  
})

app.all('/', (req, res) => {
  res.send('Invalid Route');
})

wss.on('connection', (ws,req) => {

  const ID = userID++;
  ws.send(ID);  //sending ID to the client

  console.log('WSS connection: '+ID)

  userData[ID] = {
    audioByte: '',
    config: {
      language: 'en-US',
      sampleRateHertz: 48000
    }
  }

  ws.on('message', (message) => {
      userData[ID].audioByte += message;
  });
  
});



server.listen(PORT, () => console.log(`Process running at localhost:${PORT}`) )



async function speechToText(audioData) {
  const request = {
    audio: {
      content: audioData
    },
    config: {
      encoding: "LINEAR16",
      sampleRateHertz: 48000,
      languageCode: 'en-US',
      audioChannelCount: 1,
    }
  };

  // Detects speech in the audio file
  const [response] = await client.recognize(request);
  const transcription = response.results
    .map(result => result.alternatives[0].transcript)
    .join('\n');
  console.log(`Transcription: ${transcription}`);

  console.log(util.inspect(response, false, null, true))
}

//https://stackoverflow.com/questions/8877666/how-is-a-javascript-hash-map-implemented
//https://stackoverflow.com/questions/17301269/can-websocket-addresses-carry-parameters

//https://stackoverflow.com/questions/56453937/how-to-google-speech-to-text-using-blob-sent-from-browser-to-nodejs-server
//https://medium.com/@ragymorkos/gettineg-monochannel-16-bit-signed-integer-pcm-audio-samples-from-the-microphone-in-the-browser-8d4abf81164d
//https://hacks.mozilla.org/2014/06/easy-audio-capture-with-the-mediarecorder-api/
//https://medium.com/ideas-at-igenius/delivering-a-smooth-cross-browser-speech-to-text-experience-b1e1f1f194a2

//https://stackoverflow.com/questions/48874118/porting-scriptprocessor-based-application-to-audioworklet
//https://stackoverflow.com/questions/57507737/send-microphone-audio-recorder-from-browser-to-google-speech-to-text-javascrip