var express = require('express');
var router = express.Router();

router.get('/', function(req, res){
       let title = 'Login';
    return res.render(`index`, { title });
});

router.get('/fail', function (req, res) {
    let title = 'Error'
    return res.render('fail', { title })
})

router.get('/overlap', function (req, res) {
    let title = 'Overlap'
    return res.render('overlap', { title })
})

router.get('/permission', function (req, res) {
    let title = 'Permission'
    return res.render('permission', { title })
})

module.exports = router;    