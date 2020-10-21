const createError = require('http-errors');
const express = require('express');
require('dotenv').config();
const compression = require('compression');
const path = require('path');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const cookieSession = require("cookie-session");
const logger = require('morgan');

const indexRouter = require('./routes/index');

const app = express();
app.use(compression());

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

const allowCrossDomain = function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'HEAD,GET,POST,PUT,OPTIONS,DELETE'); //GET,PUT,POST,DELETE
  res.header('Access-Control-Allow-Headers', 'Content-Type');

  next();
};

app.use(logger('dev'));
app.use(bodyParser.json({limit: '100mb'}));
app.use(bodyParser.urlencoded({ limit: '100mb', extended: false }));
app.use(express.json());
app.use(allowCrossDomain);
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(cookieSession({secret: "c0l@b0r@.p3"}));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  //next(createError(404));
  res.status(404).render('404');
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error', { title: 'Express' });
});

app.disable('etag');
app.set('etag', false);

module.exports = app;