const HOST = 'ws://localhost:3000';
let socket = null;
let currRecodingTabID = null;
let currTabRecordingStatus = false;
let mediastream = null;
let mediaRecorder = null;
let audio = new Audio(); //tabCapture stops the audio to the user, so playing the audio is not      
                         //via js Object using the same stream   


//ToDO : stop recording when a tab closes without clicking on stop record
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
        
        if (mediaStream !== null)    //since mediaStream is setuped asychromously, this maybe null if the user suddenly clicks on stop recording
            mediaStream.getTracks().forEach(track => track.stop());
        
        mediaStream = null;
        mediaRecorder = null;
        currRecodingTabID = null;
        currTabRecordingStatus = false;
        audio.pause();

        response({}); //success - empty object
    }

    else if (request.event === 'getNotes')
    {
        getNotes();
        response({}); //success - empty object
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
         } ) 
    }
    
    mediaStream = await new Promise( (resolve, reject) => {
        chrome.tabCapture.capture({audio: true}, stream => {
            resolve(stream)
        });
    })

    mediaRecorder = new MediaRecorder(mediaStream);
    mediaRecorder.start(5000);      //time stamp of 5 sec

    mediaRecorder.ondataavailable = (data) => {
        socket.emit('audioData', JSON.stringify(data));
    }

    audio.srcObject = mediaStream;  //chrome tab capture stops audio, so playing it via a background object
    audio.play();
}


//https://stackoverflow.com/questions/4845215/making-a-chrome-extension-download-a-file
