'use strict';

const actions = {
    getChecklistItemById: require('../actions/getChecklistItemById.js'),
    putUpdateField: require('../actions/putUpdateField.js'),
    getAllAssociatedObjectsForObjectId: require('../actions/getAllAssociatedObjectsForObjectId.js'),
    getChannelAEIds: require('../actions/getChannelAEIds.js'),
    aggregateUserIds: require('../actions/aggregateUserIds.js'),
    createUnseenAEObject: require('../actions/createUnseenAEObject.js')
};

module.exports = (params) => {

    const checklistItemId = params.checklistItemId;
    const newCompleted = params.newCompleted;
    const taskId = params.taskId;
    const teamId = params.teamId;

    // First gotta check if checklistItem exists

    return actions.getChecklistItemById(checklistItemId)

    .then((result) => {

        const iChecklistItem = result.iChecklistItem;

        const getChannelAEIds = actions.getChannelAEIds({
            partitionKey: 'objectId',
            partitionKeyId: taskId,
            tableName: 'ObjectChannelAssigned-AE'
        });

        const getAllAssociatedObjectsForObjectId = actions.getAllAssociatedObjectsForObjectId({
            objectId: taskId,
            associatedType: 'USER'
        });

        const updateChecklistItem = actions.putUpdateField({
            tableName: 'ChecklistItems',
            objectId: checklistItemId,
            field: 'completed',
            value: newCompleted
        });

        const updateChecklist = actions.putUpdateField({
            tableName: 'Checklists',
            objectId: iChecklistItem.checklistId
        });

        const updateTask = actions.putUpdateField({
            tableName: 'Tasks',
            objectId: taskId,
        });

        return Promise.all([
            getChannelAEIds,
            getAllAssociatedObjectsForObjectId,
            updateChecklistItem,
            updateChecklist,
            updateTask
        ]);
    })

    .then((result) => {
        const channelIds = result[0].channelIds;
        const userIds = result[1].associatedIds;

        return Promise.all([
            actions.aggregateUserIds({
                assignedUserIds: userIds,
                assignedChannelIds: channelIds
            }),
            actions.getChecklistItemById(checklistItemId)
        ]);

    })

    .then((result) => {
        const userIds = result[0].userIds;
        const iChecklistItem = result[1].iChecklistItem;

        const updatedAt = iChecklistItem.updatedAt;

        return Promise.all(userIds.map((userId) => {
            return actions.createUnseenAEObject({
                objectId: taskId,
                userId: userId,
                teamId: teamId,
                updatedAt: updatedAt
            });
        }));
    })

    .then(() => {
        return {
            success: true
        };
    });

};
