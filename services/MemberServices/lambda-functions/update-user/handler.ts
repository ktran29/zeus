'use strict';

const UpdateUserRequest_V0_Schema = require('./UpdateUserRequest_V0_Schema_generated.json');
const UserConverter = require('../../shared/converters/UserConverter');
const LambdaRequestHandler = require('../../shared/utils/LambdaRequestHandler.js');

const transactions = {
    updateUser: require('../../shared/transactions/updateUser.js')
};

module.exports.handler = new LambdaRequestHandler(UpdateUserRequest_V0_Schema, (request) => {

    const apiVersion = request.apiVersion;
    const firstName = request.firstName;
    const lastName = request.lastName;
    const middleName = request.middleName;
    const userId = request.userId;

    return transactions.updateUser({
        firstName: firstName,
        lastName: lastName,
        middleName: middleName,
        userId: userId
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
