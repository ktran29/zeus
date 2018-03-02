'use strict';

module.exports.handler = (event, context, callback) => {

    const code = event.pathParameters && Number(event.pathParameters.errorCode);

    var errorType;
    var message;

    if (code === 200) {
        errorType = 'OK';
        message = 'Success!';
    } else if (code === 400) {
        errorType = 'BadRequest';
        message = 'Invalid input data.';
    } else if (code === 401) {
        errorType = 'Unauthorized';
        message = 'Client not authorized to access resource.';
    } else if (code === 403) {
        errorType = 'Forbidden';
        message = 'Client is not authenticated.';
    } else if (code === 404) {
        errorType = 'NotFound';
        message = 'Attempting to access non-existant resource.';
    } else if (code === 429) {
        errorType = 'TooManyRequests';
        message = 'Client is sending too many requests.';
    } else if (code === 500) {
        errorType = 'InternalServerError';
        message = 'An unknown error has occurred. Please try again.';
    } else if (code === 502) {
        errorType = 'BadGateway';
        message = 'A dependent service is throwing errors.';
    } else if (code === 503) {
        errorType = 'ServiceUnavailable';
        message = 'Service is unavailable at the moment. Please try again';
    } else if (code === 504) {
        errorType = 'GatewayTimeout';
        message = 'A dependent service is timing out.';
    } else {
        errorType = '(╯°□°)╯︵ ┻━┻.';
        message = 'You passed in an error code that isn\'t a supported HTTP Status code.' +
            'The valid codes you can pass in are: 200, 400, 401, 403, 404, 429, 500, 502, 503, 504.';
    }

    const response = {
        statusCode: code,
        body: JSON.stringify({
            errorType: errorType,
            message: message,
            requestId: context.awsRequestId,
            statusCode: code
        }),
    };

    callback(null, response);
};
