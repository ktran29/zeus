'use strict';

const firebaseAdmin = require('firebase-admin');

module.exports.handler = (event, context, callback) => {
    // Extract authToken and the requested resource
    var auth = event.authorizationToken;
    var methodArn = event.methodArn;

    console.log('Authorization Requested for method  : ' + methodArn);
    console.log("Authorization header                : " + auth);

    if (auth === 'b3f5537e-1e32-11e7-93ae-92361f002671') {
        console.log('Dev Auto-Authorized code used. ');
        callback(null, generatePolicy('user', "Allow", methodArn));
        return;
    }

    const info = {};
    var app;

    try {
        // Attempts to grab 'DEFAULT' Firebase App.
        // NOTE: Initializing Firebase App without a name makes it 'DEFAULT'.
        app = firebaseAdmin.app();
        console.log('Firebase app already initialized.');
    } catch (e) {
        // Attempting to grab the 'DEFAULT' app results in an exception if there is no 'DEFAULT' app.
        console.log('Firebase app not initialized yet.');
        console.log('Initializing Firebase app');
        app = firebaseAdmin.initializeApp({
            credential: firebaseAdmin.credential.cert({
                projectId: 'tack-1227',
                clientEmail: 'firebase-adminsdk-zexjm@tack-1227.iam.gserviceaccount.com',
                private_key: '-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQCeBQYGSpxTFu0y\nEnAJCfyBC2gnIsmpI7Z3bbE4eyIzq6fpA4CRZP3SQrEfTkF2EJx/IpmojbvxdGUL\n4VWlfkbydCUCBqVrl1Xysy2p/CzSOb6Bl/pgEJVzT8oLmt/wWXLSQ3AbFbiJKoaw\nm9uNAKg40AZfzK9MeJzP0hVPgWygaGLIif0nUgKNGht3znxpUVDSfmlDn/NY77Ml\nGu4GeIO6fY8I1JqrOZU8/hTghXld7q5ccMQixmbVvFYVFWnsPReFxJ6RDqvzlCnc\nygZ+O9HPHiEg2cRMowut4rr3OYX8BH0arUoXzJKwSh3pENQRz2+qHqzfNRDPqCk2\nUn/VbATnAgMBAAECggEACmbWQK/EnouRzYv9J/sqTexMTNczYxjgt/fWhJtGYxRX\nlzUNz4RQWPje4+qo0HbDdnL2nmvGBVzeEewhUSWA0hDnJrz9QpnRpIo65UeeQ7Bd\nY/Z3Gr+8trx31k+5kf6xWjnqNT42yYCtIQ8BYsS6ThMTeFbm6ye9Wsi/cl5Yoi5i\nYmeOnJlfNZ3vP4I6ITT6N6wRmgugd0Nv/vpYMFex1UMY4hsIHBlkarBs+LhlPjYb\ngwDRIRjAA3BhfU22G2ixmhx2H0IZ1LCsR4MMrbhyvKTDphhkv5YS0QZmqfDMlowV\nocdf+JdJHyGWiY5KXaMFR+7azu5mpXkM8WcwzLyckQKBgQDRJRg2JXUt3Q29INkw\nJRSYb09FEAVsNrSQ/zKXZNVMqQ1nyotdZyq3xwntI7wif8BNJFmtB2Z+YUT/syYZ\nAvXRGptFe+YVBtb5MBiNWQZdmLpOQxXyQ8inumRg15QHxwgu9kQRBFC/IQfAe/pw\nVD0tlhKVCfhzDh7q9We4fDm0xQKBgQDBa8kRaZfEubZj82n8MFnzVaMjXTBGosVT\nI8BF2zS14kP+lQx17exqkggdOa3OlVkfSK+1jelHCMwFslS05RO03XMnuh18xHm4\nb/eakX/1v/k6i2VqyADR58pT7osdKau1Z6UN4JzWYh4RSD8aR6LwIVTrsgjlNfuC\ntPtDftqluwKBgDr73jcvGzwjEsPbJsWoP4W6Jr4Qhab+SrB1+Juv6WQkbU5vVhyy\ngt6vuMHziRSluONItC3TX3mXDzGaIc1+AzvE6DORfNNDSY+fm90JVX1CHJED5IWd\nzlJXhAW35tzGqi0scQfnkqpEs336uSfC6joYEAeOd05jlh6ntWfXSSMNAoGADJ6v\nu8cb8+X6FINpQt8Uv1+zCTenUrSEE2yduvEWe1eMACxRZ9BiQIHOrbl5saTk77ma\nXUopEk1somKETFk18/MO9GScT+ux1WrYyOj9ZFdmN3+o2lK6Wve4p8lEol55qZhd\nmI4zLXmxZIdGNry90NUb6VTwZ6QiCOEuE7VPJskCgYAYo+YgIsclvLi2afrEJGPb\nHZp+9x9BpXR/at0HGM265Z/EeZMpMh/01iCaJ5doA6WLCW+GePBd6kLkvY5sIXbr\nLQ8wG9oUVXGz8kR63q/50VLVTKI7DJGxr9VZdIFYS9HXd2fFEzIhW1wRflMawL1X\ngyAtXEAjKyhc/Q+OhkrQ5Q==\n-----END PRIVATE KEY-----\n'
            })
        });
    }

    info['appName'] = firebaseAdmin.app().name;

    app.auth().verifyIdToken(auth)
        .then(function(decodedToken) {
            var uid = decodedToken.uid;
            console.log("Decoded UID: " + uid)

            callback(null, generatePolicy('user', "Allow", methodArn));
        }).catch(function(error) {
            console.log("Something went wrong decoding: " + error);

            callback(null, generatePolicy('user', "Deny", methodArn));
        });
}

var generatePolicy = function(principalId, effect, resource) {
    var authResponse: any = {};

    authResponse.principalId = principalId;
    if (effect && resource) {
        var policyDocument: any = {};
        policyDocument.Version = '2012-10-17'; // default version
        policyDocument.Statement = [];
        var statementOne: any = {};
        statementOne.Action = 'execute-api:Invoke'; // default action
        statementOne.Effect = effect;
        statementOne.Resource = 'arn:aws:execute-api:*:*:*';
        policyDocument.Statement[0] = statementOne;
        authResponse.policyDocument = policyDocument;
    }

    // Can optionally return a context object of your choosing.
    authResponse.context = {};
    authResponse.context.stringKey = "stringval";
    authResponse.context.numberKey = 123;
    authResponse.context.booleanKey = true;
    return authResponse;
}
