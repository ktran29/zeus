'use strict';

const actions = {
    getChecklistItemById: require('../actions/getChecklistItemById.js')
};

module.exports = (checklistItemId) => {

    return actions.getChecklistItemById(checklistItemId)

    .then((result) => {
        const iChecklistItem = result.iChecklistItem;

        return {
            iChecklistItem: iChecklistItem
        };
    });

};
