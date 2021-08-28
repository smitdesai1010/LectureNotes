const HOST = 'localhost:8080';
let clientID = null;
let socket = null;
let currRecodingTabID = null;
let currTabRecordingStatus = false;
let audioRecorder = null;
let intervalID = null;
let mediaStream = null;
let audio = new Audio(); //tabCapture stops the audio to the user, so playing the audio is not      
                         //via js audio object using the same stream   


//open socket on recording, close on stops
//cannot allow to change audio language while recording

fetch(`http://${HOST}/register`, {
    headers: {
        'Accept': 'text/plain',
        'Content-Type': 'application/json'
    },
    method: 'POST',
    body: JSON.stringify({
        config: {
            encoding: "LINEAR16",
            sampleRateHertz: new window.AudioContext().sampleRate,
            languageCode: 'en-US',
            audioChannelCount: 1,
        }
    })})
.then(res => res.text())
.then(text => clientID = text)
.catch(err => console.log('Cannot register'))


//ToDO : stop recording when a tab closes without clicking on stop record
// alert user if the server is down

//can make this sync
chrome.runtime.onMessage.addListener( async (request, sender, response) => {

    if (request.event == 'getRecordingStatus') {

        if (currRecodingTabID !== request.tabId)   //other tab is recording
            response({recordingStatus : false})
        else
            response({recordingStatus : currTabRecordingStatus});
    }

    else if (request.event === 'startRecording') {
        
        if (clientID == null) {
            alert('Cannot connect to server. Please try again in a few seconds')
            response({error : 'clientID is null, cannot connect to server'})
            return true;
        }
        
        if (currRecodingTabID !== null && currRecodingTabID !== request.tabId) {
            alert('Recording from multiple tabs at once not allowed')
            response({error : 'Recording from multiple tabs at once not allowed'})
            return true;
        }

        response({}); //success - Recording can start - empty object
        startRecording(request.tabId, request.languageCode);   
    }

    else if (request.event === 'stopRecording') { 
        stopRecording();
        response({}); //success - empty object
    }

    else if (request.event === 'getNotes') {
        getNotes();
        response({}); //success - empty object
    }


    return true; //making responses asynchronous
})


async function startRecording(tabID, languageCode) {
    
    currRecodingTabID = tabID; 
    currTabRecordingStatus = true;

    if (socket === null) {

        socket = new WebSocket(`ws://${HOST}?ID=${clientID}&language=${languageCode}`); 
         
        await new Promise((resolve, reject) => {                 
            socket.onopen = () => {
                console.log('Socket connected');
                resolve();  
            }
        }).catch(err => console.log('Error in opening socket :'+err))
    }

    mediaStream = await new Promise((resolve, reject) => {
        chrome.tabCapture.capture({audio: true}, stream => {
            resolve(stream);
        });
    }).catch(err => console.log('Error in getting media stream: ' + err))


    if (mediaStream == null) {
        alert('Unable to capture audio. Please try again !!');
        return;
    }

    //-------------------------------------------------
    const audioContext = new window.AudioContext();
    const ctxInput = audioContext.createMediaStreamSource(mediaStream);
    audioRecorder = new Recorder(ctxInput, { numChannels:1 });
    audioRecorder.record();
    
    intervalID = setInterval(() => {          //send a base64 encoded audioByte data every 3 secs 
        audioRecorder.exportWAV( blob => {

            let reader = new FileReader();
            reader.readAsDataURL(blob); 

            reader.onloadend = () => {
                const str = reader.result.substr(reader.result.indexOf(',')+1);
                socket.send(str);          
            }
        })
        audioRecorder.clear();
    },14000)
    //---------------------------------------------------------------------------

    audio.srcObject = mediaStream;  //chrome tab capture stops audio, so playing it via a background object
    audio.play();
}


function stopRecording() {
    
    clearInterval(intervalID);

    if (mediaStream != null) {  //since mediaStream is setuped asychromously, this maybe null if the user suddenly clicks on stop recording   
        mediaStream.getTracks().forEach(track => track.stop());
        mediaStream = null;
    }

    if (audioRecorder != null) {
        audioRecorder.exportWAV( blob => {        //sending the last buffered audio
            
            let reader = new FileReader();
            reader.readAsDataURL(blob); 

            reader.onloadend = () => {
                const str = reader.result.substr(reader.result.indexOf(',')+1);
                socket.send(str);          
            }
            
            audioRecorder.clear();  //close recorder
            audioRecorder.stop();
            audioRecorder = null;

            socket.close(); //close socket
            socket = null;
        })
    }
    
    currRecodingTabID = null;
    currTabRecordingStatus = false;
    audio.pause();
}


function getNotes() {
    
        stopRecording(); 
        
        fetch('http://'+HOST+'/getNotes', {
            headers: {
                'Accept': 'text/plain',
                'Content-Type': 'application/json'
                },
            method: "POST",
            body: JSON.stringify({
                ID: clientID
            })
        })
        .then(res => res.text())
        .then(text => {
                let blob = new Blob([text], {type: "text/plain"});
                const date = new Date();
                const name = `Notes-${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;

                chrome.downloads.download({
                    url: URL.createObjectURL(blob),
                    filename: name+'.txt' 
                });
    
        })
        .catch(err => {
            console.log('Error in getting notes '+err);
            alert('Error in getting notes, please try again');
        })
}

