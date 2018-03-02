'use strict';

// for validating request
const DeleteDiscussionRequest_V0_Schema = require('./DeleteDiscussionRequest_V0_Schema_generated.json');
// for outsourcing common request / response handling
const LambdaRequestHandler = require('../../shared/utils/LambdaRequestHandler.js');
// helper methods
const transactions = {
    deleteDiscussion: require('../../shared/transactions/deleteDiscussion.js')
};

module.exports.handler = new LambdaRequestHandler(DeleteDiscussionRequest_V0_Schema, (request) => {

    const apiVersion = request.apiVersion;
    const discussionId = request.discussionId;
    const teamId = request.teamId;

    return transactions.deleteDiscussion({
        discussionId: discussionId,
        teamId: teamId
    })

    .then((result) => {
        switch(apiVersion) {
            case 'v0': {
                return result;
            }

            default: {
                throw new Error(`Unsupported api version: ${apiVersion}`);
            }
        }
    });


});
