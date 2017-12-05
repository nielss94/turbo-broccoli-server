//
// ./api/v1/user.routes.v1.js
//
var express = require('express');
var routes = express.Router();
var neo4j = require('../config/neo4j.db');
var bcrypt = require('bcrypt');
var Validator = require('jsonschema').Validator;
var validator = new Validator();
var User = require('../model/user.model');

//
// Geef een lijst van alle users.
//
routes.get('/users', function (req, res) {
    neo4j.cypher({
        query: 'MATCH (n:User) RETURN n'
    }, function(err, results){
        if(err){
            res.status(400).json(err);
        }else{
            res.status(200).json(results);
        }
    });
});

//
// Retourneer één specifieke users. Hier maken we gebruik van URL parameters.
// Vorm van de URL: http://hostname:3000/api/v1/users/23
//
routes.get('/users/:id', function (req, res) {

});

//
// Voeg een user toe. De nieuwe info wordt gestuurd via de body van de request message.
// Vorm van de URL: POST http://hostname:3000/api/v1/users
//
routes.post('/users', function (req, res) {
 
    if(validator.validate(req.body, User).valid){

        var username = req.body.username;
        var password = req.body.password;
        var email = req.body.email;
        
        var salt = bcrypt.genSaltSync(5);
        var passwordHash = bcrypt.hashSync(password, salt);
        
        neo4j.cypher({
            query : 'MATCH (n:User) WHERE n.username = $username RETURN n',
            params : {
                username : username
            }
        }, function(err, result) {
            if(err){
                res.status(500).json(err);
            }else{
                if(result.length > 0){
                    res.status(400).json({
                        "Result" : "Username already exists"
                    })
                }else{
                    neo4j.cypher({
                        query: 'CREATE (u:User {username: $username, password: $password, email: $email}) RETURN u',
                        params: {
                            username: username,
                            password: passwordHash,
                            email: email
                        }
                    },function(err, result){
                        if(err){
                            res.status(400).json(err);
                        }else{
                            res.status(200).json(result);
                        }
                    });
                }
            }
        });
    }else{
        res.status(400).json({
            "error" : "Wrong body provided."
        });
    }
});

    //
    // Wijzig een bestaande user. De nieuwe info wordt gestuurd via de body van de request message.
    // Er zijn twee manieren om de id van de users mee te geven: via de request parameters (doen we hier)
    // of als property in de request body.
// 
// Vorm van de URL: PUT http://hostname:3000/api/v1/users/23
//
routes.put('/users/:id', function (req, res) {

});

//
// Verwijder een bestaande user.
// Er zijn twee manieren om de id van de users mee te geven: via de request parameters (doen we hier)
// of als property in de request body.
// 
// Vorm van de URL: DELETE http://hostname:3000/api/v1/users/23
//
routes.delete('/users/:id', function (req, res) {

});

module.exports = routes;