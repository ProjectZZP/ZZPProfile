// index.test.js
'use strict';

const expect = require( 'chai' ).expect;
const Rx = require('rx');
//var myLambda = require('../src/index');

describe('myModule', function() {
    process.env.DEBUG = true;


    it('Rx test',
        function( done ) {

            this.timeout(5000);
            //var Rx = require('rxjs/Rx');


            let a = Rx.Observable.of(1,2,3)
                .map(function (x) { return x + '!!!'; })
                .subscribe(val => console.log(' Buffered Values:', val));

            process.argv.forEach(function (val, index, array) {
                console.log(index + ': ' + val);
            });

            const bucket = process.env.npm_config_bucket || 'zinder-s3';
            console.log('bucket', bucket);
            const key = 'repositories/profile/data.json';
            const AWS = require('aws-sdk');
            const s3 = new AWS.S3();

            const param = {Bucket: bucket, Key: key, ResponseContentType: 'application/json'};

            const getObjectRs = Rx.Observable.create(observer => {
                s3.getObject(param, (err, data) => {
                    console.log('CB1...');
                    if (err)
                        observer.onError(err);
                    let result = JSON.parse(data.Body);
                    observer.onNext('Result1');
                    observer.onCompleted();
                });
            });

            const param2 = {Bucket: bucket, Key: key, ResponseContentType: 'application/json'};
            function getObjectRs2Observer(p) {
                const getObject = Rx.Observable.fromNodeCallback(s3.getObject, s3);
                return getObject(param2)
                   .map(data => JSON.parse(data.Body));
            }

            function loggingObserver(done) {
                return Rx.Observer.create(
                    val => console.log('getObject result:', val),
                    err => {console.log('err:', err); done()},
                    () => {console.log('onCompleted'); done()});
            }


            getObjectRs
                .map(val => {
                    console.log('in map', val)
                    return 'dfdfd';
                })
                .flatMap(val => {
                    console.log('flatmap', val);
                    return getObjectRs2Observer('val');
                })
                .subscribe(loggingObserver(done));

            // var rename = Rx.Observable.fromNodeCallback(s3.getObject, s3);
            // var source = rename(param);
            // var subscription = source.subscribe(
            //     function (d) {
            //         console.log('Next: success!', d);
            //     },
            //     function (err) {
            //         console.log('Error: ' + err);
            //         done();
            //     },
            //     function () {
            //         console.log('Completed');
            //         done()
            //     });

            // let fs = require('fs');
            // var rename = Rx.Observable.fromNodeCallback(fs.stat);
            // var source = rename('file1.txt');
            // var subscription = source.subscribe(
            //     function (d) {
            //         console.log('Next: success!', d);
            //     },
            //     function (err) {
            //         console.log('Error: ' + err);
            //         done();
            //     },
            //     function () {
            //         console.log('Completed');
            //         done()
            //     });

// => Next: success!
// => Completed

        }
    );



});
