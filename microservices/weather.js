import express from 'express';
import axios from 'axios';
import cors from 'cors';

const app = express();
const PORT_WEATHER = 3002;
const WEATHER_API_KEY = `${WEATHER_KEY}`;

/**
 * Middleware for cors
 */
app.use(cors());

/**
 * Route to return daily weather data
 */
app.get('/getDailyWeather', (req, res) => {
    console.log(req.query.loc);

    const requestParam = req.query.loc;
    const requestURl = `http://api.weatherapi.com/v1/current.json?key=${WEATHER_API_KEY}&q=${requestParam}&aqi=yes`

    axios.get(requestURl)
        .then(response => {
            console.log('api call successful');
            res.status(200).json(response.data);
        })
        .catch(error => {
            console.error('Error making API call:', error.message);
            res.status(500).json({ error: 'Internal Server Error' });
        });
});

/**
 * Route to return weather forcast for today and tomorrow based on location coordinates
 */
app.get('/getDailyForcast', (req, res) => {
    console.log('Rquest for forcast');
    console.log(req.query);

    const requestParam = req.query.loc;
    const requestURl = `http://api.weatherapi.com/v1/forecast.json?key=${WEATHER_API_KEY}&q=${requestParam}&days=2`

    axios.get(requestURl)
        .then(response => {
            console.log('api call successful');
            res.status(200).json(response.data);
        })
        .catch(error => {
            console.error('Error making API call:', error.message);
            res.status(500).json({ error: 'Internal Server Error' });
        });
});

/**
 * Route to return weather forcast based on users IP address
 */
app.get('/getDailyForcastByIp', (req, res) => {
    console.log('Rquest for forcast');
    console.log(req.query);
    const ipAddress = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    console.log(ipAddress);

    const requestURl = `http://api.weatherapi.com/v1/forecast.json?key=${WEATHER_API_KEY}&q=${ipAddress}&days=2`

    axios.get(requestURl)
        .then(response => {
            console.log('api call successful');
            res.status(200).json(response.data);
        })
        .catch(error => {
            console.error('Error making API call:', error.message);
            res.status(500).json({ error: 'Internal Server Error' });
        });
});

app.listen(PORT_WEATHER, () => console.log(`Node server listening on : http://127.0.0.1:${PORT_WEATHER}`));