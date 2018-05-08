const express = require('express');
const path = require('path');
const favicon = require('serve-favicon');
const logger = require('morgan');
const bodyParser = require('body-parser');
const http = require('http');


const api = require('./routes/api');
const app = express();
const router = express.Router();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({'extended':'false'}));
app.use(express.static(path.join(__dirname, 'dist')));



app.get('*', function(req, res, next) {
  res.sendFile(path.join(__dirname, 'dist/index.html'));
});

app.post('/action',function(req,res,next){
    console.log('ici' + req.body.name);
})



const port = process.env.PORT || '3000';
app.set('port',port);

const server = http.createServer(app);
server.listen(port, () => console.log(`Running Baby`))


module.exports = app;