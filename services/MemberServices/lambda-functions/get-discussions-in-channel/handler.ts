'use strict';

const GetDiscussionRequest_V0_Schema = require('./GetDiscussionRequest_V0_Schema_generated.json');
const converters = {
    DiscussionConverter: require('../../shared/converters/DiscussionConverter.js'),
    UserConverter: require('../../shared/converters/UserConverter.js'),
    CommentThreadConverter: require('../../shared/converters/CommentThreadConverter.js'),
    ChannelConverter: require('../../shared/converters/ChannelConverter.js'),
};
const LambdaRequestHandler = require('../../shared/utils/LambdaRequestHandler.js');

const transactions = {
    getDiscussionsInChannel: require('../../shared/transactions/getDiscussionsInChannel.js')
};

module.exports.handler = new LambdaRequestHandler(GetDiscussionRequest_V0_Schema, (request) => {

    const channelId = request.channelId;
    const apiVersion = request.apiVersion;
    const short = request.short && (request.short.toLowerCase() === 'true');
    const returnAsObjects = request.returnAsObjects && (request.returnAsObjects.toLowerCase() === 'true');

    return transactions.getDiscussionsInChannel({
        channelId: channelId,
        includeChildren: short,
        returnAsObjects: returnAsObjects
    })

    .then((results) => {

        const iDiscussions = results.iDiscussions;
        const discussionIds = results.discussionIds;

        // construct the appropriate response based on the api version
        switch (apiVersion) {
            case 'v0': {
                if(short) {
                    const iUsers = results.iUsers;
                    const iCommentThreads = results.iCommentThreads;
                    const iChannels = results.iChannels;
                    return {
                        discussions: iDiscussions.map((iDiscussion) =>
                            converters.DiscussionConverter.convertToShortV0(iDiscussion)
                        ),
                        users: iUsers.map((iUser) => converters.UserConverter.convertToShortV0(iUser)),
                        commentThreads: iCommentThreads.map((iCommentThread) =>
                            converters.CommentThreadConverter.convertToShortV0(iCommentThread)
                        ),
                        channels: iChannels.map((iChannel) => converters.ChannelConverter.convertToShortV0(iChannel))

                    };
                } else if(returnAsObjects){
                    return {
                        discussions: iDiscussions.map(
                            (iDiscussion) => converters.DiscussionConverter.convertToLongV0(iDiscussion)
                        )
                    };
                } else {
                    return {
                        discussionIds: discussionIds
                    }
                }
            }
            default: {
                throw new Error(`Unsupported api version: ${apiVersion}`);
            }
        }
    });
});
