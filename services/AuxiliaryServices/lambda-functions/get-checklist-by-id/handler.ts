'use strict';

// for validating request
const GetChecklistRequest_V0_Schema = require('./GetChecklistRequest_V0_Schema_generated.json');
// for creating validated response
const converters = {
    ChecklistConverter: require('../../shared/converters/ChecklistConverter.js'),
    ChecklistItemConverter: require('../../shared/converters/ChecklistItemConverter.js')
};
// for outsourcing common request / response handling
const LambdaRequestHandler = require('../../shared/utils/LambdaRequestHandler.js');
// helper methods
const transactions = {
    getChecklist: require('../../shared/transactions/getChecklistById.js')
};

module.exports.handler = new LambdaRequestHandler(GetChecklistRequest_V0_Schema, (request) => {

    // Extract parameters
    const checklistId = request.checklistId;
    const includeItems = request.includeItems && (request.includeItems.toLowerCase() === 'true');
    const short = request.short && (request.short.toLowerCase() === 'true');
    const apiVersion = request.apiVersion;

    return transactions.getChecklist({
        checklistId: checklistId,
        includeItems: includeItems,
    })

    .then((result) => {
        // Extract results
        const iChecklist = result.iChecklist;
        const iChecklistItems = result.iChecklistItems;

        switch (apiVersion) {
            case 'v0': {
                if(short) {
                    return {
                        checklist: converters.ChecklistConverter.convertToShortV0(iChecklist)
                    };
                } else {
                    if(!includeItems) {
                        return {
                            checklist: converters.ChecklistConverter.convertToLongV0(iChecklist)
                        };
                    } else {
                        return {
                            checklist: converters.ChecklistConverter.convertToLongV0(iChecklist),
                            checklistItems: iChecklistItems.map((iChecklistItem) => {
                                return converters.ChecklistItemConverter.convertToLongV0(iChecklistItem);
                            })
                        };
                    }
                }
            }

            default: {
                throw new Error(`Unsupported api version: ${apiVersion}`);
            }
        }

    });
});
