'use strict';

const UncaughtServerError = require('./Errors.js').UncaughtServerError;

const path = require('path');

module.exports = function ActionRequestHandler(fileName, tryToGetResults) {

    const functionName = path.parse(fileName).name;

    return ((params) => {

        const TAG = `[Action] [${functionName}]`;

        console.log(TAG);

        return Promise.resolve()

        .then(() => tryToGetResults(params))

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

            console.error(TAG, e);
            throw finalError;
        });
    });

};
