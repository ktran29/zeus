'use strict';

// for validating request
const GetTeamRequest_V0_Schema = require('./GetTeamRequest_V0_Schema_generated.json');
// for creating validated response
const TeamConverter = require('../../shared/converters/TeamConverter.js');
// for outsourcing common request / response handling
const LambdaRequestHandler = require('../../shared/utils/LambdaRequestHandler.js');
// helper methods
const transactions = {
    getTeam: require('../../shared/transactions/getTeamByNameAndCode.js')
};

module.exports.handler = new LambdaRequestHandler(GetTeamRequest_V0_Schema, (request) => {

    const teamName = request.teamName;
    const teamCode = request.teamCode;
    const apiVersion = request.apiVersion;

    return transactions.getTeam({
        teamName: teamName,
        teamCode: teamCode
    })

    .then((result) => {
        const iTeam = result.iTeam;

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
