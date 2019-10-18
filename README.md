# ethwallet

회원가입 후 이더리움 계정을 발급받고 로그인하여 계정의 잔액, 이더리움 전송을 하는 웹 페이지

### 사용방법
1. 소스 내려받고 서버 실행하는 법
```
$ git clone https://github.com/Hyun-Geol/ethwallet.git
$ cd ethwallet
$ npm i
$ npm start
```

2. 시작 페이지(로그인)

    ![startPage](./screenshot/startPage.png)

3. 회원가입 페이지

    ![createwallet](./screenshot/createwallet.png)

4. 메인 페이지

    ![mainpage](./screenshot/mainpage.png)

5. 전송 페이지

    ![sendpage](./screenshot/sendpage.png)

6. 에러 페이지

    ![errpage](./screenshot/errpage.png)
    
    
### 참고 문서
[Web3](https://web3js.readthedocs.io)

### 암호화
1. password는 bcrypt를 사용.(로그인시 복호화 결과가 true면 로그인, false면 에러페이지)
2. privatekey는 crypto로 암호화 한 뒤에 메인페이지에서 개인키 가져오기누르고 
비밀번호 입력해서 true면 privatekey를 반환해줌.
