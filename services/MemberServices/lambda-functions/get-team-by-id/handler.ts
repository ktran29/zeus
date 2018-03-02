'use strict';

const GetTeamRequest_V0_Schema = require('./GetTeamRequest_V0_Schema_generated.json');
const TeamConverter = require('../../shared/converters/TeamConverter');
const LambdaRequestHandler = require('../../shared/utils/LambdaRequestHandler.js');

const transactions = {
    getTeamById: require('../../shared/transactions/getTeamById.js')
};

module.exports.handler = new LambdaRequestHandler(GetTeamRequest_V0_Schema, (request) => {

    const apiVersion = request.apiVersion;
    const teamId = request.teamId;

    return transactions.getTeamById(teamId)

    .then((results) => {

        const iTeam = results.iTeam;

        // construct the appropriate response based on the api version
        switch (apiVersion) {
            case 'v0': {
                return {
                    team: TeamConverter.convertToLongV0(iTeam)
                };
            }
            default: {
                throw new Error(`Unsupported api version: ${apiVersion}`);
            }
        }
    });
});
