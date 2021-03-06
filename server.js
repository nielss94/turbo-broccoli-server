//
// server.js
//
var http = require('http');
var express = require('express');
var bodyParser = require('body-parser')
var logger = require('morgan');
var mongodb = require('./config/mongo.db');
var userroutes_v1 = require('./api/user.routes.v1');
var auth_routes_v1 = require('./api/authentication.routes.v1');
var post_routes_v1 = require('./api/post.routes.v1');
var subscription_routes_v1 = require('./api/subscription.routes.v1');
var config = require('./config/env/env');
var configKey = require('./config/config');
var expressJWT = require('express-jwt');

var app = express();


// bodyParser zorgt dat we de body uit een request kunnen gebruiken,
// hierin zit de inhoud van een POST request.
app.use(bodyParser.urlencoded({
    'extended': 'true'
})); // parse application/x-www-form-urlencoded
app.use(bodyParser.json()); // parse application/json
app.use(bodyParser.json({
    type: 'application/vnd.api+json'
})); // parse application/vnd.api+json as json


// configureer de app
app.set('port', (process.env.PORT || config.env.webPort));
app.set('env', (process.env.ENV || 'development'))

// Installeer Morgan als logger
app.use(logger('dev'));

// CORS headers
app.use(function (req, res, next) {
    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', process.env.ALLOW_ORIGIN || 'http://localhost:4200');
    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type,Authorization');
    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);
    // Pass to next layer of middleware
    next();
});

// Installeer de routers
app.use('/api/v1', auth_routes_v1);
app.use('/api/v1', userroutes_v1);
app.use('/api/v1', post_routes_v1);
app.use('/api/v1', subscription_routes_v1);


//Beveilig alle URL routes, tenzij het om /login of /register gaat.
app.use(expressJWT({
    secret: configKey.secretkey
}).unless({
    path: [
        { url: '/api/v1/login', methods: ['POST'] },
        { url: '/api/v1/users', methods: ['POST'] }
    ]
}));

// Errorhandler voor express-jwt errors
// Wordt uitgevoerd wanneer err != null; anders door naar next().
app.use(function (err, req, res, next) {
    // console.dir(err);
    var error = {
        message: err.message,
        code: err.code,
        name: err.name,
        status: err.status
    }
    res.status(401).send(error);
});

// Fallback - als geen enkele andere route slaagt wordt deze uitgevoerd. 
app.use('*', function (req, res) {
    res.status(400);
    res.json({
        'error': 'Deze URL is niet beschikbaar.'
    });
});

// Installatie klaar; start de server.
app.listen(config.env.webPort, function () {
    console.log('De server luistert op port ' + app.get('port'));
    console.log('Zie bijvoorbeeld http://localhost:3000/api/v1/users');
});

// Voor testen met mocha/chai moeten we de app exporteren.
module.exports = app;