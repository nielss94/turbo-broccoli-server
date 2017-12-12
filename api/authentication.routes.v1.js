//
// ./api/authentication.routes.v1.js
//
var express = require('express');
var router = express.Router();
var bcrypt = require('bcrypt');
var auth = require('../auth/authentication');
var neo4j = require('../config/neo4j.db');
var Validator = require('jsonschema').Validator;
var Login = require('../model/login.model');
var validator = new Validator();

router.post('/login', function(req, res) {

    if(validator.validate(req.body,Login).valid){
        // De username en pwd worden meegestuurd in de request body
        var username = req.body.username;
        var password = req.body.password;
        
        neo4j.cypher({
            query: 'MATCH (n:User) WHERE n.username = $username RETURN n',
            params: {
                username : username
            }
        }, function(err,result){
            if(err){
                res.status(500).json(err);
            }else{
                if(result.length > 0){
                    var user = result[0].n;
                    if (bcrypt.compareSync(password, user.properties.password)) {
                        var token = auth.encodeToken(username);
                        res.status(200).json({
                            id: user._id,
                            username : user.properties.username,
                            email : user.properties.email,
                            token: token,
                        });
                    } else {
                        res.status(401).json({ "error": "Invalid credentials, bye" })
                    }
                }else{
                    res.status(400).json({
                        "error" : "User not found"
                    })
                }
            }
        });
    }else{
        res.status(400).json({
            "error" : "Wrong body provided."
        });
    }
});


module.exports = router;