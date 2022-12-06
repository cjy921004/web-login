const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const FileStore = require('session-file-store')(session);
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const app = express();
const pbkdf2Password = require("pbkdf2-password");
var hasher = pbkdf2Password();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(session({
  secret: '1234%^&123$%^sff',
  resave: false,
  saveUninitialized: true,
  store: new FileStore(),
}));
app.use(passport.initialize());
app.use(passport.session());

var users = [
  {
    authId : 'local:egoing',
    username: 'egoing',
    password: 'NEJxUfa4q3gf7LMfO1jqKmnOmBW8Ikhg9Ju63vCN20Is0Jlb77ZXABfE4nKxm5EG1OiBQC2w4GJWtpQS+d5bCLyMWTDUF7APM7e+Wcs2Xdt0uVVnKG6wQmfqa1So4cNuqtaqkKG07wgs5J0k3YyHnYXImfRGqrShfbyfghrEYEM=',
    salt: 'R0aNjtbM4v7vw8TrqPQGWHzObuwxlWvJn2poi0+yerRBZ3YEr/jaK6TcVLyALft3EmeJyIbZn0XdmC7uCilE+g==',
    displayName: 'Egoing'
  },
  {
    authId : 'local:coing',
    username: 'coding',
    password: 'sirR3yXY2UeWEsATxBVqu+0BrvfwQ/t1ma7B2VTWDAnbyRTyQMaaoCkkiZoKZJPNbcMETr26bTU8Vq47lEXoC11ppfBKhddqRW/+hslTaABdXvKe9kHXocm1pqTDi9ixISufNY2vCmZ8XCP+2D5RTF93t2smTAxovZghrDiC+uo=',
    salt: 'lYynoNfP2BNMPCJY1x1IDdGWIXSt6hRbZjMEf9EAuhQon+fEXBRQmRs9t9CqkQBCmjfYRQW/Hw6JfD7NKUvmCw==',
    displayName: 'coding'
  }
];
app.post('/auth/register', (req, res) => {
  hasher({ password: req.body.password }, (err, pass, salt, hash) => {
    var user = {
      authId : 'local:'+ req.body.username,
      username: req.body.username,
      password: hash,
      salt: salt,
      displayName: req.body.displayName
    };
    users.push(user);
    req.login(user, () => {
      req.session.save(() => {
        res.redirect('/welcome');
      });
    });
    console.log(users);
  });
});

app.get('/auth/register', (req, res) => {
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
  req.logout(() => {
    req.session.save(() => {
      res.redirect('/welcome');
    });
  });
});

app.get('/welcome', (req, res) => {
  if (req.user && req.user.displayName) {
    res.send(`
    <h1>Hello,${req.user.displayName}</h1>
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
passport.serializeUser((user, done) => {
  done(null, user.authId); // 식별자
});

passport.deserializeUser((id, done) => {
  for (var i = 0; i < users.length; i++) {
    var user = users[i];
    if (user.authId === id) {
      return done(null, user);
    }
  }
  done('There is no user');
});

passport.use(new LocalStrategy((username, password, done) => {
  var uname = username;
  var pw = password;
  for (var i = 0; i < users.length; i++) {
    var user = users[i];
    if (uname === user.username) {
      return hasher({ password: pw, salt: user.salt }, (err, pass, salt, hash) => {
        if (hash === user.password) {
          done(null, user);
        } else {
          done(null, false);
        }
      });
    }
  }
  done(null, false);
})
);

app.post('/auth/login', passport.authenticate(
  'local',
  {
    successRedirect: '/welcome',
    failureRedirect: '/auth/login',
    failureFlash: false
  }));

app.get('/auth/facebook', passport.authenticate(
  'facebook',
  {scope : 'email'}
));

app.get('/auth/facebook/callback',
  passport.authenticate(
    'facebook',
    {
      successRedirect: '/welcome',
      failureRedirect: '/auth/login',
      failureFlash: false
    }));

passport.use(new FacebookStrategy({
  clientID: '1479835655889114',
  clientSecret: 'd0af896bb3d8c79bc0015e2ce8fe2430',
  callbackURL: "/auth/facebook/callback",
  profileFields : ['id','email','gender','link','locale','name',
  'timezone','updated_time','verfied','displayName']
},
  (accessToken, refreshToken, profile, done) => {
    console.log(profile);
    var authId = 'facebook:'+profile.id;
    for(var i =0; i<users.length; i++){
      var user = users[i];
      if(user.authId === authId){
        return done(null,user);
      }
    }
    var newuser = {
      'authId' : authId,
      'displayName' : profile.displayName,
      'email' : profile.emails[0].value
    };
    users.push(newuser);
    done(null, newuser);
  }
));

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
  <p>
  <a href = "/auth/register">register</a>
  </p>
  <p>
  <a href = "/auth/facebook">facebook login</a> 
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