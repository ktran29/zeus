'use strict';

// for validating request
const CreateCommentRequest_V0_Schema = require('./CreateCommentRequest_V0_Schema_generated.json');
// for converting validated response
const converters = {
    CommentConverter: require('../../shared/converters/CommentConverter.js'),
    CommentThreadConverter: require('../../shared/converters/CommentThreadConverter.js')
};
// for outsourcing common request / response handling
const LambdaRequestHandler = require('../../shared/utils/LambdaRequestHandler.js');
// helper methods
const transactions = {
    createComment: require('../../shared/transactions/createComment.js')
};

module.exports.handler = new LambdaRequestHandler(CreateCommentRequest_V0_Schema, (request) => {

    const commentThreadId = request.commentThreadId;
    const commentText = request.commentText;
    const userId = request.userId;
    const teamId = request.teamId;
    const apiVersion = request.apiVersion;

    return transactions.createComment({
        commentThreadId: commentThreadId,
        commentText: commentText,
        userId: userId,
        teamId: teamId
    })

    .then((result) => {
        const iComment = result.iComment;
        const iCommentThread = result.iCommentThread;

        switch (apiVersion) {
            case 'v0': {
                return {
                    comment: converters.CommentConverter.convertToLongV0(iComment),
                    commentThread: converters.CommentThreadConverter.convertToLongV0(iCommentThread)
                };
            }

            default: {
                throw new Error(`Unsupported api version: ${apiVersion}`);
            }
        }

    });
});
