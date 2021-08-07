HOST = 'ws://localhost:1337';

let webSocket = new WebSocket(HOST);

webSocket.onopen = () => console.log('Connected')

setInterval(() => {
    webSocket.send('Hello ')
}, 2000);

//how do websocket handle multiple connections