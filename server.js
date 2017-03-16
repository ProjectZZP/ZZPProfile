'use strict'

// call the packages we need
var express    = require('express');        // call express
var app        = express();                 // define our app using express
var bodyParser = require('body-parser');

const mockData = require('./mockData');


// configure app to use bodyParser()
// this will let us get the data from a POST
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var port = process.env.PORT || 8080;        // set our port

// ROUTES FOR OUR API
// =============================================================================
var router = express.Router();              // get an instance of the express Router

// test route to make sure everything is working (accessed at GET http://localhost:8080/api)
router.get('/', function(req, res) {
    res.json({ message: 'hooray! welcome to our api!' });
});



// router.get('/profile', function(req, res) {
//     res.json({ message: 'Welcome in Profile!' });
// });


router.route('/profile')

    //.post(function(req, res) {
    .get(function(req, res) {

       // let body = req.body.name; // example for Post

        let result = mockData.map((item) => (item.profileId));
        res.json(result);

    });

router.route('/profile/:id')
    .get(function(req, res) {

        let resultList = mockData.filter((item) => (item.profileId === req.params.id));

        let result = {};
        if (resultList.length === 1) {
            result = resultList[0];
        }
        res.json(result);

    });



// REGISTER OUR ROUTES -------------------------------
// all of our routes will be prefixed with /api


app.use('/api', router);


// REGISTER OUR ROUTES -------------------------------
// all of our routes will be prefixed with /api
app.use('/api', router);

// START THE SERVER
// =============================================================================
app.listen(port);
console.log('Magic happens on port ' + port);
