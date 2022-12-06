const express = require('express');
const app = express();

const p1 = require('./routes/p1')(app); // 함수라는 뜻 
app.use('/p1',p1);

const p2 = require('./routes/p2')(app);
app.use('/p2',p2);

app.listen(3003,()=>{
  console.log('Connect 3003 port!'); 
})