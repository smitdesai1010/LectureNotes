
![Logo](logo.jpg)


It is a chrome extension that summarizes the audio from a chrome tab into text with support for multiple languages and is primarily intended
to take notes during a live session/lecture.

This application was developed after my friends complained how difficult it is to take understand and take notes from a lecture at the same time



## Screenshots

![App Screenshot](https://via.placeholder.com/468x300?text=App+Screenshot+Here)

  
## API Reference

#### Register a client

```http
  POST /register
  Returns a unique ID, which is used when sending audio. 

```
| Parameter | Type     | Description                |
| :-------- | :------- | :------------------------- |
| `config` | `json` |  Configration of google speech to text api |

https://cloud.google.com/speech-to-text/docs/reference/rest/v1/RecognitionConfig

#### Get notes

```http
  POST /getNotes
  Returns the summarized text and transcription as text
```

| Parameter | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `ID`      | `Integer` | **Required**. ID returned from /register api |

#### Send audio

```WS
  Websocket ws://${HOST}?ID=${clientID}&languageCode=${languageCode}
  Example: ws://LectureNotes:8080?ID=12&languageCode=hi-IN
  Note: Use native websockets
  
  Only errors will be sent from server via Websocket
```

| QueryString Parameter | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `ID`      | `Integer` | **Required**. ID returned from /register api |


| QueryString Parameter | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `language`      | `String` | Language code; Defaults to en-US

| Websocket message | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| | `base64 string` | base64 encoded string of audio; must not exceed 10MB/15 secs

  
## Run Locally

Clone the project

```bash
  git clone https://github.com/smitdesai1010/LectureNotes.git
```

To start server, go to the project directory    
Pre-requirements:  node and npm
```bash 
   cd Server
   npm install      //Install dependencies
   node server.js   //starts server on port 8080
```

To start client (chrome-extension)
```
    Open Google chrome
    Click on "extension" > "Manage extensions"
    Click on "Load unpacked" and select the ./client/ folder in the project directory
    Click on extensions and allow "LectureNotes"
```

  
## Environment Variables

To run this project, you will need to add the following environment variables to your /Server/.env file

`DEEPAI_KEY`    
https://deepai.org/api-docs/

`GOOGLE_APPLICATION_CREDENTIALS`    
https://cloud.google.com/speech-to-text/docs/before-you-begin 

  
## Acknowledgements

 - [Google speech to text](https://cloud.google.com/speech-to-text/?utm_source=google&utm_medium=cpc&utm_campaign=japac-IN-all-en-dr-bkws-all-super-trial-e-dr-1009882&utm_content=text-ad-none-none-DEV_c-CRE_506995057599-ADGP_Hybrid%20%7C%20BKWS%20-%20EXA%20%7C%20Txt%20~%20AI%20%26%20ML%20~%20Speech-to-Text_Speech%20-%20google%20speech%20to%20text-KWID_43700030970546716-kwd-21425535976&userloc_9301226-network_g&utm_term=KW_google%20speech%20to%20text&gclsrc=aw.ds&ds_rl=1264446&gclid=Cj0KCQjwpreJBhDvARIsAF1_BU1UJI_d8euTVe-u9n9vbAiTGWjDwau8Y9x7bmrNI-mxsxFPVEAfMmEaArEbEALw_wcB)
 - [DeepAI text summarizer](https://deepai.org/machine-learning-model/summarization)
 

  
## Feedback

If you have any feedback, please reach out to me at https://www.linkedin.com/in/smitdesai1010/
  