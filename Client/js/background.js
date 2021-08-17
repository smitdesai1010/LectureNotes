const HOST = 'ws://localhost:3000';
let socket = null;
let currRecodingTabID = null;
let currTabRecordingStatus = false;
let mediaStream = null;
let mediaRecorder = null;
let audio = new Audio(); //tabCapture stops the audio to the user, so playing the audio is not      
                         //via js Object using the same stream   


//ToDO : stop recording when a tab closes without clicking on stop record
// alert user if the server is down
chrome.runtime.onMessage.addListener( async (request, sender, response) => {

    if (request.event == 'getRecordingStatus') {

        if (currRecodingTabID != null && currRecodingTabID != request.Id)   //other tab is recording
            response({recordingStatus : false})

        response({recordingStatus : currTabRecordingStatus});
    }

    else if (request.event === 'start') {

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

    else if (request.event === 'stop') {
        
        stopRecording();
        response({}); //success - empty object
    }

    else if (request.event === 'getNotes') {
        
        // //check if socket is connected or not
        if (socket == null) {
            alert('Recording not started');
            reponse({error : 'Recording not started'});
            return;
        }

        // //stop Recording
        if (currRecodingTabID !== null)
            chrome.tabs.sendMessage(currRecodingTabID, {event: "stopRecording"}, ()=>{} );

        socket.emit('getNotes', '');
        
        socket.on('notes', data => {
            
            data = JSON.parse(data);

            if ("error" in data) {
                alert(data.error);
                reponse({error : data.error});
            }

            else {
                let blob = new Blob([data], {type: "text/plain"});
                const date = new Date();
                const name = `Notes-${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
    
                chrome.downloads.download({
                    url: URL.createObjectURL(blob),
                    filename: name+'.txt' 
                });
    
                response({}); //success - empty object                
            }

        })
    }
    
    return true; //making responses asynchronous
})


async function startRecording() {

    if (socket === null) {
         socket = io(HOST); //Note: if cannot connect, it will keep polling and throwing errors, but wont stop the execution of script
         await new Promise( (resolve, reject) => {  
                socket.on('connect', () => {
                console.log('Socket connected: '+socket.id);
                resolve();
            })
         }) 
    }
    
    mediaStream = await new Promise( (resolve, reject) => {
        chrome.tabCapture.capture({audio: true}, stream => {
            resolve(stream);
        });
    })

    if (mediaStream == null)
    {
        alert('Unable to capture audio. Please try again !!');
        return;
    }

    mediaRecorder = new MediaRecorder(mediaStream, {mimeType: "audio/wav"});
    mediaRecorder.start(5000);      //time stamp of 5 sec

    mediaRecorder.ondataavailable = (audioData) => {
        socket.emit('audioData', audioData.data);
    }

    audio.srcObject = mediaStream;  //chrome tab capture stops audio, so playing it via a background object
    audio.play();
}


function stopRecording() {
    
    if (mediaStream != null)    //since mediaStream is setuped asychromously, this maybe null if the user suddenly clicks on stop recording
        mediaStream.getTracks().forEach(track => track.stop());

    mediaStream = null;
    mediaRecorder = null;
    currRecodingTabID = null;
    currTabRecordingStatus = false;
    audio.pause();
}

//https://stackoverflow.com/questions/4845215/making-a-chrome-extension-download-a-file
//https://stackoverflow.com/questions/57044074/with-google-cloud-speech-to-text-and-the-node-js-sdk-how-can-i-read-the-value-o


