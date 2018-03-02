'use strict';

const _ = require('lodash');

const actions = {
    getTaskById: require('../actions/getTaskById.js'),
    getUserById: require('../actions/getUserById.js'),
    getCommentThreadById: require('../actions/getCommentThreadById.js'),
    getChecklistById: require('../actions/getChecklistById.js'),
    getChannelAEIds: require('../actions/getChannelAEIds.js'),
    getAllAssociatedObjectsForObjectId: require('../actions/getAllAssociatedObjectsForObjectId.js'),
    getTasksInLane: require('../actions/getTasksInLane.js')
};

const getUniqueArray = require('../utils/getUniqueArray.js');

module.exports = (params) => {

    const laneId = params.laneId;
    const includeChildren = params.includeChildren;
    const returnAsObjects = params.returnAsObjects;

    var taskIds;
    var collapsedTasks = [];

    return actions.getTasksInLane(laneId)

    .then((result) => {
        taskIds = result.taskIds;
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

                task.assignedUserIds = assignedUserIds;
                task.assignedChannelIds = assignedChannelIds;
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
