const express = require('express');
const { rateLimiter } = require('./src/middlewares/ratelimiter.middlewar');
require('dotenv').config();


const app = express();
app.use(express.json());

app.use(rateLimiter);

app.get('/api/test', (request, response) => {

  response.json({ hi: "hello world" });
})

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`)
})