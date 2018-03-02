'use strict';

// for validating request
const CreateChecklistItemRequest_V0_Schema = require('./CreateChecklistItemRequest_V0_Schema_generated.json');
// for converting validated response
const converters = {
    ChecklistItemConverter: require('../../shared/converters/ChecklistItemConverter.js'),
    ChecklistConverter: require('../../shared/converters/ChecklistConverter.js')
};
// for outsourcing common request / response handling
const LambdaRequestHandler = require('../../shared/utils/LambdaRequestHandler.js');
// helper methods
const transactions = {
    createChecklistItem: require('../../shared/transactions/createChecklistItem.js')
};

module.exports.handler = new LambdaRequestHandler(CreateChecklistItemRequest_V0_Schema, (request) => {

    const checklistId = request.checklistId;
    const description = request.description;
    const userId = request.userId;

    const apiVersion = request.apiVersion;

    return transactions.createChecklistItem({
        checklistId: checklistId,
        description: description,
        userId: userId
    })

    .then((result) => {
        const iChecklistItem = result.iChecklistItem;
        const iChecklist = result.iChecklist;

        switch (apiVersion) {
            case 'v0': {
                return {
                    checklistItem: converters.ChecklistItemConverter.convertToLongV0(iChecklistItem),
                    checklist: converters.ChecklistConverter.convertToLongV0(iChecklist)
                };
            }

            default: {
                throw new Error(`Unsupported api version: ${apiVersion}`);
            }
        }

    });
});
