'use strict';

const _ = require('lodash');

const actions = {
    getAnnouncementById: require('../actions/getAnnouncementById.js'),
    getUserById: require('../actions/getUserById.js'),
    getAllObjectsForAssociatedObject: require('../actions/getAllObjectsForAssociatedObject.js'),
    getAllAssociatedObjectsForObjectId: require('../actions/getAllAssociatedObjectsForObjectId.js'),
    getChannelAEIds: require('../actions/getChannelAEIds.js'),
    getContentForTeam: require('../actions/getContentForTeam.js'),
    getAllOfObjectTypeForUser: require('../actions/getAllOfObjectTypeForUser.js'),
    getAnnouncementsInChannel: require('./getAnnouncementsInChannel.js')
};

const getUniqueArray = require('../utils/getUniqueArray.js');

module.exports = (params) => {

    const teamId = params.teamId;
    const userId = params.userId;
    const includeChildren = params.includeChildren;
    const returnAsObjects = params.returnAsObjects;

    var announcementIds;
    var channelAnnouncementIds = [];
    var collapsedAnnouncements = [];

    return actions.getAllOfObjectTypeForUser({
        userId: userId,
        objectType: 'CHANNEL'
    })

    .then((result) => {
        const channelIds = result.objectIds;

        return Promise.all(channelIds.map((channelId) => {
            return actions.getAnnouncementsInChannel({
                channelId: channelId
            });
        }));
    })

    .then((result) => {

        const channelAnnouncements = result;
        channelAnnouncements.forEach((channelAnnouncement) => {
            channelAnnouncementIds = channelAnnouncementIds.concat(channelAnnouncement.announcementIds);
        });

        return Promise.all([
            actions.getAllObjectsForAssociatedObject({
                associatedId: userId,
                objectType: 'ANNOUNCEMENT'
            }),
            actions.getContentForTeam({
                teamId: teamId,
                tableName: 'Announcements'
            }),

        ]);
    })

    .then((result) => {
        announcementIds = result[0].objectIds;
        announcementIds = announcementIds.concat(channelAnnouncementIds);
        const teamAnnouncementIds = result[1].objectIds;

        // Finds the difference between user announcement ids and team announcement ids
        // Then pulls difference from user announcement ids
        announcementIds = _.without(announcementIds, _.difference(announcementIds, teamAnnouncementIds));

        return Promise.all(announcementIds.map((announcementId) => actions.getAnnouncementById(announcementId)));
    })

    .then((result) => {
        const iAnnouncements = result;

        return Promise.all(iAnnouncements.map((iAnnouncement) => {
            var announcement = iAnnouncement.iAnnouncement;
            const announcementId = announcement.objectId;

            return Promise.all([
                actions.getAllAssociatedObjectsForObjectId({
                    objectId: announcementId,
                    associatedType: 'CHANNEL'
                }),
                actions.getChannelAEIds({
                    partitionKey: 'objectId',
                    partitionKeyId: announcementId
                })
            ])

            .then((result) => {

                const assignedChannelIds = _.uniq(result[0].associatedIds);
                const taggedChannelIds = _.uniq(result[1].channelIds);

                announcement.assignedChannelIds = assignedChannelIds;
                announcement.taggedChannelIds = taggedChannelIds;

                collapsedAnnouncements.push(announcement);
            });
        }));
    })

    .then(() => {
        if(includeChildren) {
            const creatorIds = [];
            const channelIds = [];
            collapsedAnnouncements.forEach((iAnnouncement) => {
                creatorIds.push(iAnnouncement.creatorId);
                channelIds.concat(iAnnouncement.assignedChannelIds);
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
        } else if(returnAsObjects){
            return {
                iAnnouncements: collapsedAnnouncements
            };
        } else {
            return {
                announcementIds: announcementIds
            };
        }
    });

};
