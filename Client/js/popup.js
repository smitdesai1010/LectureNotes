// isRecording keeps an internal track of the recording status
// It is initialized to the value from the background
// Reason for this is that content script stops when the extension window is closed
// Hence prior information about recordingStatus is lost

let currId = await new Promise( (resolve, reject) => {         //get curr tab's URL
    chrome.tabs.query({active: false, currentWindow: true}, (tabs) => {
                        resolve(tabs[0].id)
    })
}) 

let isRecording = await new Promise((resolve, reject) => {
    chrome.runtime.sendMessage({event : 'getRecordingStatus', Id: currId}, (res) => {
        document.getElementById("mic-icon").className = res.recordingStatus ? "fa fa-microphone fa-2x" : "fa fa-microphone-slash fa-2x";
        resolve(res.recordingStatus)
    });
})

document.getElementById("microphone")
    .addEventListener('click', async () => {

        const obj = {
            event: isRecording ? 'stop' : 'start',
            Id: currId
        }

        chrome.runtime.sendMessage(obj, (response) => {
            if ( !("error" in response) )
            {
                document.getElementById("mic-icon").className = 
                    isRecording ? "fa fa-microphone-slash fa-2x" : "fa fa-microphone fa-2x";
               
                isRecording = !isRecording;
            }

            else
                console.log('ERROR: '+response.error);
        });
    })    


document.getElementById("getNotes")
    .addEventListener('click', () => {

        chrome.runtime.sendMessage({event : 'getNotes'}, (response) => {
            if ( "error" in response )
                console.log('ERROR: '+response.error);   
        });

    })


document.getElementById("contact")
    .addEventListener('click', () => {
        let profile = document.getElementById("profile")
        profile.style.display = profile.style.display == "none" ? "block" : "none";    
    })



chrome.runtime.onMessage.addListener( (request,sender,response) => {
    if (request.event == 'stopRecording')
    {
        isRecording = false;

        document.getElementById("mic-icon").className = 
                    isRecording ? "fa fa-microphone-slash fa-2x" : "fa fa-microphone fa-2x";
    }
})
