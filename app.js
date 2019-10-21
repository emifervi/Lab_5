const express = require('express');
const request = require('request');

const app = express()

const port = process.env.PORT || 3000

var MAPBOX_TOKEN, DARK_SKY_SECRET_KEY;

if(process.env.NODE_ENV = 'production'){
  MAPBOX_TOKEN = process.env.MAPBOX_APIKEY,
  DARK_SKY_SECRET_KEY = process.env.DARKSKY_APIKEY;
} else {
  MAPBOX_TOKEN = require('./credentials').MAPBOX_TOKEN;
  DARK_SKY_SECRET_KEY = require('./credentials').DARK_SKY_SECRET_KEY;
}

app.get('/weather', function(req, res) {
  const mapUrl = `https://api.mapbox.com/geocoding/v5/mapbox.places/${req.query.search}.json?access_token=${MAPBOX_TOKEN}`

  request.get({url:mapUrl, json:true}, (error, response, body) => {
    if(error) {
      res.send("Ocurrió un error");
      console.log(error);
    }
    const location = body.features[0];
    const long = location.center[0];
    const lat = location.center[1];

    const weatherUrl = `https://api.darksky.net/forecast/${DARK_SKY_SECRET_KEY}/${lat},${long}?lang=es&units=si`

    request({url:weatherUrl, json:true}, (error, response, body) => {
      if(error) {
        res.send("Ocurrió un error");
        return console.log(error)
      }
      const temp = body.currently.temperature;
      const sumary = body.currently.summary;
      const precipProb = body.currently.precipProbability;
      const message = sumary + ". Actualmente esta a " + temp + "°C" + ". Hay " + precipProb * 100 + "% de posibilidad de lluvia."

      res.status(200).json(
        {
          "Ciudad": req.query.search,
          "°C": temp,
          "Probabilidad de lluvia": precipProb,
          "Mensaje": message
        });
    });
  });
});

app.get('*', function(req, res) {
  res.send('La ruta especificada no es válida');
});

app.listen(port, function() {
  console.log('up and running');
});