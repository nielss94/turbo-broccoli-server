//
// ./api/v1/user.routes.v1.js
//
var express = require('express');
var routes = express.Router();
var neo4j = require('../config/neo4j.db');
var bcrypt = require('bcrypt');

routes.get('/subscriptions/:username', function(req, res) {
    
    const username = req.params.username;

    neo4j.cypher({
        query: 'MATCH (u:User {username: $username})-[r:SUBSCRIBES_TO]->(p:Page) RETURN p',
        params : {
            username : username
        }
    },function(err,result) {
        if(err){
            res.status(500).json(err);
        }else{
            res.status(200).json(result);
        }
    });
});

routes.post('/subscriptions', function(req, res) {
    
    const userId = req.body.userId;
    const page = req.body.page;

    console.log(userId + ' ' + page);
    if(userId != null && page != null){
        neo4j.cypher({
            query: 'MATCH (p:Page {name : $page}) RETURN p',
            params: {
                page : page
            }
        }, function(err, result) {
            if(err){
                res.status(500).json(err);
            }else{
                if(result.length > 0){
                    subscribeUserToPage(userId,page,res);
                }else{
                    neo4j.cypher({
                        query: 'CREATE (p:Page {name : $page}) RETURN p',
                        params : {
                            page: page
                        }
                    },function(err,result){
                        if(err){
                            res.status(500).json(err);
                        }else{
                            subscribeUserToPage(userId, page,res);
                        }
                    });
                }
            }
        });
    }else{
        res.status(400).json({
            'error' : 'wrong body provided. please add a userId and a page'
        })
    }
});

function subscribeUserToPage(userId, page, res){
    //Check is the user is already subscribed to this page
    neo4j.cypher({
        query: 'MATCH (n:User) WHERE ID(n) = $id MATCH (x:Page {name: $page}) MATCH p=((n)-[r:SUBSCRIBES_TO]->(x)) RETURN p',
        params: {
            page: page,
            id : Number(userId)
        }
    }, function(err, result){
        if(err){
            res.status(500).json(err);
        }else{
            if(result.length > 0) {
                neo4j.cypher({
                    query: 'MATCH (n:User) WHERE ID(n) = $id MATCH (x:Page {name: $page}) MATCH p=((n)-[r:SUBSCRIBES_TO]->(x)) DETACH DELETE r',
                    params : {
                        id : Number(userId),
                        page: page
                    }
                },function(err, result){
                    if(err){
                        res.status(500).json(err);
                    }else{
                        res.status(200).json({
                            'Success' : 'User ' + userId.toString() + ' no longer subscribes to ' + page
                        })
                    }
                });
            } else{
                neo4j.cypher({
                    query: 'MATCH (u:User) WHERE ID(u) = $id MATCH (r:Page {name: $page}) CREATE (u)-[:SUBSCRIBES_TO]->(r) ',
                    params : {
                        id : Number(userId),
                        page : page
                    }
                },function(err,result) {
                    if(err){
                        res.status(500).json(err);
                    }else{
                        res.status(201).json({
                            "Success" : "User with id \'" + userId.toString() + "\' now subscribes to " + page
                        });
                    }
                });
            }
        }
    });
}

routes.delete('/subscriptions', function(req, res) {
    
    const userId = req.body.userId;
    const page = req.body.page;

    neo4j.cypher({
        query: 'MATCH (u:User) WHERE ID(u) = $id MATCH (r:Page {name: $page}) MATCH (u)-[s:SUBSCRIBES_TO]->(r) DELETE s',
        params : {
            id : Number(userId),
            page : page
        }
    },function(err,result) {
        if(err){
            res.status(500).json(err);
        }else{
            res.status(200).json({
                "Success" : "User with id \'" + userId.toString() + "\' no longer subscribes to " + page
            });
        }
    });
});

module.exports = routes;