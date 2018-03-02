
'use strict';

module.exports.handler = (event, context, callback) => {
    const info = {};
    var prop;

    info['event'] = [];
    for (prop in event) {
        info['event'].push(prop + ' : ' + event[prop]);
    }

    info['context'] = [];
    for (prop in context) {
        info['context'].push(prop + ' : ' + context[prop]);
    }

    info['callback'] = [];
    for (prop in callback) {
        info['callback'].push(prop + ' : ' + callback[prop]);
    }

    callback(null, {
        statusCode: 200,
        body: JSON.stringify(info)
    });
};
