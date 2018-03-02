'use strict';

// for validating request
const DeleteLaneRequest_V0_Schema = require('./DeleteLaneRequest_V0_Schema_generated.json');
// for outsourcing common request / response handling
const LambdaRequestHandler = require('../../shared/utils/LambdaRequestHandler.js');
// helper methods
const transactions = {
    deleteLane: require('../../shared/transactions/deleteLane.js')
};

module.exports.handler = new LambdaRequestHandler(DeleteLaneRequest_V0_Schema, (request) => {

    const apiVersion = request.apiVersion;
    const laneId = request.laneId;
    const teamId = request.teamId;

    return transactions.deleteLane({
        laneId: laneId,
        teamId: teamId
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
