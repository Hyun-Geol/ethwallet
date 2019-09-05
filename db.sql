CREATE TABLE `wallet_info` (
  `num` int(11) NOT NULL AUTO_INCREMENT,
  `id` varchar(15) NOT NULL,
  `password` varchar(12) NOT NULL,
  `public key` varchar(100) NOT NULL,
  `private key` varchar(100) NOT NULL, 
  PRIMARY KEY (`num`)
);


insert into `wallet_info` values (1,'pilsa0327','111111','0x80eA97719143fab6Fa7C33d19DDA964667e7B08e','93745A59FC55711F13A5C5D460527050FF4C20A8CC409B39324A50D352ADE483');