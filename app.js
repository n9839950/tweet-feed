
const express = require('express');
const session = require('express-session');
const expressValidator = require('express-validator');
const path = require('path');
const request = require("request");
const bodyParser = require('body-parser');
const errorHandler = require('errorhandler');
const dotenv = require('dotenv');
const favicon = require('serve-favicon');
dotenv.load({ path: '.env' });

const homeController = require('./controllers/homeController');
const searchController = require('./controllers/searchController');



const app = express();

app.set('host', process.env.HOST || '0.0.0.0');
app.set('port', process.env.PORT || 5000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(expressValidator());
app.use(session({
  resave: true,
  saveUninitialized: true,
  secret: process.env.SESSION_SECRET
}));
app.use((req, res, next) => {
  res.locals.user = req.user;
  next();
});
app.use(express.static(path.join(__dirname, 'public')));
app.use(favicon(path.join(__dirname, 'public','images', 'favicon.ico')))


app.get('/', homeController.index);

app.get('/result', searchController.result);

app.get('/updateData', searchController.updateData);
app.get('/closeStream', searchController.closeStream);


app.use(errorHandler());

app.listen(app.get('port'), () => {
  console.log('App is running on port 3000!');
});

module.exports = app;
