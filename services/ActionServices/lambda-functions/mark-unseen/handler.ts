'use strict';

// for validating request
const MarkUnseenRequest_V0_Schema = require('./MarkUnseenRequest_V0_Schema_generated.json');
// for outsourcing common request / response handling
const LambdaRequestHandler = require('../../shared/utils/LambdaRequestHandler.js');
// helper methods
const transactions = {
    markItemAsUnseen: require('../../shared/transactions/markItemAsUnseen.js')
};

module.exports.handler = new LambdaRequestHandler(MarkUnseenRequest_V0_Schema, (request) => {

    // extract parameters
    const apiVersion = request.apiVersion;
    const objectIds = request.objectIds;
    const userIds = request.userIds;
    const teamId = request.teamId;
    const updatedAt = request.updatedAt;

    return transactions.markItemAsUnseen({
        objectIds: objectIds,
        userIds: userIds,
        teamId: teamId,
        updatedAt: updatedAt
    })

    .then((result) => {
        const success = result.success;
        switch(apiVersion) {
            case 'v0': {
                return {
                    success: success
                };
            }

            default: {
                throw new Error(`Unsupported api version: ${apiVersion}`);
            }
        }
    });

});
