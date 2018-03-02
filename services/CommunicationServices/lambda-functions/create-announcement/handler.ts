'use strict';

const CreateAnnouncementRequest_V0_Schema = require('./CreateAnnouncementRequest_V0_Schema_generated.json');
const AnnouncementConverter = require('../../shared/converters/AnnouncementConverter.js');
const LambdaRequestHandler = require('../../shared/utils/LambdaRequestHandler.js');

const transactions = {
    createAnnouncement: require('../../shared/transactions/createAnnouncement.js')
};

module.exports.handler =  new LambdaRequestHandler(CreateAnnouncementRequest_V0_Schema, (request) => {
    // extract parameters
    const apiVersion = request.apiVersion;
    const userId = request.userId;
    const teamId = request.teamId;
    const text = request.text;
    const assignedChannelIds = request.assignedChannelIds;

    return transactions.createAnnouncement({
        userId: userId,
        teamId: teamId,
        text: text,
        assignedChannelIds: assignedChannelIds
    })

    .then((result) => {
        // Extract result
        const iAnnouncement = result.iAnnouncement;
        // Construct appropriate response based on api version
        switch(apiVersion) {
            case 'v0': {
                return {
                    announcement: AnnouncementConverter.convertToLongV0(iAnnouncement)
                };
            }
            default: {
                throw new Error(`Unsupported api version: ${apiVersion}`);
            }
        }
    });
});
