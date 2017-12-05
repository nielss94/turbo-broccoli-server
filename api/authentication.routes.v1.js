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

//
// Hier gaat de gebruiker inloggen.
// Input: username en wachtwoord
// ToDo: 
//	 - zoek de username in de database, en vind het password dat opgeslagen is
// 	 - als user gevonden en password matcht, dan return valide token
//   - anders is de inlogpoging gefaald - geef foutmelding terug.
//
router.post('/login', function(req, res) {

    if(validator.validate(req.body,Login).valid){
        // De username en pwd worden meegestuurd in de request body
        var username = req.body.username;
        var password = req.body.password;
        
        // Dit is een dummy-user - die haal je natuurlijk uit de database.
        // Momenteel zetten we ze als environment variabelen. (Ook op Heroku!)
        // Dit veranderen naar zoeken in DB!
        
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
                    var user = result[0].n.properties;
                    if (bcrypt.compareSync(password, user.password)) {
                        var token = auth.encodeToken(username);
                        res.status(200).json({
                            "username" : user.username,
                            "email" : user.email,
                            "token": token,
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


// Hiermee maken we onze router zichtbaar voor andere bestanden. 
module.exports = router;