'use strict';

const _ = require('lodash');

const actions = {
    getChannelById: require('../actions/getChannelById.js'),
    getAnnouncementById: require('../actions/getAnnouncementById.js'),
    getUserById: require('../actions/getUserById.js'),
    getChannelAEIds: require('../actions/getChannelAEIds.js'),
    getAllObjectsForAssociatedObject: require('../actions/getAllObjectsForAssociatedObject.js')
};

const getUniqueArray = require('../utils/getUniqueArray.js');

module.exports = (params) => {

    const channelId = params.channelId;
    const includeChildren = params.includeChildren;
    const returnAsObjects = params.returnAsObjects;

    var announcementIds;
    var assignedChannelIds;
    var taggedChannelIds;

    return Promise.all([
        actions.getAllObjectsForAssociatedObject({
            associatedId: channelId,
            objectType: 'ANNOUNCEMENT'
        }),
        actions.getChannelAEIds({
            partitionKeyId: channelId,
            sortKeyId: 'ANNOUNCEMENT',
            partitionKey: 'channelId',
            sortKey: 'objectType'
        })
    ])

    .then((result) => {
        assignedChannelIds = _.uniq(result[0].associatedIds);
        taggedChannelIds = _.uniq(result[1].channelIds);

        announcementIds = result[0].objectIds;

        return Promise.all(announcementIds.map((announcementId) => actions.getAnnouncementById(announcementId)));
    })

    .then((result) => {
        const iAnnouncements = result;
        const collapsedAnnouncements = [];
        iAnnouncements.forEach((iAnnouncement) => {
            var announcement = iAnnouncement.iAnnouncement;
            announcement.assignedChannelIds = assignedChannelIds;
            announcement.taggedChannelIds = taggedChannelIds;
            collapsedAnnouncements.push(announcement);
        });

        if(includeChildren) {
            const creatorIds = [];
            var channelIds = [];
            collapsedAnnouncements.forEach((iAnnouncement) => {
                creatorIds.push(iAnnouncement.creatorId);
                channelIds = channelIds.concat(iAnnouncement.assignedChannelIds);
            });

            const getUsers = Promise.all(creatorIds.map((creatorId) => {
                return actions.getUserById(creatorId);
            }));

            const getChannels = Promise.all(channelIds.map((channelId) => {
                return actions.getChannelById(channelId);
            }));

            return Promise.all([
                getUsers,
                getChannels
            ])

            .then((result) => {
                const iUsers = result[0];
                const iChannels = result[1];

                const collapsedUsers = [];
                const collapsedChannels = [];

                iUsers.forEach((iUser) => collapsedUsers.push(iUser.iUser));
                iChannels.forEach((iChannel) => collapsedChannels.push(iChannel.iChannel));

                return {
                    iAnnouncements: getUniqueArray(collapsedAnnouncements),
                    iUsers: getUniqueArray(collapsedUsers),
                    iChannels: getUniqueArray(collapsedChannels)
                };
            });
        } else if(returnAsObjects) {
            return {
                iAnnouncements: getUniqueArray(collapsedAnnouncements)
            };
        } else {
            return {
                announcementIds: announcementIds
            };
        }
    });

};
