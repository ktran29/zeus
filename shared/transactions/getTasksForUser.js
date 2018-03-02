'use strict';

const _ = require('lodash');

const actions = {
    getTaskById: require('../actions/getTaskById.js'),
    getUserById: require('../actions/getUserById.js'),
    getCommentThreadById: require('../actions/getCommentThreadById.js'),
    getChecklistById: require('../actions/getChecklistById.js'),
    getAllObjectsForAssociatedObject: require('../actions/getAllObjectsForAssociatedObject.js'),
    getAllAssociatedObjectsForObjectId: require('../actions/getAllAssociatedObjectsForObjectId.js'),
    getChannelAEIds: require('../actions/getChannelAEIds.js'),
    getContentForTeam: require('../actions/getContentForTeam.js'),
    getAllOfObjectTypeForUser: require('../actions/getAllOfObjectTypeForUser.js'),
    getTasksInChannel: require('./getTasksInChannel.js')
};

const getUniqueArray = require('../utils/getUniqueArray.js');

module.exports = (params) => {

    const teamId = params.teamId;
    const userId = params.userId;
    const includeChildren = params.includeChildren;
    const returnAsObjects = params.returnAsObjects;

    var taskIds;
    var collapsedTasks = [];
    var channelTaskIds = [];

    return actions.getAllOfObjectTypeForUser({
        userId: userId,
        objectType: 'CHANNEL'
    })

    .then((result) => {
        const channelIds = result.objectIds;

        return Promise.all(channelIds.map((channelId) => {
            return actions.getTasksInChannel({
                channelId: channelId
            });
        }));
    })

    .then((result) => {

        const channelTasks = result;
        channelTasks.forEach((channelTask) => {
            channelTaskIds = channelTaskIds.concat(channelTask.taskIds);
        });

        return Promise.all([
            actions.getAllObjectsForAssociatedObject({
                associatedId: userId,
                objectType: 'TASK'
            }),
            actions.getContentForTeam({
                teamId: teamId,
                tableName: 'Tasks'
            }),

        ]);
    })

    .then((result) => {
        taskIds = result[0].objectIds;
        taskIds = taskIds.concat(channelTaskIds);
        const teamTaskIds = result[1].objectIds;


        // Finds the difference between user task ids and team task ids
        // Then pulls difference from user task ids
        taskIds = _.without(taskIds, _.difference(taskIds, teamTaskIds));

        return Promise.all(taskIds.map((taskId) => actions.getTaskById(taskId)));
    })

    .then((result) => {
        const iTasks = result;

        return Promise.all(iTasks.map((iTask) => {
            var task = iTask.iTask;
            const taskId = task.objectId;

            return Promise.all([
                actions.getAllAssociatedObjectsForObjectId({
                    objectId: taskId,
                    associatedType: 'CHANNEL'
                }),
                actions.getAllAssociatedObjectsForObjectId({
                    objectId: taskId,
                    associatedType: 'USER'
                }),
                actions.getChannelAEIds({
                    partitionKey: 'objectId',
                    partitionKeyId: taskId
                })
            ])

            .then((result) => {

                const assignedChannelIds = _.uniq(result[0].associatedIds);
                const assignedUserIds = _.uniq(result[1].associatedIds);
                const taggedChannelIds = _.uniq(result[2].channelIds);

                task.assignedChannelIds = assignedChannelIds;
                task.assignedUserIds = assignedUserIds;
                task.taggedChannelIds = taggedChannelIds;

                collapsedTasks.push(task);
            });
        }));
    })

    .then(() => {
        if(includeChildren) {
            const creatorIds = [];
            const commentThreadIds = [];
            const checklistIds = [];
            collapsedTasks.forEach((iTask) => {
                creatorIds.push(iTask.creatorId);
                commentThreadIds.push(iTask.commentThreadId);
                checklistIds.push(iTask.checklistId);
            });

            const getUsers = Promise.all(creatorIds.map((creatorId) => {
                return actions.getUserById(creatorId);
            }));

            const getCommentThreads = Promise.all(commentThreadIds.map((commentThreadId) => {
                return actions.getCommentThreadById(commentThreadId);
            }));

            const getChecklists = Promise.all(checklistIds.map((checklistId) => {
                return actions.getChecklistById(checklistId);
            }));

            return Promise.all([
                getUsers,
                getCommentThreads,
                getChecklists
            ])

            .then((result) => {
                const iUsers = result[0];
                const iCommentThreads = result[1];
                const iChecklists = result[2];

                const collapsedUsers = [];
                const collapsedCommentThreads = [];
                const collapsedChecklists = [];

                iUsers.forEach((iUser) => collapsedUsers.push(iUser.iUser));
                iCommentThreads.forEach((iCommentThread =>
                    collapsedCommentThreads.push(iCommentThread.iCommentThread)));
                iChecklists.forEach((iChecklist) => collapsedChecklists.push(iChecklist.iChecklist));

                return {
                    iTasks: getUniqueArray(collapsedTasks),
                    iUsers: getUniqueArray(collapsedUsers),
                    iCommentThreads: getUniqueArray(collapsedCommentThreads),
                    iChecklists: getUniqueArray(collapsedChecklists)
                };
            });
        } else if(returnAsObjects){
            return {
                iTasks: collapsedTasks
            };
        } else {
            return {
                taskIds: taskIds
            };
        }
    });

};
