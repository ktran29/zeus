'use strict';

const _ = require('lodash');

const actions = {
    createComment: require('../actions/createComment.js'),
    getCommentById: require('../actions/getCommentById.js'),
    getCommentThreadById: require('./getCommentThreadById.js'),
    getTaskById: require('../actions/getTaskById.js'),
    getDiscussionById: require('../actions/getDiscussionById.js'),
    createUnseenAEObject: require('../actions/createUnseenAEObject.js'),
    getAllAssociatedObjectsForObjectId: require('../actions/getAllAssociatedObjectsForObjectId.js'),
    aggregateUserIds: require('../actions/aggregateUserIds.js'),
    putUpdateField: require('../actions/putUpdateField.js')
};

module.exports = (params) => {

    // Extract parameters
    const commentThreadId = params.commentThreadId;
    const userId = params.userId;
    const commentText = params.commentText;

    var commentId;
    var parentObjectType;
    var parentObjectId;
    var channelIds;
    var iCommentThread;
    var getParentObject;

    return Promise.all([
        actions.createComment({
            commentThreadId: commentThreadId,
            userId: userId,
            commentText: commentText
        }),
        actions.getCommentThreadById({
            commentThreadId: commentThreadId
        }),
    ])

    .then((result) => {
        // Extract results
        commentId = result[0].commentId;
        iCommentThread = result[1].iCommentThread;
        parentObjectId = iCommentThread.parentObjectId;
        parentObjectType = iCommentThread.parentObjectType;

        // Gets all associated channel ids for the parent object
        return actions.getAllAssociatedObjectsForObjectId({
            objectId: parentObjectId,
            associatedType: 'CHANNEL'
        });
    })

    .then((result) => {
        channelIds = result.associatedIds;

        if(parentObjectType === 'DISCUSSION') {
            getParentObject = actions.getDiscussionById(parentObjectId);
            var updateParentObject = actions.putUpdateField({
                tableName: 'Discussions',
                objectId: parentObjectId
            });
        } else {
            var getTaskUsers = actions.getAllAssociatedObjectsForObjectId({
                objectId: parentObjectId,
                associatedType : 'USER'
            });
            getParentObject = actions.getTaskById(parentObjectId);
            updateParentObject = actions.putUpdateField({
                tableName: 'Tasks',
                objectId: parentObjectId
            });
        }

        const updateCommentThread = actions.putUpdateField({
            tableName: 'CommentThreads',
            objectId: commentThreadId
        });

        return Promise.all([
            getTaskUsers,
            updateParentObject,
            updateCommentThread
        ]);
    })

    .then((result) => {

        if(parentObjectType === 'TASK') {
            var userIds = result[0].associatedIds;
        }

        return Promise.all([
            actions.aggregateUserIds({
                assignedUserIds: userIds,
                assignedChannelIds: channelIds
            }),
            getParentObject
        ]);
    })

    .then((result) => {
        if(parentObjectType === 'DISCUSSION') {
            var parentObject = result[1].iDiscussion;
        } else {
            parentObject = result[1].iTask;
        }

        const userIds = _.pull(result[0].userIds, parentObject.creatorId);

        return Promise.all(userIds.map((userId) => {
            return actions.createUnseenAEObject({
                userId: userId,
                teamId: parentObject.teamId,
                objectId: parentObjectId,
                updatedAt: parentObject.updatedAt
            });
        }));
    })

    .then(() => {
        return actions.getCommentById(commentId);
    })

    .then((result) => {
        // Extract results
        const iComment = result.iComment;

        return {
            iComment: iComment,
            iCommentThread: iCommentThread
        };

    });

};
