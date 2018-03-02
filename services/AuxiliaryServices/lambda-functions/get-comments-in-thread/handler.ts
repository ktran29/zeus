'use strict';

// for validating request
const GetCommentRequest_V0_Schema = require('./GetCommentRequest_V0_Schema_generated.json');
// for converting validated response
const CommentConverter = require('../../shared/converters/CommentConverter.js');
// for outsourcing common request / response handling
const LambdaRequestHandler = require('../../shared/utils/LambdaRequestHandler.js');
// helper methods
const transactions = {
    getCommentsInThread: require('../../shared/actions/getCommentsInThread.js')
};

module.exports.handler = new LambdaRequestHandler(GetCommentRequest_V0_Schema, (request) => {

    const commentThreadId = request.commentThreadId;
    const before = request.before;
    const max = request.max;
    const apiVersion = request.apiVersion;

    return transactions.getCommentsInThread({
        commentThreadId: commentThreadId,
        before: before,
        max: max
    })

    .then((result) => {
        const iComments = result.iComments;

        switch (apiVersion) {
            case 'v0': {
                return {
                    comments: iComments.map((iComment) => {
                        return CommentConverter.convertToLongV0(iComment);
                    })
                };
            }

            default: {
                throw new Error(`Unsupported api version: ${apiVersion}`);
            }
        }

    });
});
