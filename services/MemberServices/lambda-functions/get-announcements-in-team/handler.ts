'use strict';

const GetAnnouncementRequest_V0_Schema = require('./GetAnnouncementRequest_V0_Schema_generated.json');
const AnnouncementConverter = require('../../shared/converters/AnnouncementConverter');
const LambdaRequestHandler = require('../../shared/utils/LambdaRequestHandler.js');

const transactions = {
    getAnnouncementsInTeam: require('../../shared/transactions/getAnnouncementsInTeam.js')
};

module.exports.handler = new LambdaRequestHandler(GetAnnouncementRequest_V0_Schema, (request) => {

    const teamId = request.teamId;
    const channelIds = request.channels;
    const returnAsObjects = request.returnAsObjects && (request.returnAsObjects.toLowerCase() === 'true');

    const apiVersion = request.apiVersion;

    return transactions.getAnnouncementsInTeam({
        teamId: teamId,
        channelIds: channelIds,
        returnAsObjects: returnAsObjects
    })

    .then((results) => {

        const iAnnouncements = results.iAnnouncements;
        const announcementIds = results.announcementIds;

        // construct the appropriate response based on the api version
        switch (apiVersion) {
            case 'v0': {
                if(returnAsObjects) {
                    return {
                        announcements: iAnnouncements.map(
                            (iAnnouncement) => {
                                return AnnouncementConverter.convertToLongV0(iAnnouncement);
                            })
                    };
                } else {
                    return {
                        announcementIds: announcementIds
                    }
                }
            }
            default: {
                throw new Error(`Unsupported api version: ${apiVersion}`);
            }
        }
    });
});
