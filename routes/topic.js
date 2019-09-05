var express = require('express');
var router = express.Router();
var template = require('../public/lib/template.js');
var Web3 = require('web3');
var web3 = new Web3(new Web3.providers.HttpProvider('http://127.0.0.1:8545'));


router.get('/create', function(req, res){
    var html = template.HTML(
        `
        <form action="/topic/create_process" method="post">
            <h4 class="display-4">Create wallet</h4><br/>
            <div class = "form-group">
                <label for="id">id</label>
                <input type="text" class="form-control" id="exampleInputPassword1" placeholder="id를 입력하세요"><br/>
                <label for="password">password</label>
                <input type="password" class="form-control" id="exampleInputPassword1" placeholder="password를 입력하세요"><br/>
            </div>
            <button type="submit" class="btn btn-outline-info">생성</button>
            <button type="button" class="btn btn-outline-dark" onclick="location.href='/'">취소</button>
        </form>`
    );
            
    res.send(html);

});




router.post('/create_process', function(req, res){
    web3.eth.accounts.create(web3.utils.randomHex(32), function(err, address, privatekey){
        console.log(address, "으으", privatekey)
    });
    res.send('hi');
});     


router.post('/main', function(req, res){
    var html = template.HTML(
        `
        <script type="text/javascript" src="/public/js/bootstrap.js"></script>
        <!--network-->
        <div class="dropdown">
            <button class="btn btn-secondary dropdown-toggle" type="button" id="dropdownMenubutton" data-toggle="dropdown"
                aria-haspopup="true" aria-expanded="false">
                Network
            </button>
            <div class="dropdown-menu" aria-labelledby="dropdownMenuButton">
                <a class="dropdown-item" href="#">이더리움 메인넷</a>
                <a class="dropdown-item" href="#">Ropsten 테스트넷</a>
                <a class="dropdown-item" href="#">Kovan 테스트넷</a>
                <a class="dropdown-item" href="#">Rinkeby 테스트넷</a>
                <a class="dropdown-item" href="#">로컬호스트 8545</a>
            </div>
        </div>
    
        <!--계정확인-->
        <div class="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
            <div class="text-center">
                
                <table class="table table-bordered">
                    <tr>
                        <th scope="col">계정 아이디</th>
                    </tr>
                    <tr>
                        <th scope="row">퍼블릭키</th>
                    </tr>
                </table>
            </div>
        </div>
    
        <!--입금 전송-->
        <div class="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
            <form>
                <div class="text-center">
                    <img src="/public/images/bono.png" alt="" class="small1"><br/><br/>
                    <h3> 잔액 조회</h3>
                    </p>
                    <button type="button" class="btn btn-outline-info">입금(추후예정)</button>
                    <button type="button" class="btn btn-outline-info" onclick="location.href='/topic/send'">전송</button>
                </div>
            </form>
        </div>
    
        <!--히스토리-->
        <div>
            <div class="form-group">
                <label for="exampleInputEmail1">History</label>
            </div>
        </div>
    </body>
    `
    );
    res.send(html);
});


router.get('/send', function(req, res){
    var html = template.HTML(
        `
        <script type="text/javascript" src="/public/js/bootstrap.js"></script>
        <div class="dropdown">
            <div
                class="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
                <h1 class="h2">Wallet Info</h1>
            </div>
    
            <form>
                <div class="form-group">
                    <label for="privatekey">To</label>
                    <input type="password" class="form-control" id="exampleInputPassword1"
                        placeholder="보내는 계정"><br />
    
                    <label for="privatekey">From</label>
                    <input type="password" class="form-control" id="exampleInputPassword1"
                        placeholder="받는 계정"><br />
    
                    <label for="privatekey">Gas Price</label>
                    <input type="password" class="form-control" id="exampleInputPassword1"
                        placeholder="가스비"><br />
    
                    <label for="privatekey">Value</label>
                    <input type="password" class="form-control" id="exampleInputPassword1"
                        placeholder="전송량"><br />
                </div>
                <button type="button" class="btn btn-outline-dark">전송</button>
            </form>
        </div>
        `
    );
            
    res.send(html);

});





module.exports = router;    