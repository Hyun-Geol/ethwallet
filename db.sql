CREATE TABLE `wallet_info` (
  `num` int(11) NOT NULL AUTO_INCREMENT,
  `userid` varchar(100) NOT NULL UNIQUE,
  `password` varchar(255) NOT NULL,
  `public_key` varchar(255) NOT NULL,
  `private_key` varchar(255) NOT NULL, 
  PRIMARY KEY (`num`)
);

CREATE TABLE `txHash` (
  `num` int(11) NOT NULL AUTO_INCREMENT,
  `userid` varchar(100) NOT NULL,
  `txHash` varchar(100) NOT NULL,
  PRIMARY KEY (`num`)
);
insert into wallet_info(userid, password, public_key, private_key) values ('ID','PW','PublicKey','PrivateKey');
insert into txHash(userid, txHash) values ('jhg','0x1028dbe928335eb5b88f363a5c369c5372edcfa468338499d01946348edf9286');


mysql -uroot -p111111