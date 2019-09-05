var express = require('express');
var app = express();


var indexRouter = require('./routes/index');
var topicRouter = require('./routes/topic');

app.use('/public', express.static(__dirname + "/public"));

app.use('/', indexRouter);
app.use('/topic', topicRouter);



app.listen(3000, function() {
    console.log('3000port start..')
});