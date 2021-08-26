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

      //work on this
      res.send(ID+'');
})

app.post('/getNotes', (req, res) => {
      const ID = req.body.ID;

      if (ID == null) {
        res.sendStatus(404);
        return;
      }
      console.log(userData[ID].transcription);
      
      deepai.callStandardApi("summarization", { text: data })
      .then(summary => {
          res.send(summary);
      })
      .catch(error => {
          console.log('Error in DeepAI api'+error);
          res.sendStatus(404);
      })

      //reset transcription
      userData[ID].transcription = '';
})

app.all('/', (req, res) => {
  res.send('Invalid Route');
})

wss.on('connection', (ws,req) => {

  const clientData = queryString.parse(req.url.substr(req.url.indexOf('?')+1));
  const ID = clientData.ID;
  const lang = clientData.language;

  console.log('WSS connection ID: '+ID)
  //console.log(util.inspect(userData[ID], false, null, true))

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
        console.log(`Transcription: ${transcription}`);
        userData[ID].transcription += transcription;
      })
  });
  
});



server.listen(PORT, () => console.log(`Process running at localhost:${PORT}`) )
