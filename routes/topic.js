const express = require('express');
const Web3 = require('web3');
const app = express();
const router = express.Router();
const Tx = require('ethereumjs-tx').Transaction
const web3 = new Web3(new Web3.providers.HttpProvider('https://ropsten.infura.io'));

const db = require('../public/js/db')
const bodyParser = require('body-parser');
const session = require('express-session');
const mysqlstore = require('express-mysql-session')(session);

router.use(bodyParser.urlencoded({ extended: false }));

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
    let title = 'Create Account'
    return res.render('create', { title });
});

router.post('/create_process', function (req, res) {
    var { id, password } = req.body;
    var accountPassword = web3.utils.randomHex(32)
    var newaccounts = web3.eth.accounts.create(accountPassword)
    db.query('SELECT * FROM wallet_info WHERE userid=?', [id], function (err, userInfo) {
        if (err) throw err;
        if (userInfo.length || !userInfo.length) {
            if (userInfo.length) {
                if (userInfo[0].userid === id) {
                    return res.redirect('/overlap')
                }
            }
            if (userInfo.length || !userInfo.length) {
                db.query(`INSERT INTO wallet_info(userid, password, public_key, private_key) VALUES(?, ?, ?, ?)`,
                    [id, password, newaccounts.address, newaccounts.privateKey], function (error, result) {
                        res.redirect('/')
                })
            }
        }
    })
});

router.get('/privatekeycreate', function (req, res) {
    let title = 'Create Account'
    res.render('privatekeycreate', { title });
})

router.post('/privatekeycreate_process', async function (req, res) {
    let { id, password, privatekey } = req.body;
    let accounts = web3.eth.accounts.privateKeyToAccount(privatekey)
    db.query('SELECT * FROM wallet_info WHERE userid=?', [id], function (err, userInfo) {
        if (err) throw err;
        if (userInfo.length || !userInfo.length) {
            if (userInfo.length) {
                if (userInfo[0].userid === id) {
                    return res.redirect('/overlap')
                }
            }
            if (userInfo.length || !userInfo.length){
                db.query(`INSERT INTO wallet_info(userid, password, public_key, private_key) VALUES(?, ?, ?, ?)`,
                [id, password, accounts.address, accounts.privateKey], function (error, result) {
                    res.redirect('/')
                })
            }
        }
    })
})

router.post('/login_process', function (req, res) {
    var { id, password } = req.body;
    db.query(`SELECT * FROM wallet_info WHERE userid =? `, [id], function (err, userInfo) {
        if (err) {
            return res.redirect('/fail')
        }

        if (!userInfo.length) {
            // 로그인 실패(id 없음)
            return res.redirect('/permission')
        }
        else {
            if (userInfo[0].password == password) {
                req.session.is_logined = true;
                req.session.password = userInfo[0].password;
                req.session.userid = userInfo[0].userid;
                req.session.public_key = userInfo[0].public_key;
                req.session.private_key = userInfo[0].private_key;
                req.session.save(function () {
                    return res.redirect(`/topic/main`)
                })
            } else {
                // 로그인 실패(패스워드 틀림)
                return res.redirect('/permission')
            }
        }
    });
});

router.get('/main', function (req, res) {
    if (!req.session.is_logined) {
        return res.redirect('/');
    }
    var userid = req.session.userid;
    var public_key = req.session.public_key;
    console.log(userid)
    console.log(public_key)
    let title = 'Main'
    db.query(`SELECT * FROM txHash WHERE userid=?`, [userid], async function (err, txInfo) {
        if (err) {
            console.log(err)
        } else {
            await web3.eth.getBalance(public_key.toString(), function (err, wei) {
                balance = web3.utils.fromWei(wei, 'ether')
            })
            if (!txInfo.length) {
                TxHashList = '';

            } else if (txInfo.length > 0) {
                var TxHashList = '<table class="table table-hover">';
                for (var i = 1; i <= txInfo.length; i++) {
                    TxHashList += `
                        <tr>
                            <td><a href = http://203.236.220.40:3000/tx/${txInfo[txInfo.length - i].txHash} target="_blank">${txInfo[txInfo.length - i].txHash}</a></td>
                        </tr>`
                }
                TxHashList += '</table>'
            }
            return res.render('main', { title, userid, public_key, balance, TxHashList });
        }
    });
});

router.get('/send', function (req, res) {
    if (!req.session.is_logined) {
        return res.redirect('/');
    }
    let title = 'Send'
    res.render('send',{title});
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

router.get('/privatekey', function (req, res) {
    let title = 'Private_key';
    res.render('privatekey', {title})
})

router.post('/privatekey_process', function (req, res) {
    let password = req.body.password;
    db.query(`SELECT * FROM wallet_info`, async function (err, userInfo) {
        if (userInfo[0].password === password) {
            let privateKey = req.session.private_key;
            res.send(`
            <div>
            <div class="form-group" style="width:50%;">
                <label for="exampleInputEmail1">개인키</label><br>
                ${privateKey}
            </div>
            </div>
            <button type="button" class="btn btn-outline-dark" onclick="location.href='/topic/main'">메인페이지로 이동</button>
            `)
        } else {
            res.send('error')
        }
    })
})

module.exports = router;