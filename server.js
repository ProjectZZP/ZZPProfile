'use strict'

// call the packages we need
const express    = require('express');        // call express
const cors = require('cors');
const app        = express();                 // define our app using express
const bodyParser = require('body-parser');

const AWS = require('aws-sdk');

const mockData = require('./mockData');
const repo = require('./src/profileRepo.js').getRepository();


// configure app to use bodyParser()
// this will let us get the data from a POST
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var port = process.env.PORT || 8080;        // set our port

// ROUTES FOR OUR API
// =============================================================================
var router = express.Router();              // get an instance of the express Router


const corsOptions = {
    methods: ['GET', 'POST'],
    allowedHeaders:  'Content-Type,Authorization',
};

app.use(cors(corsOptions));

// test route to make sure everything is working (accessed at GET http://localhost:8080/api)
router.get('/', function(req, res) {
    res.json({ message: 'hooray! welcome to our api!' });
});


router.route('/profile')

    .get(function(req, res) {

        console.log('req.query.entityId', req.query.entityId);
        if (!req.query.entityId) {
            // return all profileId's
            repo.getAll((err, data) => {
                if (err) {
                    res.status(500).send(JSON.stringify(err));
                    return;
                }
                let result = data.map((item) => (item.profileId));
                res.json(result);
            });
            return;
        }

        // get an item by entityId
        repo.getByEntityId(req.query.entityId, (err, data) => {
            if (err) {
                res.status(500).send(JSON.stringify(err));
                return;
            }
            res.json(data);
        })
    });


router.route('/profile')

    .post(function(req, res) {

        let data;
        try {
            data = extractAndValidateData(req.body);
        } catch(e) {
            console.log('error', e);
            res.status(500).send(e.message);
            return;
        }
        repo.putProfile(data, (err) => {
            if (err) {
                res.status(500).send(err);
                return;
            }
            res.json(data);
        })
    });

router.route('/profile/:id')
    .get(function(req, res) {

        repo.getById(req.params.id, (err, data) => {
            if (err) {
                res.status(500).send(JSON.stringify(err));
                return;
            }
            res.json(data);
        })
    });


router.route('/init')
    .get(function(req, res) {

        repo.putMock((err, data) =>  {
            let result = {
                "err": err,
                "data": data
            };
            res.json(result);
        })
    });


// REGISTER OUR ROUTES -------------------------------


// all of our routes will be prefixed with /api
app.use('/api', router);


// START THE SERVER
// =============================================================================
app.listen(port);
console.log('Magic happens on port ' + port);



function extractAndValidateData(body) {
    if (!body.profileId) throw new Error("profileId is mandatory");
    if (!body.entityId) throw new Error("entityId is mandatory");
    if (!body.title) throw new Error("title is mandatory");
    if (!body.description) throw new Error("description is mandatory");

    return {
        profileId: body.profileId,
        entityId: body.entityId,
        title: body.title,
        description: body.description,
        tags: body.tags
    };
}