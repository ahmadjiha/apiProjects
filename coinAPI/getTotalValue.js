const axios = require('axios');
require("dotenv").config();

const API_KEY = process.env.COIN_API_KEY;

const assetIdBase = process.argv[2];
const quantity = process.argv[3];

const calculateValue = (rate, quantity) => {
  return rate * Number(quantity);
}

const requestExchangeRate = async (assetIdBase) => {
  try {
    const response = await axios.get(`https://rest.coinapi.io/v1/exchangerate/${assetIdBase}/USD`, { headers: {
      'X-CoinAPI-Key': API_KEY,
    }});
    return response;
  } catch (err) {
    return err.response
  }
}

const displayResult = async () => {
    const exchangeRateResponse = await requestExchangeRate(assetIdBase);

    if (exchangeRateResponse.status === 200) {
      const exchangeRate = exchangeRateResponse.data.rate;
      const totalValue = calculateValue(exchangeRate, quantity);
      console.log(totalValue);
    } else {
      console.log("Error:", exchangeRateResponse.data)
    }

}

if (assetIdBase && quantity) {
  displayResult();
}

exports.calculateValue = calculateValue;
exports.requestExchangeRate = requestExchangeRate;
exports.displayResult = displayResult;