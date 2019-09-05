var express = require('express');
var app = express();
var bodyParser = require('body-parser');

var indexRouter = require('./routes/index');
var topicRouter = require('./routes/topic');

app.use('/public', express.static(__dirname + "/public"));
router.use(bodyParser.urlencoded({ extended: false }));

app.use('/', indexRouter);
app.use('/topic', topicRouter);

app.listen(3000, function() {
    console.log('3000port start..')
});