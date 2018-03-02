'use strict';

const GetAnnouncementRequest_V0_Schema = require('./GetAnnouncementRequest_V0_Schema_generated.json');
const converters = {
    AnnouncementConverter: require('../../shared/converters/AnnouncementConverter.js'),
    UserConverter: require('../../shared/converters/UserConverter.js'),
    ChannelConverter: require('../../shared/converters/ChannelConverter.js')
}
const LambdaRequestHandler = require('../../shared/utils/LambdaRequestHandler.js');

const transactions = {
    getAnnouncementById: require('../../shared/transactions/getAnnouncementById.js')
};

module.exports.handler = new LambdaRequestHandler(GetAnnouncementRequest_V0_Schema, (request) => {
    // Extract parameters
    const apiVersion = request.apiVersion;
    const announcementId = request.announcementId;
    const short = request.short && (request.short.toLowerCase() === 'true');

    return transactions.getAnnouncementById({
        announcementId: announcementId,
        includeChildren: short
    })

    .then((result) => {
        // Extract result
        const iAnnouncement = result.iAnnouncement;
        // Construct appropriate response based on api version
        switch(apiVersion) {
            case 'v0': {
                if(short) {
                    const iUser = result.iUser;
                    const iChannels = result.iChannels;
                    return {
                        announcement: converters.AnnouncementConverter.convertToShortV0(iAnnouncement),
                        user: converters.UserConverter.convertToShortV0(iUser),
                        channels: iChannels.map((iChannel) => {
                            return converters.ChannelConverter.convertToShortV0(iChannel);
                        })
                    };
                } else {
                    return {
                        announcement: converters.AnnouncementConverter.convertToLongV0(iAnnouncement)
                    };
                }
            }
            default: {
                throw new Error(`Unsupported api version: ${apiVersion}`);
            }
        }
    });
});
