const express = require('express');
const axios = require('axios');
const rateLimit = require('express-rate-limit');
const slowDown = require('express-slow-down');

// 10 request per 30 seconds
const limiter = rateLimit({
  windowMs: 30 * 1000,
  max: 10,
});

// Within 30 seconds each request slows down from the same ip address - increase 500 milliseconds send per request 
const speedLimiter = slowDown({
  windowMs: 30 * 1000,
  delayAfter: 1,
  delayMs: 500,
});

const router = express.Router();

const BASE_URL = 'https://api.nasa.gov/insight_weather/?';

let cachedData;
let cacheTime;

router.get('/', limiter, speedLimiter, async (req, res, next) => {
  // in memory cache
  if (cacheTime && cacheTime > Date.now() - 30 * 1000) {
    // BTW - set a cache header so browsers work WITH you.
    // WOW awesome stuff I learned at least 2 new things today @CodingGarden - what is you opinion on using manual cache instead of 'Cache-Control' ie res set('Cache-Control', 'public, max-age=300, s-maxage=600')
    return res.json(cachedData);
  }
  try {
    const params = new URLSearchParams({
      api_key: process.env.NASA_API_KEY,
      feedtype: 'json',
      ver: '1.0',
    });

    // 1. make a request to nasa api
    const { data } = await axios.get(`${BASE_URL}${params}`);

    // 2. respond to this request with data from nasa api
    cachedData = data;
    cacheTime = Date.now();
    data.cacheTime = cacheTime;
    return res.json(data);
  } catch (error) {
    return next(error);
  }
});

module.exports = router;


/*
My Own API key -> anyone requesting to this API is using API key-> 070707, if there is not "Invalid API KEY"

In POSTMAN -> "Content-Type - application/json" and "X-API-Key - 070707" then it will respond

const apiKeys = new Map();
apiKeys.set('070707', true);

router.get('/', limiter, speedLimiter, (req, res, next) => {
  const apiKey = req.get('X-API-KEY');
  if (apiKeys.has(apiKey)) {
    next();
  } else {
    const error = new Error('Invalid API KEY');
    next(error);
  }
}, async (req, res, next) => {
  // in memory cache
  if (cacheTime && cacheTime > Date.now() - 30 * 1000) {
    // BTW - set a cache header so browsers work WITH you.
    // WOW awesome stuff I learned at least 2 new things today @CodingGarden - what is you opinion on using manual cache instead of 'Cache-Control' ie res set('Cache-Control', 'public, max-age=300, s-maxage=600') 
    return res.json(cachedData);
  }
  try {
    const params = new URLSearchParams({
      api_key: process.env.NASA_API_KEY,
      feedtype: 'json',
      ver: '1.0'
    });
    // 1. make a request to nasa api
    const { data } = await axios.get(`${BASE_URL}${params}`);
    // 2. respond to this request with data from nasa api
    cachedData = data;
    cacheTime = Date.now();
    data.cacheTime = cacheTime;
    return res.json(data);
  } catch (error) {
    return next(error);
  }
});

module.exports = router;

*/