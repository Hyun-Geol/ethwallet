const express = require('express');
const Web3 = require('web3');
const app = express();
const router = express.Router();
const template = require('../public/lib/template.js');
const Tx = require('ethereumjs-tx').Transaction
//const web3 = new Web3(new Web3.providers.HttpProvider('http://127.0.0.1:8545'));
let web3 = new Web3(new Web3.providers.HttpProvider('https://ropsten.infura.io'));
//var web3 = new Web3(new Web3.providers.HttpProvider('https://api.myetherapi.com/rop'));


const mysql = require('mysql');
const bodyParser = require('body-parser');
const session = require('express-session');
const mysqlstore = require('express-mysql-session')(session);

router.use(bodyParser.urlencoded({ extended: false }));

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '111111',
    database: 'wallet'
});
//db.connect();

router.use(session({
    key: 'sid',
    secret: '135hjgui1g2541jikhfd', //keboard cat (랜덤한 값)
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
                <input type="text" class="form-control" name="id" id="id" placeholder="id를 입력하세요"><br/>
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
    db.query('SELECT * FROM wallet_info', function (err, userInfo) {
        if (err) throw err;
        if (userInfo[0] === undefined || userInfo[0] !== undefined) {
            db.query(`INSERT INTO wallet_info(userid, password, public_key, private_key) VALUES(?, ?, ?, ?)`,
                [id, password, newaccounts.address, newaccounts.privateKey], function (error, result) {
                    res.redirect('/')
                })
        } else if (userInfo[0].userid == id) {
            return res.redirect('/topic/overlap')
        }

    })
});

router.post('/login_process', function (req, res) {
    var { id, password } = req.body;
    db.query(`SELECT * FROM wallet_info WHERE userid =? `, [id], function (err, userInfo) {
        if (err) {
            return res.redirect('/topic/fail')
        }

        if (!userInfo.length) {
            // 로그인 실패(id 없음)
            return res.redirect('/topic/permission')
        }
        else {
            if (userInfo[0].password == password) {
                req.session.is_logined = true;
                req.session.password = userInfo[0].password;
                req.session.userid = userInfo[0].userid;
                req.session.public_key = userInfo[0].public_key;
                req.session.private_key = userInfo[0].private_key;

                req.session.save(function () {
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
router.get('/overlap', function (req, res) {
    var html = template.OVERLAP
    return res.send(html);
});


router.get('/main', function (req, res) {
    if (!req.session.is_logined) {
        return res.redirect('/');
    }
    /*
    console.log(req.session.password)
    console.log(req.session.public_key)
    console.log(req.session.private_key)
    console.log(req.session.userid)
    */
    var userid = req.session.userid
    db.query(`SELECT * FROM txHash WHERE userid=?`, [userid], async function (err, txInfo) {
        if (err) {
            console.log(err)
        } else {
                await web3.eth.getBalance(req.session.public_key.toString(), function(err, wei) {
                    balance = web3.utils.fromWei(wei, 'ether')
                    console.log("balance : ", balance, ' Ether')
                })
                if (!txInfo.length) {
                    TxHashList = '';

                } else if (txInfo.length > 0) {
                    var TxHashList = '<table class="table table-hover">';
                    for (var i = 1; i <= txInfo.length; i++) {
                        TxHashList += `
                            <tr>
                                <td><a href = http://203.236.220.35:3000/tx/${txInfo[txInfo.length - i].txHash} target="_blank">${txInfo[txInfo.length - i].txHash}</a></td>
                            </tr>
                            `
                    }
                    TxHashList += '</table>'
                }
                var html = template.HTML(
                    `
        
        <!--network-->
        <div class="dropdown">
            <button class="btn btn-secondary dropdown-toggle" type="button" id="dropdownMenubutton" data-toggle="dropdown"
                aria-haspopup="true" aria-expanded="false">
                Rosten
            </button>
            <div class="dropdown-menu" aria-labelledby="dropdownMenuButton">
                <a class="dropdown-item" href="#" name="main">이더리움 메인넷</a>
                <a class="dropdown-item" href="#" name="ropsten">Ropsten 테스트넷</a>
                <a class="dropdown-item" href="#" name="kovan">Kovan 테스트넷</a>
                <a class="dropdown-item" href="#" name="rinkeby">Rinkeby 테스트넷</a>
                <a class="dropdown-item" href="#" name="local">로컬호스트 8545</a>
            </div>
        </div>
    
        <!--계정확인-->
        <div class="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom" style="width:64%;">
            <div class="text-center">
                
                <table class="table table-bordered">
                    <tr>
                        <th scope="col"> ${req.session.userid}</th>
                    </tr>
                    <tr>
                        <th scope="row">${req.session.public_key}</th>
                    </tr>
                </table>
            </div>
        </div>
    
        <!--입금 전송-->
        <div class="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom" style="width:64%;">
            <form>
                <div class="text-center">
                    <img src="/public/images/bono.png" alt="" class="small1"><br/><br/>
                    <h3> ${balance} Ether </h3>
                    </p>
                    <button type="button" class="btn btn-outline-info">입금(추후예정)</button>
                    <button type="button" class="btn btn-outline-info" onclick="location.href='/topic/send'">전송</button>
                    <button type="button" class="btn btn-outline-info" id="logout" name="logout" onclick="location.href='/topic/session_destroy'">로그아웃</button>
                </div>
            </form>
        </div>
    
        <!--히스토리-->
        <div>
            <div class="form-group" style="width:50%;">
                <label for="exampleInputEmail1">History</label><br>
                ${TxHashList}
            </div>
        </div>
    </body>
    `
                );
                res.send(html);
            
        }
    }
    );
});

router.get('/send', function (req, res) {
    if (!req.session.is_logined) {
        return res.redirect('/');
    }
    var html = template.HTML(
        `
        <script src="http://code.jquery.com/jquery-latest.min.js"></script>
        <script type="text/javascript" src="/public/js/bootstrap.js"></script>
        <div class="dropdown">
    
            <div
                class="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
                <h1 class="h2">Wallet Info</h1>
            </div>
    
            <form action="/topic/send_process" method="post">
                <div class="form-group">
                    <label for="privatekey">To</label>
                    <input type="text" class="form-control" id="toAddress" name="toAddress"
                        placeholder="받는 계정"><br />
    
                    <label for="privatekey">Gas Price</label>
                    <input type="text" class="form-control" id="gasPrice" name="gasPrice"
                        placeholder="가스비"><br />
    
                    <label for="privatekey">Value</label>
                    <input type="text" class="form-control" id="value" name="value"
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

router.post('/send_process', function (req, res) {
    const gasLimit = 21000
    const gWei = 9
    sendTransaction = async () => {
        let { toAddress, gasPrice, value } = req.body;
        var nonce = await web3.eth.getTransactionCount(req.session.public_key, "pending") //await
        const rawTx = {
            nonce: nonce,
            gasLimit: web3.utils.toHex(gasLimit),
            gasPrice: web3.utils.toHex(gasPrice * (10 ** gWei)),
            from: req.session.public_key,
            to: toAddress,
            value: web3.utils.toHex(web3.utils.toWei(value, 'ether')),
            data: '',
        }
        let privateKey = new Buffer.from(req.session.private_key.substring(2, 66), 'hex')
        let tx = new Tx(rawTx, { chain: 'ropsten' });
        tx.sign(privateKey)
        let serializedTx = tx.serialize();
        web3.eth.sendSignedTransaction('0x' + serializedTx.toString('hex'), function (err, hash) {
            if (err) {
                throw err;
            } else {
                db.query('SELECT * FROM txHash', function (err, userInfo) {
                    if (err) throw err;
                    if (userInfo[0] === undefined || userInfo !== undefined) {

                        txHash = new Array();
                        txHash = hash;
                        //console.log(txHash)
                        var userid = req.session.userid;
                        db.query('INSERT INTO txHash(userid, txHash) VALUES(?, ?)', [userid, txHash], function (error, result) {
                            if (error) {
                                console.log(error)
                            } else {
                                res.redirect("/topic/main")
                            }
                        })
                    }
                })
            }
        })
    }

    sendTransaction()
})

router.get('/session_destroy', function (req, res) {
    req.session.destroy();  // 세션 삭제
    res.clearCookie('sid'); // 세션 쿠키 삭제
    res.redirect('/');
})


module.exports = router;