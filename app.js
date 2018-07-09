const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const http = require('http');
var mailer = require('nodemailer');
const app = express();


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({'extended':'false'}));
app.use(express.static(path.join(__dirname, 'dist')));


var smtpTransport = mailer.createTransport("SMTP",{
  service: "Gmail",
  auth: {
    user: 'adrienleteinturier@gmail.com',
    pass: ''
  }
});


app.get('*', function(req, res, next) {
  res.sendFile(path.join(__dirname, 'dist/index.html'));
});

app.post('/action',function(req,res,next){
  var mailOptions = {
    from: req.body.email,
    to: 'adrienleteinturier@gmail.com',
    subject: 'Message de ' + req.body.username +', Adrien Leteinturier site Web',
    text: req.body.message,
    html: '<p>Message de'+ req.body.username +'</p><b>' + req.body.message + '</b>'
  };
  smtpTransport.sendMail(mailOptions, function(error, response){
    if(error){
      console.log("Erreur lors de l'envoie du mail!");
      console.log(error);
    }else{
      console.log("Mail envoyé avec succès!")
    }
    smtpTransport.close();
  });
});


const port = process.env.PORT || '80';
app.set('port',port);

const server = http.createServer(app);
server.listen(port,function(){
  console.log('Running Baby');
});


module.exports = app;