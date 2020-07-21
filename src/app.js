const express = require('express');
const morgan = require('morgan');
const helmet = require('helmet');

require('dotenv').config();

const middlewares = require('./middlewares');
const api = require('./api');

const app = express();

/*
NOTE:-

We are Trust the header of this proxy Beacause -> When your app is behind the proxy , proxy will sets header X-Forwarded-For (XFF) that is ip address of request of the client
 
If we don't put this its possible that we were rate limit localhost because its behind the proxy and then every single request rate limited instead of each individualip address */
app.set('trust proxy', 1);


app.use(morgan('dev'));
app.use(helmet());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({
    message: '🦄🌈✨👋🌎🌍🌏✨🌈🦄'
  });
});

app.use('/api/v1', api);

app.use(middlewares.notFound);
app.use(middlewares.errorHandler);

module.exports = app;
