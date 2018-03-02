'use strict';

// for validating request
const JoinTeamRequest_V0_Schema = require('./JoinTeamRequest_V0_Schema_generated.json');
// for creating versioned response
const converters = {
    TeamConverter: require('../../shared/converters/TeamConverter.js'),
    ChannelConverter: require('../../shared/converters/ChannelConverter.js'),
    UserConverter: require('../../shared/converters/UserConverter.js'),
    UserDataConverter: require('../../shared/converters/UserDataConverter.js')
};
// for outsourcing common request / response handling
const LambdaRequestHandler = require('../../shared/utils/LambdaRequestHandler.js');
// helper methods
const transactions = {
    joinTeam: require('../../shared/transactions/joinTeam.js')
};

module.exports.handler = new LambdaRequestHandler(JoinTeamRequest_V0_Schema, (request) => {

    // extract parameters
    const apiVersion = request.apiVersion;
    const userId = request.userId;
    const teamName = request.teamName;
    const teamCode = request.teamCode;

    return transactions.joinTeam({
        userId: userId,
        teamName: teamName,
        teamCode: teamCode
    })

    .then((result) => {
        // extract results
        const iTeam = result.iTeam;
        const iChannel = result.iChannel;
        const iUser = result.iUser;
        const iUserData = result.iUserData;
        // construct the appropriate response based on the api version
        switch (apiVersion) {
            case 'v0': {
                return {
                    team: converters.TeamConverter.convertToLongV0(iTeam),
                    channel: converters.ChannelConverter.convertToLongV0(iChannel),
                    user: converters.UserConverter.convertToLongV0(iUser),
                    userData: converters.UserDataConverter.convertToLongV0(iUserData)
                };
            }

            default: {
                throw new Error(`Unsupported api version: ${apiVersion}`);
            }
        }

    });

});
