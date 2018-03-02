'use strict';

// for validating request
const GetChecklistItemRequest_V0_Schema = require('./GetChecklistItemRequest_V0_Schema_generated.json');
// for creating validated response
const converters = {
    ChecklistItemConverter: require('../../shared/converters/ChecklistItemConverter.js')
};
// for outsourcing common request / response handling
const LambdaRequestHandler = require('../../shared/utils/LambdaRequestHandler.js');
// helper methods
const transactions = {
    getChecklistItemById: require('../../shared/transactions/getChecklistItemById.js')
};

module.exports.handler = new LambdaRequestHandler(GetChecklistItemRequest_V0_Schema, (request) => {

    // Extract parameters
    const checklistItemId = request.checklistItemId;
    const apiVersion = request.apiVersion;

    return transactions.getChecklistItemById(checklistItemId)

    .then((result) => {
        // Extract results
        const iChecklistItem = result.iChecklistItem;

        switch (apiVersion) {
            case 'v0': {
                return {
                    checklistItem: converters.ChecklistItemConverter.convertToLongV0(iChecklistItem)
                };
            }

            default: {
                throw new Error(`Unsupported api version: ${apiVersion}`);
            }
        }

    });
});
