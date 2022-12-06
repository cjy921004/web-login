const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser')
const app = express();
var mysqlStore = require('express-mysql-session')(session);

var options = {
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: 'cjy33251634',
  database: 'session_login'
};
app.use(bodyParser.urlencoded({ extended: false }));
app.use(session({
  secret: '1234%^&123$%^sff',
  resave: false,
  saveUninitialized: true,
  store: new mysqlStore(options),
}));

app.get('/auth/logout', (req, res) => {
  delete req.session.displayName;

  req.session.save(()=>{
    res.redirect('/welcome');
  })
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
    <a href="/auth/login">login</a> 
    `);
  }
});

app.post('/auth/login', (req, res) => {
  var user = {
    username: 'egoing',
    password: '111',
    displayName: 'Egoing'
  };
  var uname = req.body.username;
  var pw = req.body.password;
  if (uname === user.username && pw === user.password) {
    req.session.displayName = user.displayName;
    req.session.save(()=>{
      res.redirect('/welcome');
    });
  } else {
    res.send(`Who are you?<a href = "/auth/login">login</a>`);
  }
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
  </form>`;

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