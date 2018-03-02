'use strict';

const actions = {
    updateTask: require('../actions/updateTask.js'),
    getTaskById: require('./getTaskById.js'),
    aggregateUserIds: require('../actions/aggregateUserIds.js'),
    getAllAssociatedObjectsForObjectId: require('../actions/getAllAssociatedObjectsForObjectId.js'),
    createAssignedAEObject: require('../actions/createAssignedAEObject.js'),
    createUnseenAEObject: require('../actions/createUnseenAEObject.js')
};

module.exports = (params) => {

    //extract parameters
    const taskId = params.taskId;
    const newDueDate = params.newDueDate;
    const taskLastUpdatedDate = params.taskLastUpdatedDate;

    var iTask;

    return actions.updateTask({
        taskId: taskId,
        newDueDate: newDueDate,
        taskLastUpdatedDate: taskLastUpdatedDate
    })

    .then(() => {
        return actions.getTaskById({
            taskId: taskId
        });
    })

    .then((result) => {
        iTask = result.iTask;

        const taskId = iTask.objectId;

        const getAllAssociatedUsers = actions.getAllAssociatedObjectsForObjectId({
            objectId: taskId,
            associatedType: 'USER'
        });

        const getAllAssociatedChannels = actions.getAllAssociatedObjectsForObjectId({
            objectId: taskId,
            'associatedType': 'CHANNEL'
        });

        return Promise.all([
            getAllAssociatedUsers,
            getAllAssociatedChannels
        ]);

    })

    .then((result) => {
        const userIds = result[0].associatedIds;
        const channelIds = result[1].associatedIds;

        return actions.aggregateUserIds({
            assignedUserIds: userIds,
            assignedChannelIds: channelIds
        });
    })

    .then((result) => {
        const userIds = result.userIds;

        return Promise.all(userIds.map((userId) => {
            return Promise.all([
                actions.createAssignedAEObject({
                    objectType: 'TASK',
                    objectId: taskId,
                    associatedId: userId,
                    associatedType: 'USER',
                    sortDate: iTask.dueDate
                }),
                actions.createUnseenAEObject({
                    objectId: taskId,
                    userId: userId,
                    teamId: iTask.teamId,
                    updatedAt: iTask.updatedAt
                })
            ]);
        }));
    })

    .then(() => {
        return {
            iTask: iTask
        };
    });

};
