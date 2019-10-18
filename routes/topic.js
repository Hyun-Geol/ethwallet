let express = require('express');
let Web3 = require('web3');
let app = express();
let router = express.Router();
let Tx = require('ethereumjs-tx').Transaction
let web3 = new Web3(new Web3.providers.HttpProvider('https://ropsten.infura.io'));


let db = require('../public/js/db')
let bodyParser = require('body-parser');
let session = require('express-session');
let mysqlstore = require('express-mysql-session')(session);
let bcrypt = require('bcrypt-nodejs');
let CryptoJS = require('crypto-js')

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
    var { id, password } = req.body
    var accountPassword = web3.utils.randomHex(32)
    var newaccounts = web3.eth.accounts.create(accountPassword)
    password = bcrypt.hashSync(password)
    let encrypted = CryptoJS.AES.encrypt(newaccounts.privateKey, '123')

    db.query('SELECT * FROM wallet_info WHERE userid=?', [id], function (err, userInfo) {
        if (err) throw err;
        if (userInfo.length || !userInfo.length) {
            if (userInfo.length) {
                if (userInfo[0].userid === id) {
                    return res.redirect('/overlap')
                }
            }
            if (userInfo.length || !userInfo.length) {
                //let privateKey = bcrypt.hashSync(newaccounts.privateKey)
                let sql = { userid: id, password: password, public_key: newaccounts.address, private_key: encrypted.toString() }
                db.query(`INSERT INTO wallet_info set ? `, sql, function (err, result) {
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
    let encrypted = CryptoJS.AES.encrypt(privatekey, '123')
    db.query('SELECT * FROM wallet_info WHERE userid=?', [id], function (err, userInfo) {
        if (err) throw err;
        if (userInfo.length || !userInfo.length) {
            if (userInfo.length) {
                if (userInfo[0].userid === id) {
                    return res.redirect('/overlap')
                }
            }
            if (userInfo.length || !userInfo.length) {
                password = bcrypt.hashSync(password)
                let sql = { userid: id, password: password, public_key: accounts.address, private_key: encrypted }
                db.query(`INSERT INTO wallet_info set ?`, sql, function (err, result) {
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
            bcrypt.compare(password, userInfo[0].password, function (err, rf) {
                if (rf === true) {
                    req.session.is_logined = true;
                    req.session.password = userInfo[0].password;
                    req.session.userid = userInfo[0].userid;
                    req.session.public_key = userInfo[0].public_key;
                    req.session.private_key = userInfo[0].private_key;
                    req.session.save(function () {
                        return res.redirect(`/topic/main`)
                    })
                } else {
                    req.session.is_logined = false;
                    // 로그인 실패(패스워드 틀림)
                    return res.redirect('/permission')
                }
            })
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
    res.render('send', { title });
});

router.post('/send_process', function (req, res) {
    const gasLimit = 21000
    const gWei = 9
    sendTransaction = async () => {
        let { toAddress, gasPrice, value } = req.body;
        var nonce = await web3.eth.getTransactionCount(req.session.public_key, "pending") //await
        let decrypted = CryptoJS.AES.decrypt(req.session.private_key, '123')
        decrypted = decrypted.toString(CryptoJS.enc.Utf8).substring(2,)
        let privateKey = new Buffer.from(decrypted, 'hex')
        const rawTx = {
            nonce: nonce,
            gasLimit: web3.utils.toHex(gasLimit),
            gasPrice: web3.utils.toHex(gasPrice * (10 ** gWei)),
            from: req.session.public_key,
            to: toAddress,
            value: web3.utils.toHex(web3.utils.toWei(value, 'ether')),
            data: ''
        }
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
    res.render('privatekey', { title })
})

router.post('/privatekey_process', function (req, res) {
    async function privateKeyToAccount() {
        let { password } = req.body;
        let id = req.session.userid;
        db.query(`SELECT * FROM wallet_info where userid =?`, [id], function (err, userInfo) {
            bcrypt.compare(password, userInfo[0].password, function (err, tf) {
                if (err || tf == false) {
                    return res.redirect('/permission')
                }
                else if (tf === true) {
                    let decrypted = CryptoJS.AES.decrypt(req.session.private_key, '123')
                    let privateKey = decrypted.toString(CryptoJS.enc.Utf8);
                    res.send(`
                    <div>
                    <div class="form-group" style="width:50%;">
                    <label for="exampleInputEmail1">개인키</label><br>
                    ${privateKey}
                    </div>
                    </div>
                    <button type="button" class="btn btn-outline-dark" onclick="location.href='/topic/main'">메인페이지로 이동</button>
                    `)
                }
            })
        })
    }
    privateKeyToAccount();
})

module.exports = router;