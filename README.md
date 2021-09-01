
![Logo](Assets/logo.jpg)


It is a chrome extension that summarizes the audio from a chrome tab into text with support for multiple languages and is primarily intended
to take notes during a live session/lecture.

This application was developed after my friends complained how difficult it is to take understand and take notes from a lecture at the same time



## Screenshots

<p float="left">
  <img src="Assets/SS-1.jpg" width="300" height="150"/>
  <img src="Assets/SS-2.jpg" width="300" height="150"/>
  <img src="Assets/SS-5.jpg" width="100" height="100"/>
</p>

<p float="left">
  <img src="Assets/SS-4.jpg" width="45%"/>
  <img src="Assets/SS-3.jpg" width="45%"/>
</p>

  
## API Reference

#### Register a client

```http
  POST /register
  Return: [text/plain] unique ID, used for further communication. 

```
| Parameter | Type     | Description                |
| :-------- | :------- | :------------------------- |
| `config` | `json` |  Configration of google speech to text api |

https://cloud.google.com/speech-to-text/docs/reference/rest/v1/RecognitionConfig

#### Get notes

```http
  POST /getNotes
  Return: [text/plain] Summarized text and transcription 
```

| Parameter | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `ID`      | `Integer` | **Required**. ID returned from /register api |

#### Send audio

```WS
  Websocket ws://${HOST}?ID=${clientID}&languageCode=${languageCode}
  Example: ws://LectureNotes:8080?ID=12&languageCode=hi-IN
  Note: Use native websockets
  
  Return: [text/plain] errors, if any
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
   npm start        //starts server 
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


<pre>
  <a href="https://deepai.org/api-docs/
  ">DEEPAI_KEY</a>

  <a href="https://cloud.google.com/speech-to-text/docs/before-you-begin 
  ">GOOGLE_APPLICATION_CREDENTIALS</a>
</pre>



    


  
## Acknowledgements

 - [Google speech to text](https://cloud.google.com/speech-to-text/?utm_source=google&utm_medium=cpc&utm_campaign=japac-IN-all-en-dr-bkws-all-super-trial-e-dr-1009882&utm_content=text-ad-none-none-DEV_c-CRE_506995057599-ADGP_Hybrid%20%7C%20BKWS%20-%20EXA%20%7C%20Txt%20~%20AI%20%26%20ML%20~%20Speech-to-Text_Speech%20-%20google%20speech%20to%20text-KWID_43700030970546716-kwd-21425535976&userloc_9301226-network_g&utm_term=KW_google%20speech%20to%20text&gclsrc=aw.ds&ds_rl=1264446&gclid=Cj0KCQjwpreJBhDvARIsAF1_BU1UJI_d8euTVe-u9n9vbAiTGWjDwau8Y9x7bmrNI-mxsxFPVEAfMmEaArEbEALw_wcB)
 - [DeepAI text summarizer](https://deepai.org/machine-learning-model/summarization)
 

  
## Feedback

If you have any feedback, please reach out to me at https://www.linkedin.com/in/smitdesai1010/
  