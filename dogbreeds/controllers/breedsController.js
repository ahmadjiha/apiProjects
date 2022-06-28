const axios = require('axios');
const helpers = require('../utils/helpers');

const allBreeds = async (request, response) => {
  try {
    const allBreeds = await helpers.getAllBreeds();
    response.json(helpers.processBreeds(allBreeds.data.message))
  } catch (err) {
    console.log(err);
    response.status(500).send("error: try again later");
  }
};


exports.allBreeds = allBreeds;