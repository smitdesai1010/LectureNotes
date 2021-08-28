let currId = null;
let isRecording = false;
let currLanguageCode = "en-US";

//----------------------------Get curr tab ID and recording status----------------------------

// isRecording keeps an internal track of the recording status
// It is initialized to the value from the background
// Reason for this is that content script stops when the extension window is closed
// Hence prior information about recordingStatus is lost

chrome.tabs.query({active: false, currentWindow: true}, (tabs) => {
    currId = tabs[0].id

    chrome.runtime.sendMessage({event : 'getRecordingStatus', tabId: currId}, (res) => {
        document.getElementById("mic-icon").className = res.recordingStatus ? "fa fa-microphone fa-2x" : "fa fa-microphone-slash fa-2x";
        isRecording = res.recordingStatus;
    });
})
//------------------------------------------------------------------


//--------------------------Language dropdown------------------------
let dropdown = document.getElementById("selectLanguage");
let languages = {
    "English (US)"      : "en-US",
    "French (Canada)"   : "fr-CA",
    "Hindi"             : "hi-IN",
    "English (India)"   : "en-IN",
    "Gujarati"          : "gu-IN",
    "German"            : "de-DE",
};

for (let key in languages) {
    let value = languages[key];
    let el = document.createElement("option");
    el.textContent = key;
    el.value = value;
    dropdown.appendChild(el);
}

document.getElementById("selectLanguage")
    .addEventListener('change', (ele) => {
        if (isRecording) {
            alert("Cannot change language while recording")
            ele.target.options.selectedIndex = Object.values(languages).indexOf(currLanguageCode);
        }

        else {
            currLanguageCode = ele.target.value;
        }
})
//------------------------------------------------------------------

document.getElementById("microphone")
    .addEventListener('click', () => {

    if (currId == null) {
        alert('INVALID URL');
        return;
    }

    const obj = {
        event: isRecording ? 'stopRecording' : 'startRecording',
        tabId: currId,
        languageCode: currLanguageCode
    }

    chrome.runtime.sendMessage(obj, (response) => {
        if (!("error" in response)) {
            document.getElementById("mic-icon").className = 
                isRecording ? "fa fa-microphone-slash fa-2x" : "fa fa-microphone fa-2x";
           
            isRecording = !isRecording;
        }

        else
            console.log('ERROR: '+response.error);
    });
})    

document.getElementById("getNotes")
    .addEventListener('click', async () => {

        isRecording = false;
        document.getElementById("mic-icon").className = "fa fa-microphone-slash fa-2x";
        
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

