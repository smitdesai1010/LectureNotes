//configuring environmental variables
require('dotenv').config();

//setting up external APIs
const speech = require('@google-cloud/speech');
const client = new speech.SpeechClient();
const deepai = require('deepai'); 
deepai.setApiKey(process.env.DEEPAI_KEY);

//setting up server, cors and web sockets
const util = require('util');
const { WebSocketServer } = require('ws');
const express = require('express');
const app = express();
const server = require('http').createServer(app);

const PORT = 8080;
const wss = new WebSocketServer({ server });

let userData = {};


wss.on('connection', (ws,req) => {

  const ID = req.url.substr(req.url.indexOf('=') + 1);
  console.log('WSS connection: '+ID)

  userData[ID] = {
    audioByte: '',
    config: {
      language: 'en-US',
      sampleRateHertz: 48000
    }
  }

  ws.on('message', async (message) => {
      console.log('data')
      userData[ID].audioByte += message;
      //await speechToText(audioData);
      //console.log('over')
  });

  //ws.send('something');
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