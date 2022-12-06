const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const pbkdf2Password = require("pbkdf2-password");
var hasher = pbkdf2Password();
const FileStore = require('session-file-store')(session); //의존관계 
const app = express();
var users = [
  {
    username: 'egoing',
    password: 'NEJxUfa4q3gf7LMfO1jqKmnOmBW8Ikhg9Ju63vCN20Is0Jlb77ZXABfE4nKxm5EG1OiBQC2w4GJWtpQS+d5bCLyMWTDUF7APM7e+Wcs2Xdt0uVVnKG6wQmfqa1So4cNuqtaqkKG07wgs5J0k3YyHnYXImfRGqrShfbyfghrEYEM=',
    salt: 'R0aNjtbM4v7vw8TrqPQGWHzObuwxlWvJn2poi0+yerRBZ3YEr/jaK6TcVLyALft3EmeJyIbZn0XdmC7uCilE+g==',
    displayName: 'Egoing'
  },
  {
    username: 'coding',
    password: 'sirR3yXY2UeWEsATxBVqu+0BrvfwQ/t1ma7B2VTWDAnbyRTyQMaaoCkkiZoKZJPNbcMETr26bTU8Vq47lEXoC11ppfBKhddqRW/+hslTaABdXvKe9kHXocm1pqTDi9ixISufNY2vCmZ8XCP+2D5RTF93t2smTAxovZghrDiC+uo=',
    salt: 'lYynoNfP2BNMPCJY1x1IDdGWIXSt6hRbZjMEf9EAuhQon+fEXBRQmRs9t9CqkQBCmjfYRQW/Hw6JfD7NKUvmCw==',
    displayName: 'coding'
  }
];
app.use(bodyParser.urlencoded({ extended: false }));
app.use(session({
  secret: '1234%^&123$%^sff',
  resave: false,
  saveUninitialized: true,
  store: new FileStore(),
}));
app.post('/auth/register',(req,res)=>{
  hasher({password : req.body.password},(err,pass,salt,hash)=>{
    var user = {
      username : req.body.username,
      password : hash,
      salt : salt,
      displayName : req.body.displayName
    };
    users.push(user);
    console.log(users);
    req.session.displayName = req.body.displayName;
    req.session.save(()=>{
      res.redirect('/welcome');
    });
  });
});

app.get('/auth/register',(req,res)=>{
  var output = `
  <h1>Register</h1>
  <form action="/auth/register" method = "post">
  <p>
    <input type ="text" name = "username" placeholder = "username"></input>
  </p>
  <p>
    <input type ="password" name = "password" placeholder = "password"></input>
  </p>
  <p>
    <input type ="displayName" name = "displayName" placeholder = "username"></input>
  </p>
  <p>
    <input type = "submit"></input>
  </p>
  </form>`;

  res.send(output);
})

app.get('/auth/logout', (req, res) => {
  delete req.session.displayName;
  req.session.save(() => {
    res.redirect('/welcome');
  });
})
app.get('/welcome', (req, res) => {
  if (req.session.displayName) {
    res.send(`
    <h1>Hello,${req.session.displayName}</h1>
    <a href="/auth/logout">logout</a> 
    `);
  } else {
    res.send(`
    <h1>Welcome</h1>
    <ul>
    <li><a href="/auth/login">login</a></li>
    <li><a href="/auth/register">register</a></li>
    </ul>`);
  }
});
app.post('/auth/login', (req, res) => {
  var uname = req.body.username;
  var pw = req.body.password;
  for (var i = 0; i < users.length; i++) {
    var user = users[i];
    console.log(users);
    if (uname === user.username) {
      return hasher({ password: pw, salt: user.salt }, (err, pass, salt, hash) => {
        if (hash === user.password) {
          req.session.displayName = user.displayName;
          req.session.save(() => {
            return res.redirect('/welcome');
          })
        } else {
          res.send(`Who are you?<a href = "/auth/login">login</a>`);
        }
      });
    }
  }
  res.send(`Who are you?<a href = "/auth/login">login</a>`);
});

app.get('/auth/login', (req, res) => {
  var output = `
  <h1>Login</h1>
  <form action="/auth/login" method = "post">
  <p>
    <input type ="text" name = "username" placeholder = "username"></input>
  </p>
  <p>
    <input type ="password" name = "password" placeholder = "password"></input>
  </p>
  <p>
    <input type = "submit"></input>
  </p>
  </form>
  <a href = "/auth/register">register</a>`;

  res.send(output);
});

app.get('/count', (req, res) => {
  if (req.session.count) {
    req.session.count++;
  } else {
    req.session.count = 1;
  }
  res.send("hi session");
});

app.get('/tmp', (req, res) => {
  res.send('count : ' + req.session.count);
})

app.listen(3003, () => {
  console.log('Connected 3003 port!!');
});