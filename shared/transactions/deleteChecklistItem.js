'use strict';

const actions = {
    deleteDynamoObject: require('../actions/deleteDynamoObject.js'),
    putUpdateField: require('../actions/putUpdateField.js')
};

module.exports = (params) => {

    // Extract parameters
    const checklistItemId = params.checklistItemId;
    const checklistId = params.checklistId;
    const taskId = params.taskId;

    return Promise.all([
        actions.putUpdateField({
            tableName: 'Checklists',
            objectId: checklistId
        }),
        actions.putUpdateField({
            tableName: 'Tasks',
            objectId: taskId
        })
    ])

    .then(() => {
        return actions.deleteDynamoObject({
            tableName: 'ChecklistItems',
            objectId: checklistItemId
        });
    })

    .then((result) => {
        const success = result.constructor === Object && Object.keys(result).length === 0;
        console.log('Successfully deleted checklist item');

        return {
            success: success
        };
    });

};
