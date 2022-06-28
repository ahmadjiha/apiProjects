const axios = require('axios');

const processBreeds = (breedsObject) => {
  const breeds = Object.keys(breedsObject);

  return breeds.map(breed => {
    if (breedsObject[breed].length > 0) {
      return breedsObject[breed].map(subBreed => {
        return `${subBreed} ${breed}`;
      })
    } else {
      return breed;
    }
  }).flat();
}

const getAllBreeds = async () => {
  const response = await axios.get('https://dog.ceo/api/breeds/list/all');
  return response;
}

exports.processBreeds = processBreeds;
exports.getAllBreeds = getAllBreeds;