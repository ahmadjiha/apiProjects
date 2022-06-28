const express = require('express');
const routes = require("./routes/api");
require('dotenv').config();

const app = express();
app.use(express.json());

app.use("/api", routes);

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`Now listening on port: ${PORT}`);
});