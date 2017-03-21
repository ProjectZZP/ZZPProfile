'use strict'

// call the packages we need
const express    = require('express');        // call express
const cors = require('cors');
const app        = express();                 // define our app using express
const bodyParser = require('body-parser');

const AWS = require('aws-sdk');
const Rx = require('rx');

const mockData = require('./mockData');
const repo = require('./src/profileRepo.js').getRepository();


// configure app to use bodyParser()
// this will let us get the data from a POST
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const port = process.env.PORT || 8080;        // set our port

// ROUTES FOR OUR API
// =============================================================================
const router = express.Router();              // get an instance of the express Router


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

        if (!req.query.entityId) {
            // return all profileId's
            repo.getAllObs()
                .map(data => (data.map(item => (item.profileId))))
                .subscribe(responseObserver(res));
            return;
        }

        // get an item by entityId
        repo.getByEntityIdObs(req.query.entityId)
            .subscribe(responseObserver(res));
    });


router.route('/profile')
    .post(function(req, res) {
        extractAndValidateDataObservable(req.body)
            .flatMap(data => repo.putProfileObs(data))
            .subscribe(responseObserver(res));
    });

router.route('/profile/:id')
    .get(function(req, res) {
        repo.getByIdObs(req.params.id)
            .subscribe(responseObserver(res));
    });


router.route('/init')
    .get(function(req, res) {
        repo.putMockObs()
            .subscribe(responseObserver(res));
    });


// REGISTER OUR ROUTES -------------------------------


// all of our routes will be prefixed with /api
app.use('/api', router);


// START THE SERVER
// =============================================================================
app.listen(port);
console.log('Magic happens on port ' + port);

function extractAndValidateDataObservable(body) {
    return Rx.Observable.create(
        observer => {
            let data;
            try {
                data = {
                    profileId: getMandatoryProperty(body, 'profileId'),
                    entityId: getMandatoryProperty(body, 'entityId'),
                    title: getMandatoryProperty(body, 'title'),
                    description: getMandatoryProperty(body, 'description'),
                    tags: body.tags
                };
            } catch (e) {
                observer.onError(e.message);
            }
            observer.onNext(data);
            observer.onCompleted();
        }
    );
}

function getMandatoryProperty(obj, propName) {
    if (!obj[propName]) throw new Error(`${propName} is mandatory`);
    return obj[propName];
}

function responseObserver(res) {
    return Rx.Observer.create(
        val => res.json(val),
        err => res.status(500).send(JSON.stringify(err)),
        () => console.log('onCompleted'));
}
