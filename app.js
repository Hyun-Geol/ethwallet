var express = require('express');
var app = express();
var Web3 = require('web3');
var web3 = new Web3(new Web3.providers.HttpProvider('http://127.0.0.1:8545'));

var indexRouter = require('./routes/index');
var topicRouter = require('./routes/topic');

app.use('/public', express.static(__dirname + "/public"));

app.use('/', indexRouter);
app.use('/topic', topicRouter);

var newaccounts = web3.eth.accounts.create(web3.utils.randomHex(32), function(err, address, privateKey){
    console.log(address, "으으", privateKey)
});
console.log(newaccounts)


app.listen(3000, function() {
    console.log('3000port start..')
});