'use strict';

const CreateDiscussionRequest_V0_Schema = require('./CreateDiscussionRequest_V0_Schema_generated.json');
const DiscussionConverter = require('../../shared/converters/DiscussionConverter.js');
const LambdaRequestHandler = require('../../shared/utils/LambdaRequestHandler.js');

const transactions = {
    createDiscussion: require('../../shared/transactions/createDiscussion.js')
};

module.exports.handler = new LambdaRequestHandler(CreateDiscussionRequest_V0_Schema, (request) => {
    // Extract parameters
    const apiVersion = request.apiVersion;
    const creatorId = request.creatorId;
    const assignedChannelIds = request.assignedChannelIds;
    const originalPostText = request.originalPostText;
    const teamId = request.teamId;

    return transactions.createDiscussion({
        creatorId: creatorId,
        assignedChannelIds: assignedChannelIds,
        originalPostText: originalPostText,
        teamId: teamId
    })

    .then((result) => {
        // Extract results
        const iDiscussion = result.iDiscussion;

        switch(apiVersion) {
            case 'v0': {
                return {
                    discussion: DiscussionConverter.convertToLongV0(iDiscussion)
                };
            }
            default:
                throw new Error(`Unsupported api version: ${apiVersion}`);
        }
    });
});
