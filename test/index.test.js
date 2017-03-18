// index.test.js
'use strict';

var expect = require( 'chai' ).expect;

//var myLambda = require('../src/index');

describe('myModule', function() {
    process.env.DEBUG = true;

    [
        "Richard",
        "rhyatt"
    ].forEach( function( validName ) {

        it('successful invocation: name=' + validName,
            function( done ) {

                var context = {}
                var callback = function(err, result) {
                    expect(result.valid).to.be.true;
                    expect(err).to.be.null;
                    done();
                }
  //              myLambda.handler( { name: validName }, context, callback);
                done();
            });
    });

    [
        "Fred",
        undefined
    ].forEach( function( invalidName ) {

        it('fail: when name is invalid: name=' + invalidName,
        function( done ) {

            var context = {}
            var callback = function(err, result) {
                expect(result).to.be.null;
                expect(err.message).to.equal('unknown name');
                done();
            }
            //myLambda.handler( { name: invalidName }, context, callback);
            done();
        });
    });

    it('Rx test',
        function( done ) {

            this.timeout(5000);
            //var Rx = require('rxjs/Rx');
            var Rx = require('rx');

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

            // s3.getObject(param, (err, data) => {
            //     if (err) {
            //         done(err);
            //         return;
            //     }
            //     let result = JSON.parse(data.Body);
            //     console.log(result);
            //     done();
            // });

           // const upload = s3.getObject(param);
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

            function getObjectRs2Observer(p) {
                return Rx.Observable.create(observer => {
                    s3.getObject(param, (err, data) => {
                        console.log('CB2...', p);
                        if (err)
                            observer.onError(err);
                        let result = JSON.parse(data.Body);
                        observer.onNext(result);
                        observer.onCompleted();
                    });
                });

            }
            // getObjectRs
            //     .subscribe(val => {
            //         console.log('getObject result:', val);
            //         done();
            //     }, err => {
            //         console.log('err:', err);
            //         done();
            //     });

            getObjectRs
                .map(val => {
                    console.log('in map', val)
                    return 'dfdfd';
                })
                .flatMap(val => {
                    console.log('flatmap', val);
                    return getObjectRs2Observer('val');
                })
                .subscribe(val => {
                    console.log('getObject result:', val);
                    done();
                }, err => {
                    console.log('err:', err);
                    done();
                });


            //upload$.subscribe(v => {console.log(v); done()}); // will print file details


            // const subscribe = myBufferedInterval.subscribe(val => console.log(' Buffered Values:', val));
            // console.log(a);

//            done();
        }
    );



});
