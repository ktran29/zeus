'use strict';

// for validating request
const MarkSeenRequest_V0_Schema = require('./MarkSeenRequest_V0_Schema_generated.json');
// for outsourcing common request / response handling
const LambdaRequestHandler = require('../../shared/utils/LambdaRequestHandler.js');
// helper methods
const transactions = {
    markItemAsSeen: require('../../shared/transactions/markItemAsSeen.js')
};

module.exports.handler = new LambdaRequestHandler(MarkSeenRequest_V0_Schema, (request) => {

    // extract parameters
    const apiVersion = request.apiVersion;
    const objectId = request.objectId;
    const userId = request.userId;
    const teamId = request.teamId;

    return transactions.markItemAsSeen({
        objectId: objectId,
        userId: userId,
        teamId: teamId
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
