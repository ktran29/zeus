'use strict';

const GetUserRequest_V0_Schema = require('./GetUserRequest_V0_Schema_generated.json');
const UserConverter = require('../../shared/converters/UserConverter');
const LambdaRequestHandler = require('../../shared/utils/LambdaRequestHandler.js');

const transactions = {
    getUserById: require('../../shared/transactions/getUserById.js')
};

module.exports.handler = new LambdaRequestHandler(GetUserRequest_V0_Schema, (request) => {

    const apiVersion = request.apiVersion;
    const userId = request.userId;
    const short = request.short && (request.short.toLowerCase() === 'true');

    return transactions.getUserById(userId)

    .then((results) => {

        const iUser = results.iUser;

        // construct the appropriate response based on the api version
        switch (apiVersion) {
            case 'v0': {
                if(short) {
                    return {
                        user: UserConverter.convertToShortV0(iUser)
                    };
                } else {
                    return {
                        user: UserConverter.convertToLongV0(iUser)
                    };
                }
            }
            default: {
                throw new Error(`Unsupported api version: ${apiVersion}`);
            }
        }
    });
});
