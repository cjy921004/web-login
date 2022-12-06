const app = require('./config/mysql/express')();
var passport = require('./config/mysql/passport')(app);
var auth = require('./routes/mysql/auth')(passport); //함수의 인자로 패스포트 전달 
app.use('/auth/',auth);
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


app.listen(3003, () => {
  console.log('Connected 3003 port!!');
});