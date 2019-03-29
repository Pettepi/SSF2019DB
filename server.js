'use strict';
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const url = 'mongodb://localhost:27017/';
const fs = require('fs');
const https = require('https');
const http = require('http');
const catRouter = require('./routers/catRouter');
require('dotenv').config();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.enable('trust proxy');

//username & pw auth
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

app.use ((req, res, next) => {
    if (req.secure) {
        // request was via https, so do no special handling
        next();
    } else {
        // request was via http, so redirect to https
        res.redirect('https://' + req.headers.host + req.url);
    }
});

//HTTPS
const sslkey = fs.readFileSync('ssl-key.pem');
const sslcert = fs.readFileSync('ssl-cert.pem');

const options = {
    key: sslkey,
    cert: sslcert
};

https.createServer(options, app).listen(3000);

//https test works yay
app.get('/', (req, res) =>{
   res.send('HTTPS security works.')
});

//redirect http to https
http.createServer((req, res) => {
    res.writeHead(301, { 'Location': 'https://localhost:3000' + req.url });
    res.end();
}).listen(8080);

//establish connection to mongoDB
mongoose.connect(url, {useNewUrlParser: true}).then(() => {
  console.log('Connected successfully.');
  app.listen(30000);
}, err => {
  console.log('Connection to db failed : ' + err);
});

//forgot what this does
app.use(express.static('public'));

//username and password auth
passport.use(new LocalStrategy(
    (username, password, done) => {
        if (username !== process.env.username || password !== process.env.password) {
            done(null, false, {message: 'Incorrect credentials.'});
            return;
        }
        return done(null, {}); // returned object usually contains something to identify the user
    }
));
app.use(passport.initialize());


//login
app.post('/login',
    passport.authenticate('local', {
        successRedirect: '/all',
        failureRedirect: '/test',
        session: false })
);

app.get('/test', (req, res) => {
   res.send('login failed');
});

app.get('/hello', (req, res) => {
    res.send('received request to URL GET' +req.path);
});

//restful stuff
app.get('/go/:param1/:param2/', (req, res) => {
    console.log(req.params);
    console.log(req.query);
    res.send('got '+req.method+'request to'+req.path+'with parameters'+req.params);
});


app.post('/go:param1/', (req, res) => {
   console.log(req.params);
   console.log(req.query);
   console.log(req.body);
    res.send('got'+req.method+'request to'+req.path+
        'with body: '+JSON.stringify(req.body));
});

app.get('/', (req, res) => {
  res.send('Hello World!', 'Cats');
});

app.use('/cats', catRouter);







