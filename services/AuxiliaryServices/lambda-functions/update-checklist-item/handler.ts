'use strict';

// for validating request
const UpdateChecklistItemRequest_V0_Schema = require('./UpdateChecklistItemRequest_V0_Schema_generated.json');
// for outsourcing common request / response handling
const LambdaRequestHandler = require('../../shared/utils/LambdaRequestHandler.js');
// helper methods
const transactions = {
    updateChecklistItem: require('../../shared/transactions/updateChecklistItem.js')
};

module.exports.handler = new LambdaRequestHandler(UpdateChecklistItemRequest_V0_Schema, (request) => {

    // Extract parameters
    const checklistItemId = request.checklistItemId;
    const newCompleted = request.newCompleted;
    const taskId = request.taskId;
    const teamId = request.teamId;
    const apiVersion = request.apiVersion;

    return transactions.updateChecklistItem({
        checklistItemId: checklistItemId,
        newCompleted: newCompleted,
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
