let isRecording = false;

document.getElementById("microphone")
    .addEventListener('click', () => {
        document.getElementById("mic-icon").className = 
                isRecording ? "fa fa-microphone-slash fa-2x" : "fa fa-microphone fa-2x";

        isRecording = !isRecording;
    })    


document.getElementById("contact")
    .addEventListener('click', () => {
        let profile = document.getElementById("profile")
        profile.style.display = profile.style.display == "none" ? "block" : "none";    
    })

