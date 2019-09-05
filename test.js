var Web3 = require('web3');
var web3 = new Web3(new Web3.providers.HttpProvider('https://ropsten.infura.io'));

var password = web3.utils.randomHex(32)
var newaccounts = web3.eth.accounts.create(password)
console.log(newaccounts)