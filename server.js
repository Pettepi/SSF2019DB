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
const bcrypt = require('bcrypt');
const session = require('express-session');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

app.use(helmet());
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.enable('trust proxy');

//const saltRound = 12; //okayish in 2018

// to use when user creates a password (or modifies existing one)

//bcrypt.hash(password, saltRound, (err, hash) => {
    // Store hash in the database
//    console.log(hash);
//});



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

//https test works
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
//  app.listen(3000);
}, err => {
  console.log('Connection to db failed : ' + err);
});

//forgot what this does
app.use(express.static('public'));

//username and password auth
passport.use(new LocalStrategy(
    (username, password, done) => {
        if (username !== process.env.username || !bcrypt.compareSync(password, process.env.password)) {
            done(null, false, {message: 'Incorrect credentials.'});
            return;
        }
        return done(null, {user: username}); // returned object usually contains something to identify the user
    }
));
app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser(((user, done) => {
    console.log('serialize');
    console.log(user);
    done(null, user)
}));

passport.deserializeUser((user, done) => {
    console.log('serialize');
    console.log(user);
    done(null, user)
});

app.use(session({
    secret: 'some s3cret value',
    resave: true,
    saveUninitialized: true,
    cookie: {secure: true, // only HTTPS
    maxAge: 2 * 60 * 60 * 1000} // 2 hours
}));


//CORS
app.get('/', cors(), (req, res) => {
    if(req.user !== undefined)
        return res.send(`Hello ${req.user.username}!`);
    res.send('Hello Secure World!');
    res.json({msg: 'This is CORS-enabled for a single route.'})
});

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

app.use('/cats', catRouter);







