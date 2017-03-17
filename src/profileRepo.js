'use strict';

//console.log('process.npm_config_myVar', process.env.npm_config_bucket);

const bucket = process.env.npm_config_bucket || 'zinder-s3';

console.log('bucket', bucket);

const key = 'repositories/profile/data.json';

const async = require("async");

const mockData = require('../mockData');

const AWS = require('aws-sdk');

exports.getRepository = function(context) {
    const s3 = new AWS.S3();
    return new ProfileRepo(s3);
}

class ProfileRepo {

    constructor(s3) {
        this.s3 = s3;
    }

    getAll(callback) {
        this._getData(callback);
    }

    getById(profileId, callback) {
        this._getData((err, data) => {
            if (err) {
                callback(err);
                return;
            }
            let resultList = data.filter((item) => (item.profileId === profileId));
            if (resultList.length === 1) {
                callback(null, resultList[0]);
                return;
            }
            // not found
            callback(null, {});
        });

    }

    getByEntityId(entityId, callback) {
        this._getData((err, data) => {
            if (err) {
                callback(err);
                return;
            }
            let resultList = data.filter((item) => (item.entityId === entityId));
            callback(null, resultList);
        });
    }

    putProfile(profile, callback) {
        async.waterfall(
            [
                (done) => {
                    this._getData((err, data) => {
                        done(err, data);
                    });
                },
                (data, done) => {
                    const newData = data.filter((item) => (item.profileId !== profile.profileId));
                    newData.push(profile);
                    this._putData(newData, (err) => {
                        done(err);
                    })
                }
            ],
            function (err) {
                callback(err);
            }
        );
    }

    putMock(callback) {
        this._putData(mockData, callback);
    }

    _putData(body, callback) {
        const param = {Bucket: bucket, Key: key, Body: JSON.stringify(body), ContentType: 'application/json'};
        console.log("s3", param);
        this.s3.upload(param, (err, data) => {
            callback(err, data);
        });
    }

    _getData(callback) {
        const param = {Bucket: bucket, Key: key, ResponseContentType: 'application/json'};
        this.s3.getObject(param, (err, data) => {
            if (err) {
                callback (err);
                return;
            }
            let result = JSON.parse(data.Body);
            callback (err, result);
        });
    }
}
