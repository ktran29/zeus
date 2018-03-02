'use strict';

/////////////////////////
//    Custom Errors
/////////////////////////

// Thrown when a request fails to validate against the schema
class MalformedRequestError extends Error {
    constructor(message, schema) {
        super();
        this.message = `MalformedRequestError: Failed to validate ${schema}: ${message}`;
        this.code = 400;
    }
}

// Thrown when an object that doesn't exist is attempted
// to be retrieved from the database
class ObjectNotFoundError extends ReferenceError {
    constructor(objectType, objectId, info) {
        super();
        this.message = `ObjectNotFoundError: Couldn't find ${objectType} with id: ${objectId}`;
        this.info = info;
        this.code = 422;
    }
}

// Thrown when an object that already exists in the database
// is being overwritten
class ObjectAlreadyExistsError extends Error {
    constructor(objectType, objectId) {
        super();
        this.message = `ObjectAlreadyExistsError: ${objectType} with id ${objectId} already exists`;
        this.code = 422;
    }
}

// Thrown when a invalid argument is passed in
class InvalidArgumentError extends Error {
    constructor(message) {
        super();
        this.message = `InvalidArgumentError: The request contained invalid content: ${message}`;
        this.code = 422;
    }
}

// Thrown when a unsupported object type is passed in
class UnsupportedObjectTypeError extends Error {
    constructor(functionName, objectType) {
        super();
        this.message = `UnsupportedObjectTypeError: The function '${functionName}' doesn't support objects of type '${objectType}'`;
        this.code = 422;
    }
}

// Thrown when the passed in API version is invalid
class UnsupportedAPIError extends Error {
    constructor(apiVersion) {
        super();
        this.message = `UnsupportedAPIError: API Version "${apiVersion}" is not supported.`;
        this.code = 422;
    }
}

// Thrown when an error occurs amongst serverside functions
class GeneralServerError extends Error {
    constructor(message) {
        super();
        this.message = `GeneralServerError: ${message}`;
        this.code = 500;
    }
}

// Default error thrown to clients if not one of the above
class UncaughtServerError extends Error {
    constructor(message) {
        super();
        this.message = `UncaughtServerError: ${message}`;
        this.code = 500;
    }
}


/////////////////////////
//    AWS Errors
/////////////////////////

// 403 Forbidden - Thrown by AWS when the url request wasn't a valid endpoint
// 502 Bad Gateway - Thrown by AWS when an uncaught error occurs

module.exports.MalformedRequestError = MalformedRequestError;
module.exports.ObjectNotFoundError = ObjectNotFoundError;
module.exports.ObjectAlreadyExistsError = ObjectAlreadyExistsError;
module.exports.InvalidArgumentError = InvalidArgumentError;
module.exports.UnsupportedObjectTypeError = UnsupportedObjectTypeError;
module.exports.UnsupportedAPIError = UnsupportedAPIError;
module.exports.GenereralServerError = GeneralServerError;
module.exports.UncaughtServerError = UncaughtServerError;
