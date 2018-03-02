'use strict';

const actions = {
    createDiscussion: require('../actions/createDiscussion.js'),
    createCommentThread: require('../actions/createCommentThread.js'),
    addUpdateField: require('../actions/addUpdateField.js'),
    putUpdateField: require('../actions/putUpdateField.js'),
    getDiscussionById: require('./getDiscussionById.js'),
    getUserDataForTeamAndUser: require('../actions/getUserDataForTeamAndUser.js'),
    getAllUserIdMembershipsForObject: require('../actions/getAllUserIdMembershipsForObject.js'),
    createAssignedAEObject: require('../actions/createAssignedAEObject.js'),
    createChannelAEObject: require('../actions/createChannelAEObject.js'),
    createObjectUserMembership: require('../actions/createObjectUserMembership.js'),
    createUnseenAEObject: require('../actions/createUnseenAEObject.js')
};

const generateUniqueIdentifier = require('../utils/generateUniqueIdentifier.js');

module.exports = (params) => {

    // Extract parameters
    const creatorId = params.creatorId;
    const assignedChannelIds = params.assignedChannelIds;
    const originalPostText = params.originalPostText;
    const teamId = params.teamId;

    const now = Date.now();

    const discussionId = generateUniqueIdentifier();

    return Promise.all(assignedChannelIds.map((assignedChannelId) => {
        return actions.getAllUserIdMembershipsForObject({
            objectId: assignedChannelId
        });
    }))

    .then((result) => {
        // Extract results
        const channelUserIds = result;
        var collapsedUserIds = [];
        channelUserIds.forEach((userIds) => {
            collapsedUserIds = collapsedUserIds.concat(userIds.userIds);
        });

        const createAssignedChannelAEObjects = Promise.all(assignedChannelIds.map((assignedChannelId) => {
            return actions.createAssignedAEObject({
                objectId: discussionId,
                associatedId: assignedChannelId,
                associatedType: 'CHANNEL',
                objectType: 'DISCUSSION',
                sortDate: now
            });
        }));

        const createTaggedChannelAEObjects = Promise.all(assignedChannelIds.map((taggedChannelId) => {
            return actions.createChannelAEObject({
                objectId: discussionId,
                channelId: taggedChannelId,
                objectType: 'DISCUSSION'
            });
        }));

        // const createUnseenAEObjects = Promise.all(collapsedUserIds.map((userId) => {
        //     return actions.createUnseenAEObject({
        //         objectId: discussionId,
        //         userId: userId,
        //         teamId: teamId,
        //         updatedAt: iDiscussion.updatedAt
        //     });
        // }));

        return Promise.all([
            actions.createCommentThread({
                parentObjectId: discussionId,
                parentObjectType: 'DISCUSSION'
            }),
            createAssignedChannelAEObjects,
            createTaggedChannelAEObjects
            // createUnseenAEObjects
        ]);
    })

    .then((result) => {
        // Extract results
        const commentThreadId = result[0].iCommentThread.objectId;

        return actions.createDiscussion({
            objectId: discussionId,
            creatorId: creatorId,
            commentThreadId: commentThreadId,
            originalPostText: originalPostText,
            createdAt: now,
            updatedAt: now,
            teamId: teamId
        });
    })

    .then(() => {
        return actions.getDiscussionById({
            discussionId: discussionId
        });
    })

    .then((result) => {
        const iDiscussion = result.iDiscussion;
        return {
            iDiscussion: iDiscussion
        };
    });
};
