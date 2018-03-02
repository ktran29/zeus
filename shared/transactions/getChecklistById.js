'use strict';

const actions = {
    getChecklistById: require('../actions/getChecklistById.js'),
    getChecklistItemsInChecklist: require('../actions/getChecklistItemsInChecklist.js')
};

module.exports = (params) => {

    var iChecklist;

    const checklistId = params.checklistId;
    const includeItems = params.includeItems;

    return actions.getChecklistById(checklistId)

    .then((result) => {
        iChecklist = result.iChecklist;

        return actions.getChecklistItemsInChecklist(checklistId);
    })

    .then((result) => {
        const iChecklistItems = result.iChecklistItems;
        const numberOfCompletedItems = result.numberOfCompletedItems;
        const numberOfItems = iChecklistItems.length;
        iChecklist.numberOfItems = numberOfItems;
        iChecklist.numberOfCompletedItems = numberOfCompletedItems;
        if (!includeItems) {
            return {
                iChecklist: iChecklist,
            };
        } else {
            return {
                iChecklist: iChecklist,
                iChecklistItems: iChecklistItems
            };
        }
    });

};
