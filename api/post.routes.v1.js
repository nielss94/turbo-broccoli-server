var express = require('express');
var routes = express.Router();
var mongodb = require('../config/mongo.db');
var Post = require('../model/post.model');

routes.get('/posts', function (req, res) {
    res.contentType('application/json');
    
    Post.find({})
        .then(function (posts) {
            res.status(200).json(posts);
        })
        .catch((error) => {
            res.status(400).json(error);
        });
});

routes.get('/posts/page/:page', function (req, res) {
    res.contentType('application/json');
    
    let page = req.params.page;

    Post.find({ page : page})
    .then(function (posts) {
        res.status(200).json(posts);
    })
    .catch((error) => {
        res.status(400).json(error);
    });   
});

routes.get('/posts/:id', function (req, res) {
    res.contentType('application/json');
    
    let id = req.params.id;

    Post.find({ _id :id.toString()})
    .then(function (post) {
        res.status(200).json(post);
    })
    .catch((error) => {
        res.status(400).json(error);
    });   
});

//Get all comments from a post
routes.get('/posts/:id/comments', function (req, res) {
    let id = req.params.id;

    Post.findById(id)
    .then(function (post) {
        console.log(post);
        if(post.comments.length > 0){
            res.status(200).json(post.comments);
        }else{
            res.status(204).json({
                "error" : "this post has no comments"
            });
        }
    })
    .catch((error) => {
        res.status(400).json(error);
    });   
});

//Get 1 comment from a post
routes.get('/posts/:id/comments/:commentId', function (req, res) {
    let id = req.params.id;
    let commentId = req.params.commentId;

    Post.findById(id)
    .then(function (post) {
        post.comments.forEach(element => {
            if(element._id == commentId){
                res.status(200).json(element);
            }
        });
        res.status(400).json({
            "error" : "comment not found in post \'" + post.title + "\'"
        })
    })
    .catch((error) => {
        res.status(400).json(error);
    });   
});

routes.post('/posts', function(req,res) {
    const body = req.body;

    const rec = new Post(body);

    rec.save()
        .then(() => {
            res.status(200).json(rec);
        }).catch((error) => {
            res.status(400).json(error);
    });
});

routes.post('/posts/:id/comments', function(req,res) {
    const id = req.params.id;
    const body = req.body;
    
    Post.findById(id)
        .then((post) =>{
            body.postId = post._id.toString();
            post.comments.push(body);
            post.save()
                .then(() =>{
                    res.status(200).json(post);
                })
                .catch((error) =>{
                    res.status(400).json(error);
                })
        })
        .catch ((error) => {
            res.status(400).json(error);
        });
});

routes.delete('/posts/:id', function(req,res){
    //Get the given Id
    const postId = req.params.id;
    
    //Remove the post if it exists
    Post.findByIdAndRemove({_id: postId})
    .then((post) => {
        if(post)
            res.status(200).json(post);
        else
            res.status(400).json({NotFound: "post not found"});
    })
    .catch((error) => {
        res.status(400).json(error);
    });
});

routes.delete('/posts/:id/comments/:commentId', function(req,res){
    //Get the given Id
    const postId = req.params.id;
    const commentId = req.params.commentId;
    
    //Remove the post if it exists
    Post.findById(postId)
    .then((post) => {
        if(post){
            found = false;
            post.comments.forEach( function(element,i) {
                if(element._id == commentId){
                    found = true;
                    post.comments.splice(i,1);
                    post.save()
                        .then(()=>{
                            res.status(200).json(element);
                        })
                        .catch(() => {
                            res.status(200).json({
                                "error" : "Failed to delete comment. try again."
                            })
                        })
                }
            });
            if(!found){
                res.status(400).json({
                    "error" : "comment not found in post \'" + post.title + "\'"
                });
            }
        }else{
            res.status(400).json({NotFound: "post not found"});
        }
    })
    .catch((error) => {
        res.status(400).json(error);
    });
});

routes.put('/posts/:id/comments/:commentId', function(req,res){
    
    const id = req.params.id;
    const commentId = req.params.commentId;
    
    const content = req.body.content;
    const user = req.body.user;
    const postId = req.body.postId;
    const downCoins = req.body.downCoins;
    const upCoins = req.body.upCoins;

    Post.findById(id)
        .then(function (post) {
            found = false;
            post.comments.forEach((element) => {
                if(element._id == commentId){
                    found = true;

                    if (content) {element.set('content', content);}
                    if (postId) {element.set('postId', postId);}
                    if (downCoins) {element.set('downCoins', downCoins);}
                    if (upCoins) {element.set('upCoins', upCoins);}
                    if (user) {element.set('user', user);}
                    post.save()
                    .then(() => {
                        res.status(200).json(element)
                    })
                    .catch((error) => {
                        res.status(400).json(error);
                    });
                }
            });
            if(!found){
                res.status(400).json({
                    "error" : "could not find comment in post \'" + post.title + "\'."
                })
            }
        })
        .catch((error) => {
            res.status(400).json(error);
        });
});

routes.put('/posts/:id', function(req,res){
    
    const id = req.params.id;

    const title = req.body.title;
    const content = req.body.content;
    const page = req.body.page;
    const downCoins = req.body.downCoins;
    const upCoins = req.body.upCoins;
    const user = req.body.user;

    Post.findById(id)
        .then(function (post) {
            //Update current recipe
            if (title) {post.set('title', title);}
            if (content) {post.set('content', content);}
            if (page) {post.set('page', page);}
            if (downCoins) {post.set('downCoins', downCoins);}
            if (upCoins) {post.set('upCoins', upCoins);}
            if (user) {post.set('user', user);}
            post.save()
            .then(() => {
                res.status(200).json(post)
            })
            .catch((error) => {
                res.status(400).json(error);
            });
        })
        .catch((error) => {
            res.status(400).json(error);
        });
});

module.exports = routes;