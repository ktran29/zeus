'use strict';

const _ = require('lodash');

const actions = {
    getDiscussionById: require('../actions/getDiscussionById.js'),
    getUserById: require('../actions/getUserById.js'),
    getCommentThreadById: require('../actions/getCommentThreadById.js'),
    getChannelById: require('./getChannelById.js'),
    getChannelAEIds: require('../actions/getChannelAEIds.js'),
    getAllAssociatedObjectsForObjectId: require('../actions/getAllAssociatedObjectsForObjectId.js')
};

module.exports = (params) => {

    // Extract parameters
    const discussionId = params.discussionId;
    const includeChildren = params.includeChildren;

    var iDiscussion;

    return actions.getDiscussionById(discussionId)

    .then((result) => {
        iDiscussion = result.iDiscussion;

        return Promise.all([
            actions.getAllAssociatedObjectsForObjectId({
                objectId: discussionId,
                associatedType: 'CHANNEL'
            }),
            actions.getChannelAEIds({
                partitionKey: 'objectId',
                partitionKeyId: discussionId
            })
        ]);
    })

    .then((result) => {

        const assignedChannelIds = _.uniq(result[0].associatedIds);
        const taggedChannelIds = _.uniq(result[1].channelIds);

        iDiscussion.assignedChannelIds = assignedChannelIds;
        iDiscussion.taggedChannelIds = taggedChannelIds;

        if(includeChildren) {

            const creatorId = iDiscussion.creatorId;
            const commentThreadId = iDiscussion.commentThreadId;

            const getChannels = Promise.all(assignedChannelIds.map((channelId) => actions.getChannelById(channelId)));

            return Promise.all([
                actions.getUserById(creatorId),
                actions.getCommentThreadById(commentThreadId),
                getChannels
            ])

            .then((result) => {
                const iUser = result[0].iUser;
                const iCommentThread = result[1].iCommentThread;
                const iChannels = result[2];

                const collapsedChannels = [];
                iChannels.forEach((iChannel) => collapsedChannels.push(iChannel.iChannel));

                return {
                    iDiscussion: iDiscussion,
                    iUser: iUser,
                    iCommentThread: iCommentThread,
                    iChannels: collapsedChannels
                };
            });
        } else {
            return {
                iDiscussion: iDiscussion
            };
        }
    });
};
