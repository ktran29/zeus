'use strict';

const actions = {
    batchDeleteDynamoObjects: require('../actions/batchDeleteDynamoObjects.js'),
    deleteDynamoObject: require('../actions/deleteDynamoObject.js'),
    getTaskById: require('../actions/getTaskById.js'),
    putUpdateField: require('../actions/putUpdateField.js'),
    getChecklistItemsInChecklist: require('../actions/getChecklistItemsInChecklist.js'),
    getCommentsInThread: require('../actions/getCommentsInThread.js'),
    getAllAssociatedObjectsForObjectId: require('../actions/getAllAssociatedObjectsForObjectId.js'),
    getAllTaggedChannelObjectsForObjectId: require('../actions/getAllTaggedChannelObjectsForObjectId.js')
};

module.exports = (params) => {

    const taskId = params.taskId;

    var iTask;
    var commentThreadId;
    var checklistId;

    return actions.getTaskById(taskId)

    .then((result) => {

        iTask = result.iTask;

        commentThreadId = iTask.commentThreadId;
        checklistId = iTask.checklistId;

        return Promise.all([
            actions.getChecklistItemsInChecklist(checklistId),
            actions.getCommentsInThread({
                commentThreadId: commentThreadId,
                // hard coding max value to get all comments in thread
                max: 99999999999999999999
            })
        ]);
    })

    .then((result) => {
        const checklistItemIds = result[0].checklistItemIds;
        const commentIds = result[1].commentIds;

        return Promise.all([
            Promise.all(checklistItemIds.map((checklistItemId) => {
                return actions.deleteDynamoObject({
                    tableName: 'ChecklistItems',
                    objectId: checklistItemId
                });
            })),
            Promise.all(commentIds.map((commentId) => {
                return actions.deleteDynamoObject({
                    tableName: 'Comments',
                    objectId: commentId
                });
            })),
            actions.deleteDynamoObject({
                tableName: 'Checklists',
                objectId: checklistId
            }),
            actions.deleteDynamoObject({
                tableName: 'CommentThreads',
                objectId: commentThreadId
            })
        ]);
    })

    .then(() => {

        if(iTask.laneId) {
            var updateLane = actions.putUpdateField({
                tableName: 'Lanes',
                objectId: iTask.laneId
            });
        }

        if(iTask.boardId) {
            var updateBoard = actions.putUpdateField({
                tableName: 'Boards',
                objectId: iTask.boardId
            });
        }

        return Promise.all([
            updateLane,
            updateBoard
        ]);
    })

    .then(() => {
        return Promise.all([
            actions.getAllAssociatedObjectsForObjectId({
                objectId: taskId,
                associatedType: 'CHANNEL'
            }),
            actions.getAllAssociatedObjectsForObjectId({
                objectId: taskId,
                associatedType: 'USER'
            }),
            actions.getAllTaggedChannelObjectsForObjectId({
                objectId: taskId
            })
        ]);
    })

    .then((result) => {
        const channelPrimaryKeyIds = result[0].primaryKeyIds || [];
        const channelSecondaryKeyIds = result[0].secondaryKeyIds || [];
        const channelIds = result[0].associatedIds || [];
        const userPrimaryKeyIds = result[1].primaryKeyIds || [];
        const userSecondaryKeyIds = result[1].secondaryKeyIds || [];
        const taggedChannelIds = result[2].channelIds || [];

        return Promise.all([
            Promise.all(channelPrimaryKeyIds.map((primaryKeyId) => {
                return actions.batchDeleteDynamoObjects({
                    tableName: 'ObjectAssigned-AE',
                    primaryKey: 'associatedId-objectType',
                    secondaryKey: 'sortDate-objectId',
                    primaryKeyId: primaryKeyId,
                    secondaryKeyId: channelSecondaryKeyIds[0]
                });
            })),
            Promise.all(userPrimaryKeyIds.map((primaryKeyId) => {
                return actions.batchDeleteDynamoObjects({
                    tableName: 'ObjectAssigned-AE',
                    primaryKey: 'associatedId-objectType',
                    secondaryKey: 'sortDate-objectId',
                    primaryKeyId: primaryKeyId,
                    secondaryKeyId: userSecondaryKeyIds[0]
                });
            })),
            Promise.all(channelIds.map((channelId) => {
                return actions.batchDeleteDynamoObjects({
                    tableName: 'ObjectChannelTagged-AE',
                    primaryKey: 'objectId',
                    secondaryKey: 'channelId',
                    primaryKeyId: taskId,
                    secondaryKeyId: channelId
                });
            })),
            Promise.all(taggedChannelIds.map((channelId) => {
                return actions.batchDeleteDynamoObjects({
                    tableName: 'ObjectChannelTagged-AE',
                    primaryKey: 'objectId',
                    secondaryKey: 'channelId',
                    primaryKeyId: taskId,
                    secondaryKeyId: channelId
                });
            }))
        ]);

    })

    .then(() => {
        return actions.deleteDynamoObject({
            objectId: taskId,
            tableName: 'Tasks'
        });
    })

    .then((result) => {
        console.log('Successfully deleted task');

        return result.constructor === Object && Object.keys(result).length === 0;
    });
};
