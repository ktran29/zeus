'use strict';

// for validating request
const DeleteCommentRequest_V0_Schema = require('./DeleteCommentRequest_V0_Schema_generated.json');
// for outsourcing common request / response handling
const LambdaRequestHandler = require('../../shared/utils/LambdaRequestHandler.js');
// helper methods
const transactions = {
    deleteComment: require('../../shared/transactions/deleteComment.js')
};

module.exports.handler = new LambdaRequestHandler(DeleteCommentRequest_V0_Schema, (request) => {

    const apiVersion = request.apiVersion;
    const commentId = request.commentId;
    const teamId = request.teamId;

    return transactions.deleteComment({
        commentId: commentId,
        teamId: teamId
    })

    .then((result) => {
        const success = result.success;

        switch(apiVersion) {
            case 'v0': {
                return {
                    success: success
                };
            }

            default: {
                throw new Error(`Unsupported api version: ${apiVersion}`);
            }
        }
    });


});
