const HOST = 'ws://localhost:3000';
let socket = null;
let currRecodingTabID = null;
let currTabRecordingStatus = false;
let mediastream = null;
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


        currTabRecordingStatus = true;
        startRecording(request);   
        response({}); //success - empty object
    }

    else if (request.event === 'stop') {
        mediaStream.getTracks().forEach(track => track.stop());
        mediaStream = null;
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


async function startRecording(data) {

    if (currRecodingTabID === data.Id) {
        return;             //already recording, dont do anything
    }

    checkConstraints(data);

    mediaStream = await new Promise( (resolve, reject) => {
        chrome.tabCapture.capture({audio: true}, stream => resolve(stream))
    })

    audio.srcObject = mediaStream;
    audio.play();
}


function checkConstraints(data) {

    if (socket === null) {}
        //socket = io(HOST);  

    if (currRecodingTabID === null)    
        currRecodingTabID = data.Id; 
}


//https://stackoverflow.com/questions/4845215/making-a-chrome-extension-download-a-file
