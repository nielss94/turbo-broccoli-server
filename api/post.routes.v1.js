var express = require('express');
//var hal = require('hal');
var routes = express.Router();
var mongodb = require('../config/mongo.db');
var Post = require('../model/post.model');

routes.get('/recipes', function (req, res) {
    res.contentType('application/json');

    Recipe.find({})
        .then(function (recipes) {
            // ?Page verkrijgen, geen page dan is page 1 && limit zetten
            const page = req.query.page || 1;
            const limit = 10;

            //Hoofd Hal object maken
            let recipesCollection = new hal.Resource({ limit: limit, amount: recipes.length }, '/recipes?page=' + page );

            //Verklein de lijst met recepten naar 1tje teveel
            const slicedList = recipes.slice((page - 1) * limit, 2 * (page * limit) + 1);

            //Als er (limit + 1) recepten zijn dan is er een next
            if (slicedList.length === Number(limit) + 1) {
                const nextPage = page > 0 ? Number(page) + 1 : 2;
                recipesCollection.link(
                    new hal.Link("next", { href: "/recipes?page=" + nextPage })
                );

                //Haal het (limit + 1)e recept weg
                slicedList.pop();
            }

            //Voeg een previous toe als we niet op pagina 1 zitten
            if (page !== 1) {
                recipesCollection.link(
                    new hal.Link("previous", { href: "/recipes?page=" + (Number(page) - 1) })
                );
            }

            //Recepten zelf mee embeden
            let embededRecipes = [];
            slicedList.forEach(recipe => {
                embededRecipes.push(new hal.Resource(recipe.toObject(), '/recipes/' + recipe._id));
            });
            recipesCollection.embed('recipes', embededRecipes);

            //Stuur status 200 met HalJson
            res.status(200).json(recipesCollection);
        })
        .catch((error) => {
            res.status(400).json(error);
        });
});

//Update a single recipe
routes.put('/recipes/:id', function (req, res) {
    res.contentType('application/json');
    const id = req.params.id;

    //Retrieve post data
    const name = req.body.name || '';
    const imagePath = req.body.imagePath || '';
    const description = req.body.description || '';
    const ingredients= req.body.ingredients;

    Recipe.findById(id)
        .then(function (recipe) {

            //Update current recipe
            let instanceUpdated = false;
            if (name !== '') {recipe.set('name', name); instanceUpdated = true}
            if (imagePath !== '') {recipe.set('imagePath', imagePath); instanceUpdated = true}
            if (description !== '') {recipe.set('description', description); instanceUpdated = true}
            if (ingredients !== '') {recipe.set('ingredients', ingredients); instanceUpdated = true}
            if (instanceUpdated) recipe.save()
            .then(() => {

                //Create HAL object
                const recipeHAL = new hal.Resource(recipe.toObject(), '/recipes/' + id);

                //Send HAL-JSON response with status OK (200)
                res.status(200).json(recipeHAL)
            })
            .catch((error) => {
                res.status(400).json(error);
            });
        })
        .catch((error) => {
            res.status(400).json(error);
        });
});

//Delete a single recipe
routes.delete('/recipes/:recipeId', function(req,res) {
    res.contentType('application/json');
    
    //Get the given Id
    var recipeId = req.params.recipeId;
    
    //Remove the recipe if it exists
    Recipe.findByIdAndRemove({_id: recipeId})
    .then((recp) => {
        if(recp)
            res.status(200).json(recp);
        else
            res.status(400).json({NotFound: "recipe not found"});
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

module.exports = routes;