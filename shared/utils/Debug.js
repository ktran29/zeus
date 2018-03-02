(() => {
    'use strict';

    module.exports.throwError = (message, info) => {
        console.error.apply(console, [`Error: ${message}`].concat(info));
        throw {
            message: message,
            code: 400
        };
    };

    module.exports.warnAndContinue = (message, info) => {
        console.warn.apply(console, [`Warning: ${message}`].concat(info));
    };
})();
