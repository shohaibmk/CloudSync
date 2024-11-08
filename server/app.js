import express from 'express';
import path from 'path';

const __dirname = path.resolve();

const app = express();
const PORT_SERVER = 3000;

/**
 * Middleware to serve the css/js files
 */
app.use('/checkout/css', express.static(__dirname + '/client/css/checkout.css'));
app.use('/settings/css', express.static(__dirname + '/client/css/settings.css'));
app.use('/checkout/js', express.static(__dirname + '/client/script/checkout.js'));
app.use('/home/js', express.static(__dirname + '/client/script/home.js'));
app.use('/login/js', express.static(__dirname + '/client/script/login.js'));
app.use('/signup/js', express.static(__dirname + '/client/script/signup.js'));
app.use('/settings/js', express.static(__dirname + '/client/script/settings.js'));

/**
 * Return favicon.ico
 */
app.get('/favicon.ico', (req, res) => {
    res.sendFile(path.join(__dirname, '/client/res/weather-app.ico'));
});

/**
 * Route for home
 */
app.get('/', (req, res) => {
    const filePath = path.join(__dirname, '/client/home.html');
    res.status(200).sendFile(filePath);
    console.log('User Request Home');
});

/**
 * Route for login page
 */
app.get('/login', (req, res) => {
    const filePath = path.join(__dirname, '/client/login.html');
    res.status(200).sendFile(filePath);
    console.log('User Request login');
});

/**
 * Route for SignUp Page
 */
app.get('/signup', (req, res) => {
    const filePath = path.join(__dirname, '/client/signup.html');
    res.status(200).sendFile(filePath);
    console.log('User Request signup');
});

/**
 * Route for checkout page
 */
app.get('/checkout', (req, res) => {
    console.log('User Request Checkout');
    res.type('html');
    const filePath = path.join(__dirname, '/client/checkout.html');

    res.status(200).sendFile(filePath);
});

/**
 * Route for settings page
 */
app.get('/settings', (req, res) => {
    const filePath = path.join(__dirname, '/client/settings.html');
    res.status(200).sendFile(filePath);
    console.log('User Request settings');
});

/**
 * Route to handle default route for pages that does not exist
 */
app.get('*', (req, res) => {
    res.status(404).send('Page Does Not Exist');
    console.log('User Request non existing Page');

});

app.listen(PORT_SERVER, () => console.log(`Node server listening on : http://127.0.0.1:${PORT_SERVER}`));

