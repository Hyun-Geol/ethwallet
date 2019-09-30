var express = require('express');
var router = express.Router();
var template = require('../public/lib/template.js');

router.get('/', function(req, res){
       
    return res.render(`index`);
});





module.exports = router;    