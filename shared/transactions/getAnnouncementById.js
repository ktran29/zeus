'use strict';

const _ = require('lodash');

const actions = {
    getAnnouncementById: require('../actions/getAnnouncementById.js'),
    getUserById: require('../actions/getUserById.js'),
    getChannelById: require('../actions/getChannelById.js'),
    getChannelAEIds: require('../actions/getChannelAEIds.js'),
    getAllAssociatedObjectsForObjectId: require('../actions/getAllAssociatedObjectsForObjectId.js')
};

module.exports = (params) => {
    // Extract parameters
    const announcementId = params.announcementId;
    const includeChildren = params.includeChildren;

    var iAnnouncement;

    return actions.getAnnouncementById(announcementId)

    .then((result) => {

        iAnnouncement = result.iAnnouncement;

        return Promise.all([
            actions.getAllAssociatedObjectsForObjectId({
                objectId: announcementId,
                associatedType: 'CHANNEL'
            }),
            actions.getChannelAEIds({
                partitionKey: 'objectId',
                partitionKeyId: announcementId
            })
        ]);
    })

    .then((result) => {

        const assignedChannelIds = _.uniq(result[0].associatedIds);
        const taggedChannelIds = _.uniq(result[1].channelIds);

        iAnnouncement.assignedChannelIds = assignedChannelIds;
        iAnnouncement.taggedChannelIds = taggedChannelIds;


        if(includeChildren) {
            const creatorId = iAnnouncement.creatorId;

            const getChannels = Promise.all(assignedChannelIds.map((channelId) => actions.getChannelById(channelId)));

            return Promise.all([
                actions.getUserById(creatorId),
                getChannels
            ])

            .then((result) => {
                const iUser = result[0].iUser;
                const iChannels = result[1];
                const collapsedChannels = [];
                iChannels.forEach((iChannel) => collapsedChannels.push(iChannel.iChannel));
                return {
                    iAnnouncement: iAnnouncement,
                    iUser: iUser,
                    iChannels: collapsedChannels
                };
            });

        } else {
            return {
                iAnnouncement: iAnnouncement
            };
        }
    });

};
