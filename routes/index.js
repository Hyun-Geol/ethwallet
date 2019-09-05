var express = require('express');
var router = express.Router();
var template = require('../public/lib/template.js');

router.get('/', function(req, res){
    var html = template.HTML(
        `
        <form action="/topic/login_process" method="post">
            <h4 class="display-4">welcome!</h4><br/>
            <div class = "form-group">
                <label for="id">id</label>
                <input type="text" class="form-control" id="id" name ="id" placeholder="id를 입력하세요"><br/>
                <label for="password">password</label>
                <input type="password" class="form-control" id="password" name="password" placeholder="password를 입력하세요"><br/>
            </div>
            <button type="submit" class="btn btn-outline-info">로그인</button>
            <button type="button" class="btn btn-outline-dark" onclick="location.href='./topic/create'">계정생성</button>
        </form>`
    );
       
    res.send(html);
});

router.get('/images', function(req, res){
    res.send('hi');

});



module.exports = router;    