/*
You also need to use Jest to test the happy path where the data is successfully sent, with status code 200.
Test the case when the external API responds with an error. We need to send error with the status code 500.
*/

// for each function you should have a different file

const axios = require('axios');
const getAllBreeds = require('../utils/helpers').getAllBreeds;

jest.mock('axios');

describe("getAllBreeds", () => {
  beforeEach(() => {
    const response = {  data: {
      message: {
        akita: [],
        buhund: ['norwegian'],
        bulldog: ['boston', 'english', 'french'],
        bullterrier: ['staffordshire'],
      }
    }}
    axios.get.mockResolvedValue(response);
  })

  test("correctly responds with all the breeds", async () => {
    const response = await getAllBreeds();
    const correctBreedsData = {
      akita: [],
      buhund: ['norwegian'],
      bulldog: ['boston', 'english', 'french'],
      bullterrier: ['staffordshire'],
    };

    expect(response.data.message).toEqual(correctBreedsData);
  })
});