var express = require('express');
var app = express();
var logger = require('morgan');

var indexRouter = require('./routes/index');
var topicRouter = require('./routes/topic');

app.use('/public', express.static(__dirname + "/public"));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use('/', indexRouter);
app.use('/topic', topicRouter);

module.exports = app;