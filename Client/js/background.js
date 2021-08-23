const uniqueID = Date.now()%10000+(Math.random()*1000).toPrecision(3);
const HOST = 'ws://localhost:8080?ID='+uniqueID;
let socket = null;
let currRecodingTabID = null;
let currTabRecordingStatus = false;
let rec = null;
let intervalID = null;
let mediaStream = null;
let audio = new Audio(); //tabCapture stops the audio to the user, so playing the audio is not      
                         //via js audio object using the same stream   


//ToDO : stop recording when a tab closes without clicking on stop record
// alert user if the server is down
chrome.runtime.onMessage.addListener( async (request, sender, response) => {

    if (request.event == 'getRecordingStatus') {

        if (currRecodingTabID != null && currRecodingTabID != request.Id)   //other tab is recording
            response({recordingStatus : false})

        response({recordingStatus : currTabRecordingStatus});
    }

    else if (request.event === 'startRecording') {

        if (request.Id == undefined) {
            alert('INVALID URL');
            response({error : 'Invalid URL'});
            return true;
        }    
          
        else if (currRecodingTabID !== null && currRecodingTabID !== request.Id) {
            alert('Recording from multiple tabs at once not allowed')
            response({error : 'Recording from multiple tabs at once not allowed'})
            return true;
        }
        
        else if (currRecodingTabID === request.Id) {  //already recording, dont do anything
            alert('Already recording from this tab');
            response({error : 'Already recording from this tab'})
            return true;             
        }

        else if (currRecodingTabID === null)    
            currRecodingTabID = request.Id; 
        
        currTabRecordingStatus = true;

        startRecording();   
        response({}); //success - empty object
    }

    else if (request.event === 'stopRecording') { 
        stopRecording();
        response({}); //success - empty object
    }

    else if (request.event === 'getNotes') {
        //check if socket is connected or not
        if (socket == null) {
            alert('Recording not started');
            reponse({error : 'Recording not started'});
            return;
        }

        //stop Recording
        if (currRecodingTabID !== null)
            chrome.tabs.sendMessage(currRecodingTabID, {event: "stopRecording"}, ()=>{} );

        // socket.emit('getNotes', '');
        
        // socket.on('notes', data => {
            
        //     data = JSON.parse(data);

        //     if ("error" in data) {
        //         alert(data.error);
        //         reponse({error : data.error});
        //     }

        //     else {
        //         let blob = new Blob([data], {type: "text/plain"});
        //         const date = new Date();
        //         const name = `Notes-${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
    
        //         chrome.downloads.download({
        //             url: URL.createObjectURL(blob),
        //             filename: name+'.txt' 
        //         });
    
        //         response({}); //success - empty object                
        //     }

        // })
    }
    
    return true; //making responses asynchronous
})


async function startRecording() {

    if (socket === null) {
         socket = new WebSocket(HOST); 
         
         await new Promise((resolve, reject) => {                 
            socket.onopen = () => {
                console.log('Socket connected');
                resolve();  
            }})
    }

    mediaStream = await new Promise((resolve, reject) => {
        chrome.tabCapture.capture({audio: true}, stream => {
            resolve(stream);
        });
    })

    if (mediaStream == null) {
        alert('Unable to capture audio. Please try again !!');
        return;
    }

    //-------------------------------------------------
    const audioContext = new window.AudioContext();
    const ctxInput = audioContext.createMediaStreamSource(mediaStream);
    rec = new Recorder(ctxInput, { numChannels:1 });
    rec.record();
    
    intervalID = setInterval(() => {          //send a base64 encoded audioByte data every 3 secs 
        rec.exportWAV( blob => {

            let reader = new FileReader();
            reader.readAsDataURL(blob); 

            reader.onloadend = () => {
                const str = reader.result.substr(reader.result.indexOf(',')+1);
                socket.send(str);          
            }
        })
    },3000)


    //---------------------------------------------------------------------------
    console.log('SampleRate: '+audioContext.sampleRate);    

    socket.onmessage = (message) => {
        console.log('received: %s', message)
    };

    audio.srcObject = mediaStream;  //chrome tab capture stops audio, so playing it via a background object
    audio.play();
}


function stopRecording() {
    
    if (mediaStream != null) {  //since mediaStream is setuped asychromously, this maybe null if the user suddenly clicks on stop recording   
        mediaStream.getTracks().forEach(track => track.stop());
        mediaStream = null;
    }

    if (rec != null) {
        rec.stop();
        rec = null;
    }
    //send the last buffered audio

    clearInterval(intervalID);
    currRecodingTabID = null;
    currTabRecordingStatus = false;
    audio.pause();
}

//https://stackoverflow.com/questions/50976084/how-do-i-stream-live-audio-from-the-browser-to-google-cloud-speech-via-socket-io
//https://www.py4u.net/discuss/347448
//https://stackoverflow.com/questions/51368252/setting-blob-mime-type-to-wav-still-results-in-webm


//https://stackoverflow.com/questions/4845215/making-a-chrome-extension-download-a-file
//https://stackoverflow.com/questions/57044074/with-google-cloud-speech-to-text-and-the-node-js-sdk-how-can-i-read-the-value-o


