'use strict';

const _ = require('lodash');

const actions = {
    getDiscussionById: require('../actions/getDiscussionById.js'),
    getUserById: require('../actions/getUserById.js'),
    getCommentThreadById: require('../actions/getCommentThreadById.js'),
    getChannelById: require('../actions/getChannelById.js'),
    getAllObjectsForAssociatedObject: require('../actions/getAllObjectsForAssociatedObject.js'),
    getAllAssociatedObjectsForObjectId: require('../actions/getAllAssociatedObjectsForObjectId.js'),
    getChannelAEIds: require('../actions/getChannelAEIds.js'),
    getContentForTeam: require('../actions/getContentForTeam.js'),
    getAllOfObjectTypeForUser: require('../actions/getAllOfObjectTypeForUser.js'),
    getDiscussionsInChannel: require('./getDiscussionsInChannel.js')
};

const getUniqueArray = require('../utils/getUniqueArray.js');

module.exports = (params) => {

    const teamId = params.teamId;
    const userId = params.userId;
    const includeChildren = params.includeChildren;
    const returnAsObjects = params.returnAsObjects;

    var discussionIds;
    var collapsedDiscussions = [];
    var channelDiscussionIds = [];

    return actions.getAllOfObjectTypeForUser({
        userId: userId,
        objectType: 'CHANNEL'
    })

    .then((result) => {
        const channelIds = result.objectIds;

        return Promise.all(channelIds.map((channelId) => {
            return actions.getDiscussionsInChannel({
                channelId: channelId
            });
        }));
    })

    .then((result) => {

        const channelDiscussions = result;
        channelDiscussions.forEach((channelDiscussion) => {
            channelDiscussionIds = channelDiscussionIds.concat(channelDiscussion.discussionIds);
        });

        return Promise.all([
            actions.getAllObjectsForAssociatedObject({
                associatedId: userId,
                objectType: 'DISCUSSION'
            }),
            actions.getContentForTeam({
                teamId: teamId,
                tableName: 'Discussions'
            }),

        ]);
    })

    .then((result) => {
        discussionIds = result[0].objectIds;
        discussionIds = discussionIds.concat(channelDiscussionIds);
        const teamDiscussionIds = result[1].objectIds;


        // Finds the difference between user discussion ids and team discussion ids
        // Then pulls difference from user discussion ids
        discussionIds = _.without(discussionIds, _.difference(discussionIds, teamDiscussionIds));

        return Promise.all(discussionIds.map((discussionId) => actions.getDiscussionById(discussionId)));
    })

    .then((result) => {
        const iDiscussions = result;

        return Promise.all(iDiscussions.map((iDiscussion) => {
            var discussion = iDiscussion.iDiscussion;
            const discussionId = discussion.objectId;

            return Promise.all([
                actions.getAllAssociatedObjectsForObjectId({
                    objectId: discussionId,
                    associatedType: 'CHANNEL'
                }),
                actions.getAllAssociatedObjectsForObjectId({
                    objectId: discussionId,
                    associatedType: 'USER'
                }),
                actions.getChannelAEIds({
                    partitionKey: 'objectId',
                    partitionKeyId: discussionId
                })
            ])

            .then((result) => {

                const assignedChannelIds = _.uniq(result[0].associatedIds);
                const assignedUserIds = _.uniq(result[1].associatedIds);
                const taggedChannelIds = _.uniq(result[2].channelIds);

                discussion.assignedChannelIds = assignedChannelIds;
                discussion.assignedUserIds = assignedUserIds;
                discussion.taggedChannelIds = taggedChannelIds;

                collapsedDiscussions.push(discussion);
            });
        }));
    })

    .then(() => {
        if(includeChildren) {
            const userIds = [];
            const commentThreadIds = [];
            var channelIds = [];
            collapsedDiscussions.forEach((iDiscussion) => {
                userIds.push(iDiscussion.creatorId);
                commentThreadIds.push(iDiscussion.commentThreadId);
                channelIds = channelIds.concat(iDiscussion.assignedChannelIds);
            });

            const getUsers = Promise.all(userIds.map((userId) => {
                return actions.getUserById(userId);
            }));
            const getChannels = Promise.all(channelIds.map((channelId) => {
                return actions.getChannelById(channelId);
            }));
            const getCommentThreads = Promise.all(commentThreadIds.map((commentThreadId) => {
                return actions.getCommentThreadById(commentThreadId);
            }));
            return Promise.all([
                getUsers,
                getChannels,
                getCommentThreads,
            ])

            .then((result) => {
                const iUsers = result[0];
                const iChannels = result[1];
                const iCommentThreads = result[2];

                const collapsedUsers = [];
                const collapsedChannels = [];
                const collapsedCommentThreads = [];

                iUsers.forEach((iUser) => collapsedUsers.push(iUser.iUser));
                iChannels.forEach((iChannel) => collapsedChannels.push(iChannel.iChannel));
                iCommentThreads.forEach((iCommentThread) =>
                    collapsedCommentThreads.push(iCommentThread.iCommentThread));

                return {
                    iDiscussions: getUniqueArray(collapsedDiscussions),
                    iUsers: getUniqueArray(collapsedUsers),
                    iChannels: getUniqueArray(collapsedChannels),
                    iCommentThreads: getUniqueArray(collapsedCommentThreads)
                };
            });

        } else if(returnAsObjects){
            return {
                iDiscussions: collapsedDiscussions
            };
        } else {
            return {
                discussionIds: discussionIds
            };
        }
    });

};
