// - Happy path (the program returns a correct value)
const axios = require('axios');
const { calculateValue, requestExchangeRate, displayResult } = require("../getTotalValue");
require("dotenv").config();

describe("Get values of coins from CoinAPI", () => {
  let API_KEY;

  beforeEach(() => {
    API_KEY = process.env.COIN_API_KEY;
  });

  test("Should return correct value", async () => {
    const { data : { rate: correctExchangeRate } } = await axios.get(`https://rest.coinapi.io/v1/exchangerate/BTC/USD`, { headers: {
      'X-CoinAPI-Key': API_KEY,
    }});

    const exchangeRate = await getExchangeRate('BTC');

    expect(exchangeRate).toBe(correctExchangeRate);
  });

  test.only("Logs an error when incorrect data is passed", async () => {
    let correctError;
    try {
      const response = await axios.get(`https://rest.coinapi.io/v1/exchangerate/AAAA/USD`, { headers: {
        'X-CoinAPI-Key': API_KEY,
      }});      
    } catch (err) {
      correctError = err;
    }

    const response = await requestExchangeRate('AAAA');


    expect(response.status).toBe(550);
    expect(response.data).toEqual({ "error": "You requested specific single item that we don't have at this moment." })
  });
  /* STATUS 550.
    {
        "error": "You requested specific single item that we don't have at this moment."
    }
  */
});