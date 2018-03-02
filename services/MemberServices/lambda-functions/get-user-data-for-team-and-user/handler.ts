
'use strict';

// for validating request
const GetUserDataRequest_V0_Schema = require('./GetUserDataRequest_V0_Schema_generated.json');

// for creating versioned response
const UserDataConverter = require('../../shared/converters/UserDataConverter.js');

// for outsourcing common request / response handling
const LambdaRequestHandler = require('../../shared/utils/LambdaRequestHandler.js');

// helper methods
const transactions = {
    getUserDataForTeamAndUser: require('../../shared/transactions/getUserDataForTeamAndUser.js')
};

module.exports.handler = new LambdaRequestHandler(GetUserDataRequest_V0_Schema, (request) => {

    // extract GET request parameters
    const apiVersion = request.apiVersion;
    const userId = request.userId;
    const teamId = request.teamId;

    // Get the user data
    return transactions.getUserDataForTeamAndUser({
        userId: userId,
        teamId: teamId
    })

    // return the appropriate response based on the api version
    .then((results) => {
        // extract results
        const iUserData = results.iUserData;

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
