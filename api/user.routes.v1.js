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

routes.get('/users', function (req, res) {
    neo4j.cypher({
        query: 'MATCH (n:User) RETURN n'
    }, function(err, result){
        if(err){
            res.status(400).json(err);
        }else{
            res.status(200).json(result);
        }
    });
});

routes.get('/users/:id', function (req, res) {

    const id = req.params.id;

    neo4j.cypher({
        query: 'MATCH (n:User) WHERE ID(n) = $id RETURN n',
        params: {
            id : Number(id)
        }
    }, function(err, result){
        if(err){
            res.status(400).json(err);
        }else{
            var user = result[0].n;
            if(result.length > 0){
                res.status(200).json({
                    username: user.properties.username,
                    email: user.properties.email,
                    id: user._id
                });
            }else{
                res.status(400).json({
                    "error" : "User not found"
                });
            }
        }
    });
});

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

routes.put('/users/:id', function (req, res) {
    const userId = req.params.id;

    const username = req.body.username;
    const email = req.body.email;

    neo4j.cypher({
        query: 'MATCH (n:User) WHERE ID(n) = 46 SET n.username = $username SET n.email = $email RETURN n',
        params : {
            id : Number(userId),
            username : username,
            email : email
        }
    }, function(err, result){
        if(err){
            res.status(500).json(err);
        }else{
            delete result[0].n.properties.password;
            res.status(200).json(result);
        }
    });
});

routes.delete('/users/:id', function (req, res) {
    //Get the given Id
    const userId = req.params.id;

    neo4j.cypher({
        query: 'MATCH (n:User) WHERE ID(n) = $id DETACH DELETE n',
        params : {
            id : Number(userId)
        }
    },function(err,result){
        if(err){
            res.status(500).json(err);
        }else{
            res.status(200).json({
                "Success" : "Successfully deleted " + userId.toString()
            });
        }
    });
});

routes.get('/users/subscriptions', function(req, res) {
  
    neo4j.cypher({
        query: 'MATCH p=()-[r:SUBSCRIBES_TO]->() RETURN p'
    },function(err,result) {
        if(err){
            res.status(500).json(err);
        }else{
            res.status(201).json(result);
        }
    });
});


module.exports = routes;