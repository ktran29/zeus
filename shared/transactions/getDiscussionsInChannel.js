'use strict';

const _ = require('lodash');

const actions = {
    getChannelById: require('../actions/getChannelById.js'),
    getDiscussionById: require('../actions/getDiscussionById.js'),
    getUserById: require('../actions/getUserById.js'),
    getCommentThreadById: require('../actions/getCommentThreadById.js'),
    getChannelAEIds: require('../actions/getChannelAEIds.js'),
    getAllObjectsForAssociatedObject: require('../actions/getAllObjectsForAssociatedObject.js')
};

const getUniqueArray = require('../utils/getUniqueArray.js');

module.exports = (params) => {

    const channelId = params.channelId;
    const includeChildren = params.includeChildren;
    const returnAsObjects = params.returnAsObjects;

    var discussionIds;
    var assignedChannelIds;
    var taggedChannelIds;

    return Promise.all([
        actions.getAllObjectsForAssociatedObject({
            associatedId: channelId,
            objectType: 'DISCUSSION'
        }),
        actions.getChannelAEIds({
            partitionKeyId: channelId,
            sortKeyId: 'DISCUSSION',
            partitionKey: 'channelId',
            sortKey: 'objectType'
        })
    ])

    .then((result) => {
        assignedChannelIds = _.uniq(result[0].associatedIds);
        taggedChannelIds = _.uniq(result[1].channelIds);

        discussionIds = result[0].objectIds;

        return Promise.all(discussionIds.map((discussionId) => actions.getDiscussionById(discussionId)));
    })

    .then((result) => {
        const iDiscussions = result;
        const collapsedDiscussions = [];
        iDiscussions.forEach((iDiscussion) => {
            var discussion = iDiscussion.iDiscussion;
            discussion.assignedChannelIds = assignedChannelIds;
            discussion.taggedChannelIds = taggedChannelIds;
            collapsedDiscussions.push(discussion);
        });
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
