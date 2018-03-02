'use strict';

const stringifyObject = require('./stringifyObject.js');

module.exports = function extractRequestArgs(event) {
    var args = {};

    const queryStringArgs = event.queryStringParameters;

    if (queryStringArgs) {
        Object.keys(queryStringArgs).forEach((key) => {
            args[key] = queryStringArgs[key];
        });
    }

    const pathArgs = event.pathParameters;

    if (pathArgs) {
        Object.keys(pathArgs).forEach((key) => {
            if (args[key]) {
                console.error(`Duplicate parameters found! queryStringParameters: ${queryStringArgs}, pathParameters: ${pathArgs}`);
            }

            args[key] = pathArgs[key];
        });
    }

    const bodyArgs = JSON.parse(event.body);

    if (bodyArgs) {
        Object.keys(bodyArgs).forEach((key) => {
            if (args[key]) {
                console.error(`Duplicate parameters found! queryStringParameters: ${queryStringArgs}, pathParameters: ${pathArgs}, body: ${bodyArgs}`);
            }

            args[key] = bodyArgs[key];
        });
    }

    console.log('Extracted request args:', stringifyObject(args));

    return args;
};
