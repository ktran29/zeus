'use strict';

// for validating request
const DeleteChecklistItemRequest_V0_Schema = require('./DeleteChecklistItemRequest_V0_Schema_generated.json');
// for outsourcing common request / response handling
const LambdaRequestHandler = require('../../shared/utils/LambdaRequestHandler.js');
// helper methods
const transactions = {
    deleteChecklistItem: require('../../shared/transactions/deleteChecklistItem.js')
};

module.exports.handler = new LambdaRequestHandler(DeleteChecklistItemRequest_V0_Schema, (request) => {

    // Extract parameters
    const checklistItemId = request.checklistItemId;
    const checklistId = request.checklistId;
    const taskId = request.taskId;
    const teamId = request.teamId;
    const apiVersion = request.apiVersion;

    return transactions.deleteChecklistItem({
        checklistItemId: checklistItemId,
        checklistId: checklistId,
        taskId: taskId,
        teamId: teamId
    })

    .then((result) => {
        // Extract results
        const success = result.success;

        switch (apiVersion) {
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
