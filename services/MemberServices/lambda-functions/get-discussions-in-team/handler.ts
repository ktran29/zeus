'use strict';

const GetDiscussionRequest_V0_Schema = require('./GetDiscussionRequest_V0_Schema_generated.json');
const DiscussionConverter = require('../../shared/converters/DiscussionConverter');
const LambdaRequestHandler = require('../../shared/utils/LambdaRequestHandler.js');

const transactions = {
    getDiscussionsInTeam: require('../../shared/transactions/getDiscussionsInTeam.js')
};

module.exports.handler = new LambdaRequestHandler(GetDiscussionRequest_V0_Schema, (request) => {

    const teamId = request.teamId;
    const channelIds = request.channels;
    const returnAsObjects = request.returnAsObjects && (request.returnAsObjects.toLowerCase() === 'true');

    const apiVersion = request.apiVersion;

    return transactions.getDiscussionsInTeam({
        teamId: teamId,
        channelIds: channelIds,
        returnAsObjects
    })

    .then((results) => {

        const iDiscussions = results.iDiscussions;
        const discussionIds = results.discussionIds;

        // construct the appropriate response based on the api version
        switch (apiVersion) {
            case 'v0': {
                if(returnAsObjects) {
                    return {
                        discussions: iDiscussions.map(
                            (iDiscussion) => {
                                return DiscussionConverter.convertToLongV0(iDiscussion);
                            })
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
