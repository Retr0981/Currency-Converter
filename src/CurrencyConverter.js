// src/Components/CurrencyConverter.js

import React, { useState } from 'react';
import axios from 'axios';
import { majorCurrencies, otherCurrencies, cryptocurrencies } from './currencyData';

// Combine all currencies and cryptocurrencies
const allCurrencies = {
  ...majorCurrencies,
  ...otherCurrencies,
  ...cryptocurrencies,
};

// Define currency categories
const currencyCategories = {
  major: 'Major Currencies',
  other: 'Other Currencies',
  crypto: 'Cryptocurrencies',
};

function CurrencyConverter() {
  const [fromCurrency, setFromCurrency] = useState('USD');
  const [toCurrency, setToCurrency] = useState('EUR');
  const [amount, setAmount] = useState(1);
  const [convertedAmount, setConvertedAmount] = useState(null);
  const [error, setError] = useState(null);

  const handleConversion = async () => {
    setError(null);
    try {
      let intermediateAmount = amount;

      // Step 1: Convert fromCurrency to USD if needed
      if (fromCurrency !== 'USD' && !cryptocurrencies[fromCurrency.toLowerCase()]) {
        // Convert fromCurrency to USD
        const responseFromCurrencyToUSD = await axios.get(
          `https://api.exchangerate-api.com/v4/latest/${fromCurrency}`
        );
        const rateFromCurrencyToUSD = responseFromCurrencyToUSD.data.rates['USD'];
        if (rateFromCurrencyToUSD === undefined) {
          throw new Error(`Unable to convert ${fromCurrency} to USD`);
        }
        intermediateAmount = amount / rateFromCurrencyToUSD;
      }

      // Step 2: Convert USD to toCurrency if needed
      if (cryptocurrencies[toCurrency.toLowerCase()]) {
        // Convert USD to cryptocurrency
        const responseUSDToCrypto = await axios.get(
          `https://api.coingecko.com/api/v3/simple/price`,
          {
            params: {
              ids: toCurrency.toLowerCase(),
              vs_currencies: 'usd',
            },
          }
        );
        const cryptoRate = responseUSDToCrypto.data[toCurrency.toLowerCase()]?.usd;
        if (cryptoRate === undefined) {
          throw new Error(`Unable to get rate for ${toCurrency}`);
        }
        setConvertedAmount(intermediateAmount * cryptoRate);
      } else {
        // Convert USD to target fiat currency
        const responseToCurrencyRate = await axios.get(
          `https://api.exchangerate-api.com/v4/latest/${fromCurrency === 'USD' ? 'USD' : 'USD'}`
        );
        const rateToCurrency = responseToCurrencyRate.data.rates[toCurrency];
        if (rateToCurrency === undefined) {
          throw new Error(`Unable to convert to ${toCurrency}`);
        }
        setConvertedAmount(intermediateAmount * rateToCurrency);
      }
    } catch (err) {
      setError(err.message || 'Conversion failed. Please try again.');
    }
  };

  // Categorize currencies for display
  const categorizeCurrencies = (currency) => {
    if (majorCurrencies[currency]) return currencyCategories.major;
    if (otherCurrencies[currency]) return currencyCategories.other;
    if (cryptocurrencies[currency]) return currencyCategories.crypto;
    return 'Unknown';
  };

  // Group currencies by category
  const groupCurrencies = (currencies) => {
    const grouped = {
      [currencyCategories.major]: [],
      [currencyCategories.other]: [],
      [currencyCategories.crypto]: [],
    };

    Object.keys(currencies).forEach((currency) => {
      const category = categorizeCurrencies(currency);
      grouped[category].push(currency);
    });

    return grouped;
  };

  const groupedFromCurrencies = groupCurrencies(allCurrencies);
  const groupedToCurrencies = groupCurrencies(allCurrencies);

  return (
    <div className="p-6 max-w-lg mx-auto bg-white rounded-lg shadow-lg">
      <h1 className="text-3xl font-bold mb-6 text-center text-blue-700">Currency Converter</h1>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Amount</label>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="p-3 border border-gray-300 rounded-lg w-full"
          min="0"
        />
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">From Currency</label>
        <select
          value={fromCurrency}
          onChange={(e) => setFromCurrency(e.target.value)}
          className="p-3 border border-gray-300 rounded-lg w-full"
        >
          {Object.keys(groupedFromCurrencies).map((category) => (
            <React.Fragment key={category}>
              <option disabled className="font-semibold text-blue-800 bg-blue-100">{category}</option>
              {groupedFromCurrencies[category].map((currency) => (
                <option key={currency} value={currency}>
                  {allCurrencies[currency].name} ({currency.toUpperCase()})
                </option>
              ))}
            </React.Fragment>
          ))}
        </select>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">To Currency</label>
        <select
          value={toCurrency}
          onChange={(e) => setToCurrency(e.target.value)}
          className="p-3 border border-gray-300 rounded-lg w-full"
        >
          {Object.keys(groupedToCurrencies).map((category) => (
            <React.Fragment key={category}>
              <option disabled className="font-semibold text-blue-800 bg-blue-100">{category}</option>
              {groupedToCurrencies[category].map((currency) => (
                <option key={currency} value={currency}>
                  {allCurrencies[currency].name} ({currency.toUpperCase()})
                </option>
              ))}
            </React.Fragment>
          ))}
        </select>
      </div>

      <button
        onClick={handleConversion}
        className="p-3 bg-blue-600 text-white rounded-lg w-full text-lg font-semibold"
      >
        Convert
      </button>

      {convertedAmount !== null && (
        <p className="mt-6 text-lg text-center">
          {amount} {fromCurrency.toUpperCase()} = {convertedAmount.toFixed(2)} {toCurrency.toUpperCase()}
        </p>
      )}

      {error && <p className="mt-6 text-red-600 text-center">{error}</p>}

  
<footer className="mt-8 text-center transition-all duration-300 hover:bg-blue-100 hover:rounded-lg">
  <p className="text-gray-600 transition-colors duration-300 hover:text-blue-600">
    Built with <span className="text-red-500 transition-colors duration-300 hover:text-blue-600">❤️</span> by 
    <a 
      href="https://davidarmah.vercel.app/" 
      target="_blank" 
      rel="noopener noreferrer" 
      className="text-blue-600 hover:text-blue-800 hover:underline ml-1"
    >
      David Nii Armah
    </a>
  </p>
</footer>

    </div>
  );
}

export default CurrencyConverter;
