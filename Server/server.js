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
const queryString = require('query-string');
const express = require('express');
const app = express();
const server = require('http').createServer(app);
const { WebSocketServer } = require('ws');
const wss = new WebSocketServer({ server });

const PORT = 8080;
let userData = {};
let userID = 0;

//set cors opqque for other users
//use redis 
//implement heartbeat mechanism for websockets
//add multiple language support   //done
//work on API responses   //done
//identify socket close     //done
//polling for client registration //done

app.use(cors({
    origin: 'chrome-extension://okffaginjdbcdkkhoepjeghoiegbhohf',
    credentials : true
}));

app.use(express.json());

app.post('/register', (req, res) => {
      const ID = userID++;
      const configration = req.body.config;

      userData[ID] = {
        transcription: '',
        config: configration == null ? {language: 'en-US', sampleRateHertz: 48000} : configration
      }
      console.log('User registered: '+ID)

      res.set('Content-Type', 'text/plain');
      res.status(200).send(ID+'');  //express assumes this ID is a statusCode and throws a depreciation error
})

app.post('/getNotes', (req, res) => {
      const ID = req.body.ID;

      if (ID == null) {
        res.status(400).send('The client ID is null');
        return;
      }

      deepai.callStandardApi("summarization", {text: userData[ID].transcription, }) 
      .then(summary => {
          const notes = summary.output == '' ? 'Not enough data' : summary.output;
          
          let notesAndTranscription = `NOTES\n-----------\n${notes}\n\n\n` +  
                                      `TRANSCRIPTION\n-----------\n${userData[ID].transcription}`;
          
          res.send(notesAndTranscription);
          userData[ID].transcription = '';
      })
      .catch(error => {
          console.log('Error in DeepAI api'+error);
          res.status(500).send('Cannot to summarize text.\n Transcription \n'+userData[ID].transcription);
      })
})

app.all('/', (req, res) => {
  res.send('Invalid Route');
})

wss.on('connection', (ws,req) => {

  const clientData = queryString.parse(req.url.substr(req.url.indexOf('?')+1));
  const ID = clientData.ID;
  const lang = clientData.languageCode;

  if (ID == null) {
    ws.send('Invalid ID');
    ws.terminate();
  }

  console.log('Socket connected ID: '+ID)

  if (lang != null)
    userData[ID].config.language = lang;

  ws.on('message', (message) => {
      console.log('Data received from ID: '+ID);

      client.recognize({
        audio: { content: message.toString() },
        config: userData[ID].config
      })
      .then( ([response]) => {
        const transcription = response.results.map(result => result.alternatives[0].transcript).join('\n');
        //console.log(`Transcription: ${transcription}`);
        userData[ID].transcription += transcription;
      })
      .catch(err => {
        console.log(`Error in transcription from ID: ${ID} \n`+err);
        ws.send(err);
      })
  });

  ws.on('close', () => {
    console.log('Socket disconnected ID: '+ID);
  })
  
});



server.listen(PORT, () => console.log(`Process running at localhost:${PORT}`) )
