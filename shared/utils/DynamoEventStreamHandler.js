'use strict';

const stringifyObject = require('./stringifyObject.js');
const UncaughtServerError = require('./Errors.js').UncaughtServerError;
const InvalidArgumentError = require('./Errors.js').InvalidArgumentError;

const TAG = '[DynamoEventStreamHandler]';

// This is a convenience method that generates a function to handle calls from
// dynamo db's event stream. The given `tryToGetResults` function is called with
// the Records from the current event, which are guaranteed to be defined.
module.exports = function DynamoEventStreamHandler(tryToGetResults) {

    // Lambda handler function
    return (event, context, callback) => { // eslint-disable-line no-unused-vars

        // Extract records to pass into given function
        const records = event.Records;

        // Start Promise chain
        return Promise.resolve()

        // Argument validation
        .then(() => {
            if (!records) {
                throw new InvalidArgumentError('event.Records must be defined');
            }
        })

        // Perform given functionality that handles the request
        // This is the functionality that defines your current function
        .then(() => {
            return tryToGetResults(records);
        })

        // Standardize successful execution
        .then((result) => {
            console.log(TAG, 'Successfully processed Dynamo event stream processed');
            context.succeed(result);
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

            // add log info to error
            finalError.logGroupName = context.logGroupName;
            finalError.logStreamName = context.logStreamName;

            console.error(TAG, finalError);

            // Workaround for lambda functions retrying on error
            context.succeed(finalError);
        });
    };
};
