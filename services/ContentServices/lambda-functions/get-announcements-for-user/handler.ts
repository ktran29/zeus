'use strict';

const GetAnnouncementRequest_V0_Schema = require('./GetAnnouncementRequest_V0_Schema_generated.json');
const converters = {
    AnnouncementConverter: require('../../shared/converters/AnnouncementConverter.js'),
    ChannelConverter: require('../../shared/converters/ChannelConverter.js'),
    UserConverter: require('../../shared/converters/UserConverter.js')
}
const LambdaRequestHandler = require('../../shared/utils/LambdaRequestHandler.js');

const transactions = {
    getAnnouncementsForUser: require('../../shared/transactions/getAnnouncementsForUser.js')
};

module.exports.handler = new LambdaRequestHandler(GetAnnouncementRequest_V0_Schema, (request) => {

    const teamId = request.teamId;
    const userId = request.userId;
    const apiVersion = request.apiVersion;
    const short = request.short && (request.short.toLowerCase() === 'true');
    const returnAsObjects = request.returnAsObjects && (request.returnAsObjects.toLowerCase() === 'true');

    return transactions.getAnnouncementsForUser({
        teamId: teamId,
        userId: userId,
        includeChildren: short,
        returnAsObjects: returnAsObjects
    })

    .then((results) => {

        const iAnnouncements = results.iAnnouncements;
        const announcementIds = results.announcementIds;

        // construct the appropriate response based on the api version
        switch (apiVersion) {
            case 'v0': {
                if(short) {
                    const iUsers = results.iUsers;
                    const iChannels = results.iChannels;
                    return {
                        announcements: iAnnouncements.map((iAnnouncement) =>
                            converters.AnnouncementConverter.convertToShortV0(iAnnouncement)
                        ),
                        channels: iChannels.map((iChannel) => converters.ChannelConverter.convertToShortV0(iChannel)),
                        users: iUsers.map((iUser) => converters.UserConverter.convertToShortV0(iUser))
                    };
                } else if(returnAsObjects){
                    return {
                        announcements: iAnnouncements.map((iAnnouncement) =>
                            converters.AnnouncementConverter.convertToLongV0(iAnnouncement))
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
