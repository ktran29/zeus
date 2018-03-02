'use strict';

// for validating request
const GetCommentThreadRequest_V0_Schema = require('./GetCommentThreadRequest_V0_Schema_generated.json');
// for creating validated response
const converters = {
    CommentThreadConverter: require('../../shared/converters/CommentThreadConverter.js'),
    CommentConverter: require('../../shared/converters/CommentConverter.js')
};
// for outsourcing common request / response handling
const LambdaRequestHandler = require('../../shared/utils/LambdaRequestHandler.js');
// helper methods
const transactions = {
    getCommentThread: require('../../shared/transactions/getCommentThreadById.js')
};

module.exports.handler = new LambdaRequestHandler(GetCommentThreadRequest_V0_Schema, (request) => {

    // Extract parameters
    const commentThreadId = request.commentThreadId;
    const includeComments = request.includeComments && (request.includeComments.toLowerCase() === 'true');
    const short = request.short && (request.short.toLowerCase() === 'true');
    const apiVersion = request.apiVersion;

    return transactions.getCommentThread({
        commentThreadId: commentThreadId,
        includeComments: includeComments,
    })

    .then((result) => {
        // Extract results
        const iCommentThread = result.iCommentThread;
        const iComments = result.iComments;

        switch (apiVersion) {
            case 'v0': {
                if(short) {
                    return {
                        commentThread: converters.CommentThreadConverter.convertToShortV0(iCommentThread)
                    };
                } else {
                    if(!includeComments) {
                        return {
                            commentThread: converters.CommentThreadConverter.convertToLongV0(iCommentThread)
                        }
                    } else {
                        return {
                            commentThread: converters.CommentThreadConverter.convertToLongV0(iCommentThread),
                            comments: iComments.map((iComment) => {
                                return converters.CommentConverter.convertToLongV0(iComment);
                            })
                        };
                    }
                }
            }

            default: {
                throw new Error(`Unsupported api version: ${apiVersion}`);
            }
        }

    });
});
