'use strict';

const _ = require('lodash');

const actions = {
    getTaskById: require('../actions/getTaskById.js'),
    getUserById: require('../actions/getUserById.js'),
    getChecklistById: require('./getChecklistById.js'),
    getCommentThreadById: require('./getCommentThreadById.js'),
    getChannelAEIds: require('../actions/getChannelAEIds.js'),
    getAllAssociatedObjectsForObjectId: require('../actions/getAllAssociatedObjectsForObjectId.js')
};

module.exports = (params) => {

    const taskId = params.taskId;
    const includeChildren = params.includeChildren;

    var iTask;

    return actions.getTaskById(taskId)

    .then((result) => {
        iTask = result.iTask;

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
        ]);
    })

    .then((result) => {

        const assignedChannelIds = _.uniq(result[0].associatedIds);
        const assignedUserIds = _.uniq(result[1].associatedIds);
        const taggedChannelIds = _.uniq(result[2].channelIds);

        iTask.assignedChannelIds = assignedChannelIds;
        iTask.assignedUserIds = assignedUserIds;
        iTask.taggedChannelIds = taggedChannelIds;

        if(includeChildren) {
            const creatorId = iTask.creatorId;
            const checklistId = iTask.checklistId;
            const commentThreadId = iTask.commentThreadId;

            return Promise.all([
                actions.getUserById(creatorId),
                actions.getChecklistById({
                    checklistId: checklistId
                }),
                actions.getCommentThreadById({
                    commentThreadId: commentThreadId
                })
            ])

            .then((result) => {
                const iUser = result[0].iUser;
                const iChecklist = result[1].iChecklist;
                const iCommentThread = result[2].iCommentThread;

                return {
                    iTask: iTask,
                    iUser: iUser,
                    iCommentThread: iCommentThread,
                    iChecklist: iChecklist
                };
            });
        } else {
            return {
                iTask: iTask
            };
        }
    });
};
