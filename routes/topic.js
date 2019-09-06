var express = require('express');
var app = express();
var router = express.Router();
var template = require('../public/lib/template.js');
var Web3 = require('web3');
var web3 = new Web3(new Web3.providers.HttpProvider('http://127.0.0.1:8545'));
var mysql = require('mysql');
var bodyParser = require('body-parser');
var session = require('express-session');
var mysqlstore = require('express-mysql-session')(session);

router.use(bodyParser.urlencoded({ extended: false }));

var db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '111111',
    database: 'wallet'
});
//db.connect();

router.use(session({
    secret: '12sdfwerwersdfserwerwef', //keboard cat (랜덤한 값)
    resave: false,
    saveUninitialized: true,
    store: new mysqlstore({
        host: 'localhost',
        user: 'root',
        password: '111111',
        database: 'wallet'
    })
}))

router.get('/create', function (req, res) {
    var html = template.HTML(
        `
        <form action="/topic/create_process" method="post">
            <h4 class="display-4">Create wallet</h4><br/>
            <div class = "form-group">
                <label for="id1">id</label>
                <input type="text" class="form-control" name= "id" id="id" placeholder="id를 입력하세요"><br/>
                <label for="password1">password</label>
                <input type="password" class="form-control" name= "password" id="password" placeholder="password를 입력하세요"><br/>
            </div>
            <button type="submit" class="btn btn-outline-info">생성</button>
            <button type="button" class="btn btn-outline-dark" onclick="location.href='/'">취소</button>
        </form>`
    );
    res.send(html);
});

router.post('/create_process', function (req, res) {
    var { id, password } = req.body;
    var accountPassword = web3.utils.randomHex(32)
    var newaccounts = web3.eth.accounts.create(accountPassword)
    db.query(`insert into wallet_info(id, password, public_key, private_key) values(?, ?, ?, ?)`,
        [id, password, newaccounts.address, newaccounts.privateKey], function (error, result) {
            res.redirect('/')
        })

});

router.post('/login_process', function (req, res) {
    var { id, password} = req.body;
    db.query(`SELECT * FROM wallet_info WHERE id =? `, [id], function (err, userInfo) {
        if (err) {
            return res.redirect('/topic/fail')
        }

        if (!userInfo.length) {
            // 로그인 실패(id 없음)
            return res.redirect('/topic/permission')
        }
        else {
            if (userInfo[0].password == password) {
                req.session.password = userInfo[0].password;
                req.session.public_key = userInfo[0].public_key;
                req.session.private_key = userInfo[0].private_key;
                req.session.id = userInfo[0].id;
                req.session.save(() => {
                    return res.redirect("/topic/main")
                })
            } else {
                // 로그인 실패(패스워드 틀림)
                return res.redirect('/topic/permission')
            }
        }
        
    });

});

router.get('/fail', function (req, res) {
    var html = template.FAIL
    return res.send(html);
});

router.get('/permission', function (req, res) {
    var html = template.PERMISSION
    return res.send(html);
});


router.get('/main', function (req, res) {
    console.log(req.session.id)
    console.log(req.session.public_key)
    console.log(req.session.private_key)
    console.log(req.session.password)
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
                        <th scope="col"> </th>
                    </tr>
                    <tr>
                        <th scope="row">${req.session.public_key}</th>
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

router.get('/send', function (req, res) {
    var html = template.HTML(
        `
        <script type="text/javascript" src="/public/js/bootstrap.js"></script>
        <div class="dropdown">
    
            <div
                class="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
                <h1 class="h2">Wallet Info</h1>
            </div>
    
            <form action="/" method="post">
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
                <button type="submit" class="btn btn-outline-dark">전송</button>
                <button type="button" class="btn btn-outline-dark" onclick="location.href='/topic/main'">취소</button>
            </form>
        </div>
        `
    );

    res.send(html);

});






module.exports = router;    