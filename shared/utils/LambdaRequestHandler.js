'use strict';

const extractRequestArgs = require('./extractRequestArgs.js');
const stringifyObject = require('./stringifyObject.js');
const validate = require('./SchemaValidator.js').validate;
const validAPIVersions = require('../validAPIVersions.js');
const UncaughtServerError = require('./Errors.js').UncaughtServerError;
const UnsupportedAPIError = require('./Errors.js').UnsupportedAPIError;

// This is a convenience method that generates a function in the
// standard lamda handler format. This takes a JSON schema (requestSchema)
// used to validate the incoming request parameters and then executes a given
// promise chain (tryToGetResults) that uses the request parameters to
// retrieve some expected results.
module.exports = function LambdaRequestHandler(requestSchema, tryToGetResults) {

    const cors = true;
    const headers = cors ? {
        'Access-Control-Allow-Origin': '*'
    } : {
    };

    // Lambda handler function
    return (event, context, callback) => {

        // Extract args from various different places in the request
        // (i.e. headers, body, url, etc.)
        const request = extractRequestArgs(event);

        // Ensure proper request format
        validate(request, requestSchema)

        // Perform given functionality that handles the request
        // This is the functionality that defines your current function
        // Throws UnsupportedAPIError if invalid API Version is passed in
        .then(() => {
            if (validAPIVersions.indexOf(request.apiVersion) < 0) {
                throw new UnsupportedAPIError(request.apiVersion);
            }
            return tryToGetResults(request);
        })

        // standardize successful execution with a 200 response
        // and a body containing the stringified results
        .then((result) => {
            console.log('Returning with response:', stringifyObject(result));

            callback(null, {
                statusCode: 200,
                headers: headers,
                body: JSON.stringify(result)
            });
        })

        // Sends error back to client, defaulting to UncaughtServerError
        .catch((e) => {

            let finalError = e;

            // Sets UncaughtServerError as default error format
            if (!e || !e.code) {
                const message =
                    (e && e.message) || // use message if it exists
                     e || // if not just use the error itself
                    'An unknown error occured.'; // fuck it, theres nothing here

                finalError = new UncaughtServerError(message);
            }

            const info = {
                error: finalError,
                logGroupName: context.logGroupName,
                logStreamName: context.logStreamName
            };
            callback(null, {
                statusCode: finalError.code,
                headers: headers,
                body: JSON.stringify(info)
            });
        });
    };
};
