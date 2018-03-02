'use strict';

// for validating request
const GetUserDataRequest_V0_Schema = require('./GetUserDataRequest_V0_Schema_generated.json');

// for creating versioned response
const UserDataConverter = require('../../shared/converters/UserDataConverter.js');

// for outsourcing common request / response handling
const LambdaRequestHandler = require('../../shared/utils/LambdaRequestHandler.js');

// helper methods
const transactions = {
    getUserData: require('../../shared/transactions/getUserDataById.js')
};

module.exports.handler = new LambdaRequestHandler(GetUserDataRequest_V0_Schema, (request) => {

    const apiVersion = request.apiVersion;
    const userDataId = request.userDataId;


    return transactions.getUserData(userDataId)

    .then((result) => {
        // extract results
        const iUserData = result.iUserData;

        // construct the appropriate response based on the api version
        switch (apiVersion) {
            case 'v0': {
                return {
                    userData: UserDataConverter.convertToLongV0(iUserData)
                };
            }

            default: {
                throw new Error(`Unsupported api version: ${apiVersion}`);
            }
        }

    });
});
