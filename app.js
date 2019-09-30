var express = require('express');
var app = express();

var indexRouter = require('./routes/index');
var topicRouter = require('./routes/topic');

app.use('/public', express.static(__dirname + "/public"));
app.set('view engine', 'ejs');
app.use('/', indexRouter);
app.use('/topic', topicRouter);

let port = 3000;
app.listen(port, function () {
    console.log(`${port}port start..`)
});