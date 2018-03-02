'use strict';

// for validating request
const LeaveTeamRequest_V0_Schema = require('./LeaveTeamRequest_V0_Schema_generated.json');
// for outsourcing common request / response handling
const LambdaRequestHandler = require('../../shared/utils/LambdaRequestHandler.js');
// helper methods
const transactions = {
    leaveTeam: require('../../shared/transactions/leaveTeam.js')
};

module.exports.handler = new LambdaRequestHandler(LeaveTeamRequest_V0_Schema, (request) => {

    // extract parameters
    const teamId = request.teamId;
    const userId = request.userId;
    const apiVersion = request.apiVersion;

    return transactions.leaveTeam({
        teamId: teamId,
        userId: userId
    })

    .then((result) => {
        switch(apiVersion) {
            case 'v0': {
                return result;
            }

            default: {
                throw new Error(`Unsupported api version: ${apiVersion}`);
            }
        }
    });
});
