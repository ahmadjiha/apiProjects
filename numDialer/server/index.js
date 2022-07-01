const axios = require('axios');
const express = require('express');
const cors = require('cors');
const { createSession } = require('better-sse');

const app = express();
app.use(cors());
app.use(express.json());

const API_URL = 'http://localhost:4830/call';
const NUM_PARALLEL_CALLS = 3;
const PHONE_NUMBERS = [
  "13018040009",
  "19842068287",
  "15512459377",
  "19362072765",
  "18582210308",
  "13018040009",
  "19842068287",
  "15512459377",
  "19362072765",
];
let phoneCallsStatus = {};
let sseSession;

const makePhoneCall = async (phone, index) => {
  const { data: { id } } = await axios.post(API_URL, {
    phone,
    webhookURL: 'http://localhost:5001/api/webhookURL',
  });

  phoneCallsStatus[id] = {
    number: phone, 
    status: 'idle',
    phoneNumberIndex: index,
  };
}

let initiateCallsFunctions;

const createPhoneCallFunctions = () => {
  initiateCallsFunctions = PHONE_NUMBERS.map((number, index) => {
    return async () => {
      makePhoneCall(number, index)
    }
  }) 
}

const invokeNextPhoneCall = () => {
  const nextPhoneCall = initiateCallsFunctions.shift();
  if (nextPhoneCall) {
    nextPhoneCall();
  }
}

// Receive POST requests on the WebhookURL to update status of specific call 
app.post('/api/webhookURL', (request, response) => {
  const { id, status } = request.body;

  if (phoneCallsStatus[id].status !== 'completed') {
    phoneCallsStatus[id].status = status;
    sseSession.push(phoneCallsStatus[id]);
  }

  if (status === 'completed') {
    invokeNextPhoneCall();
  }

  response.status(200).end();
})

app.get('/api/numbers', (request, response) => {
  createPhoneCallFunctions();
  phoneCallsStatus = {};
  queue = []

  response.json({ numbers: PHONE_NUMBERS })
});

app.get("/sse", async (req, res) => {
	sseSession = await createSession(req, res);
});

// ----------------- Front-End Endpoints -----------------
app.post('/api/calls', (request, response) => {
  for (let i = 0; i < NUM_PARALLEL_CALLS; i++) {
    invokeNextPhoneCall();
  }

  response.status(200).end();
})

const PORT = 5001;
app.listen(PORT, () => {
  console.log(`Listening on port: ${PORT}`)
})