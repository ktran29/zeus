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
    getDiscussionById: require('../../shared/transactions/getDiscussionById.js')
};

module.exports.handler = new LambdaRequestHandler(GetDiscussionRequest_V0_Schema, (request) => {
    // Extract parameters
    const apiVersion = request.apiVersion;
    const discussionId = request.discussionId;
    const short = request.short && (request.short.toLowerCase() === 'true');


    return transactions.getDiscussionById({
        discussionId: discussionId,
        includeChildren: short
    })

    .then((result) => {
        // Extract results
        const iDiscussion = result.iDiscussion;

        switch(apiVersion) {
            case 'v0': {
                if(short) {
                    const iUser = result.iUser;
                    const iCommentThread = result.iCommentThread;
                    const iChannels = result.iChannels;
                    return {
                        discussion: converters.DiscussionConverter.convertToShortV0(iDiscussion),
                        user: converters.UserConverter.convertToShortV0(iUser),
                        commentThread: converters.CommentThreadConverter.convertToShortV0(iCommentThread),
                        channels: iChannels.map((iChannel) => {
                            return converters.ChannelConverter.convertToShortV0(iChannel);
                        })
                    };
                } else {
                    return {
                        discussion: converters.DiscussionConverter.convertToLongV0(iDiscussion)
                    };
                }
            }
            default: {
                throw new Error(`Unsupported api version: ${apiVersion}`);
            }
        }
    });
});
