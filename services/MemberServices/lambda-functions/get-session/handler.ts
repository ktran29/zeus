
'use strict';

// for validating request
const GetSessionRequest_V0_Schema = require('./GetSessionRequest_V0_Schema_generated.json');

// for creating versioned response
const converters = {
    TeamConverter: require('../../shared/converters/TeamConverter.js'),
    UserConverter: require('../../shared/converters/UserConverter.js'),
    ChannelConverter: require('../../shared/converters/ChannelConverter.js')
};

// for outsourcing common request / response handling
const LambdaRequestHandler = require('../../shared/utils/LambdaRequestHandler.js');

// helper methods
const transactions = {
    getSession: require('../../shared/transactions/getSession.js')
};

module.exports.handler = new LambdaRequestHandler(GetSessionRequest_V0_Schema, (request) => {

    // extract GET request parameters
    const apiVersion = request.apiVersion;
    const userId = request.userId;
    const teamId = request.teamId;

    // Get the user data
    return transactions.getSession({
        userId: userId,
        teamId: teamId
    })

    // return the appropriate response based on the api version
    .then((results) => {
        // extract results
        const iTeam = results.iTeam;
        const iUser = results.iUser;
        const iUsers = results.iUsers;
        const iChannels = results.iChannels;

        switch (apiVersion) {

            case 'v0': {
                return {
                    activeTeam: converters.TeamConverter.convertToLongV0(iTeam),
                    activeUser: converters.UserConverter.convertToLongV0(iUser),
                    users: iUsers.map((iUser) => {
                        return converters.UserConverter.convertToShortV0(iUser);
                    }),
                    channels: iChannels.map((iChannel) => {
                        return converters.ChannelConverter.convertToLongV0(iChannel);
                    })
                };
            }

            default: {
                throw new Error(`Unsupported api version: ${apiVersion}`);
            }
        }
    });
});
