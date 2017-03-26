'use strict';

//console.log('process.npm_config_myVar', process.env.npm_config_bucket);

const bucket = process.env.npm_config_bucket || 'zinder-s3';

console.log('bucket', bucket);

const key = 'repositories/profile/data.json';

const mockData = require('../mockData');

const AWS = require('aws-sdk');
const Rx = require('rx');

exports.getRepository = function(context) {
    const s3 = new AWS.S3();
    const dynamo = new AWS.DynamoDB.DocumentClient({region : 'us-west-2'});
    return new ProfileRepo(s3, dynamo);
};

class ProfileRepo {

    constructor(s3, dynamo) {
        this.s3 = s3;
        this.dynamo = dynamo;
    }

    getAllObs() {
        return this._getDataObs();
    }


    getByIdObs(profileId) {
        return this._getDataObs()
            .map(val => ( val.find(item => (item.profileId === profileId))));
    }

    getByEntityIdObs(entityId) {
        return this._getDataObs()
            .map(val => ( val.filter(item => (item.entityId === entityId))));
    }

    putProfileObs(profile) {
        return this._getDataObs()
            .map(data => (putProfileInDataArray(data, profile)))
            .flatMap(data => (this._putDataObs(data)))
            .flatMap(() => (this._putDynamoObs(profile)))
            .map(() => (profile));
    }

    putMockObs() {
        return this._putDataObs(mockData);
    }

    _putDataObs(body) {
        const param = {Bucket: bucket, Key: key, Body: JSON.stringify(body), ContentType: 'application/json'};
        const upload = Rx.Observable.fromNodeCallback(this.s3.upload, this.s3);
        return upload(param);
    }


    _getDataObs() {
        const param = {Bucket: bucket, Key: key, ResponseContentType: 'application/json'};
        const getObject = Rx.Observable.fromNodeCallback(this.s3.getObject, this.s3);
        return getObject(param)
            .map(data => JSON.parse(data.Body));
    }


    _putDynamoObs(profile) {
        const param = {
            TableName: 'event',
            ReturnConsumedCapacity: 'TOTAL',
            Item: Object.assign(profile, {eventId: 'singleton'})
        };
        console.log('profile to put in Dynamo:', param);
        return Rx.Observable.create(observer => {
            this.dynamo.put(param, (err, data) => {
                console.log('Result from dynamo put', err, data);
                if (err)
                    observer.onError(err);
                observer.onNext(data);
                observer.onCompleted();
            })
        });
    }
}

function putProfileInDataArray(data, profile) {
    const newData = data.filter(item => (item.profileId !== profile.profileId));
    newData.push(profile);
    return newData;
}