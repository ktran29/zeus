'use strict';

const CreateUserRequest_V0_Schema = require('./CreateUserRequest_V0_Schema_generated.json');
const UserConverter = require('../../shared/converters/UserConverter');
const LambdaRequestHandler = require('../../shared/utils/LambdaRequestHandler.js');

const transactions = {
    createUser: require('../../shared/transactions/createUser.js')
};

module.exports.handler = new LambdaRequestHandler(CreateUserRequest_V0_Schema, (request) => {

    const apiVersion = request.apiVersion;
    const userId = request.userId;
    const email = request.email;

    return transactions.createUser({
        userId: userId,
        email: email
    })

    .then((results) => {

        const iUser = results.iUser;

        // construct the appropriate response based on the api version
        switch (apiVersion) {
            case 'v0': {
                return {
                    user: UserConverter.convertToLongV0(iUser)
                };
            }
            default: {
                throw new Error(`Unsupported api version: ${apiVersion}`);
            }
        }
    });
});
