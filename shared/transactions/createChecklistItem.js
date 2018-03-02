'use strict';

const _ = require('lodash');

const actions = {
    createChecklistItem: require('../actions/createChecklistItem.js'),
    getChecklistItemById: require('../actions/getChecklistItemById.js'),
    getChecklistById: require('../actions/getChecklistById.js'),
    getTaskById: require('../actions/getTaskById.js'),
    putUpdateField: require('../actions/putUpdateField.js'),
    createUnseenAEObject: require('../actions/createUnseenAEObject.js'),
    getAllAssociatedObjectsForObjectId: require('../actions/getAllAssociatedObjectsForObjectId.js'),
    aggregateUserIds: require('../actions/aggregateUserIds.js'),
    getChecklistItemsInChecklist: require('../actions/getChecklistItemsInChecklist.js')
};

module.exports = (params) => {

    const checklistId = params.checklistId;
    const description = params.description;
    const userId = params.userId;

    var checklistItemId;
    var taskId;

    return actions.getChecklistItemsInChecklist(checklistId)

    .then((result) => {
        const index = result.bottomChecklistItemPosition;
        return Promise.all([
            actions.createChecklistItem({
                checklistId: checklistId,
                description: description,
                index: index
            }),
            actions.getChecklistById(checklistId)
        ]);
    })

    .then((result) => {
        checklistItemId = result[0].iChecklistItemId;
        taskId = result[1].iChecklist.parentObjectId;

        return Promise.all([
            // Gets associated channels and users for task
            actions.getAllAssociatedObjectsForObjectId({
                objectId: taskId,
                associatedType: 'CHANNEL'
            }),
            actions.getAllAssociatedObjectsForObjectId({
                objectId: taskId,
                associatedType: 'USER'
            }),

            // Updates task and checklist
            actions.putUpdateField({
                tableName: 'Tasks',
                objectId: taskId
            }),
            actions.putUpdateField({
                tableName: 'Checklists',
                objectId: checklistId
            })
        ]);
    })

    .then((result) => {
        const channelIds = result[0].associatedIds;
        const userIds = result[1].associatedIds;

        return Promise.all([
            actions.aggregateUserIds({
                assignedChannelIds: channelIds,
                assignedUserIds: userIds
            }),
            actions.getTaskById(taskId)
        ]);
    })

    .then((result) => {
        const userIds = _.pull(result[0].userIds, userId);
        const iTask = result[1].iTask;

        return Promise.all(userIds.map((userId) => {
            return actions.createUnseenAEObject({
                userId: userId,
                teamId: iTask.teamId,
                objectId: taskId,
                updatedAt: iTask.updatedAt
            });
        }));
    })

    .then(() => {
        return Promise.all([
            actions.getChecklistItemById(checklistItemId),
            actions.getChecklistById(checklistId)
        ]);
    })

    .then((result) => {
        const iChecklistItem = result[0].iChecklistItem;
        const iChecklist = result[1].iChecklist;

        return {
            iChecklistItem: iChecklistItem,
            iChecklist: iChecklist
        };
    });
};
