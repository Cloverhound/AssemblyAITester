require('dotenv').config()

const WebSocket = require('ws');
const fs = require('fs');

function test() {  

  let wordBoost = [
    "Welcome to Cisco technical support",
    " To report a network or environment",
    "down emergency",
    "press 1",
    " If you have an existing service",
    "request",
    "press 2",
    "For all other technical support","press 3"
  ];
  let wordBoostParam = encodeURIComponent(JSON.stringify(wordBoost));
  
  let url = `wss://api.assemblyai.com/v2/realtime/ws?sample_rate=8000&filter_profanity=true&word_boost=${wordBoostParam}&boost_param=high`;
  let socket = new WebSocket(url, {
    headers: {
      Authorization: process.env.ASSEMBLY_AI_AUTH_HEADER
    }
  });

  socket.onmessage = async (message) => {
    const res = JSON.parse(message.data.toString());
    console.log("AssemblyAI received socket message:", res);

    switch (res.message_type) {
      case 'SessionBegins':

        let data = fs.readFileSync('./7896c43a-d95a-a461-747b-8f0096828767.raw');
        // loop through data sending 2000 bytes at a time
        for (let i = 0; i < data.length; i += 2000) {
          let chunk = data.slice(i, i + 2000)
          if (chunk.length < 2000) {
            continue;
          }
          let audioData = chunk.toString('base64');
          //console.log("Sending chunk:", audioData);
          socket.send(JSON.stringify({ audio_data: audioData }));
          await new Promise(resolve => setTimeout(resolve, 50));
        }

        socket.send(JSON.stringify({terminate_session: true}));
    }
  };

  socket.onerror = (event) => {
    console.error(event);
  }
  
  socket.onclose = event => {
    console.log(`Got socket close event type=${event.type} code=${event.code} reason='${event.reason}' wasClean=${event.wasClean}`);
  }

  socket.onopen = () => {
    this.state = 'started';
    console.log("AssemblyAI socket open");

  };

}

test();