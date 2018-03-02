'use strict';

const actions = {
    getAnnouncementsInChannel: require('./getAnnouncementsInChannel.js'),
    getChannelsInTeam: require('../actions/getChannelsInTeam.js')
};

const getUniqueArray = require('../utils/getUniqueArray.js');

const _ = require('lodash');

module.exports = (params) => {

    const teamId = params.teamId;
    const returnAsObjects = params.returnAsObjects;
    var channelIds = params.channelIds;

    return actions.getChannelsInTeam(teamId)

    .then((result) => {
        const teamChannelIds = result.channelIds;

        // if no channelIds are given, gets announcements for all channels in a team
        if(!channelIds) {
            channelIds = teamChannelIds;
        } else {
            channelIds = channelIds.split(',');

            // checks to see if given channels exist in the team
            channelIds = teamChannelIds.filter((channelId) => {
                return channelIds.indexOf(channelId) !== -1;
            });
        }
        return Promise.all(channelIds.map((channelId) => {
            return actions.getAnnouncementsInChannel({
                channelId: channelId,
                returnAsObjects: returnAsObjects
            });
        }));
    })

    .then((result) => {
        const channelAnnouncements = result;
        const announcements = [];
        var announcementIds = [];
        channelAnnouncements.forEach((channelAnnouncement) => {
            const iAnnouncements = channelAnnouncement.iAnnouncements;
            if(iAnnouncements) {
                iAnnouncements.forEach((iAnnouncement) => {
                    announcements.push(iAnnouncement);
                });
            }
            announcementIds.push(channelAnnouncement.announcementIds);
        });

        return {
            iAnnouncements: getUniqueArray(announcements),
            announcementIds: _.flatten(_.uniq(announcementIds))
        };
    });

};
