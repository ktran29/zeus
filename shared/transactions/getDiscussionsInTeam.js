'use strict';

const actions = {
    getDiscussionsInChannel: require('./getDiscussionsInChannel.js'),
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

        // if no channelIds are given, gets discussions for all channels in a team
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
            return actions.getDiscussionsInChannel({
                channelId: channelId,
                returnAsObjects: returnAsObjects
            });
        }));
    })

    .then((result) => {
        const channelDiscussions = result;
        const discussions = [];
        var discussionIds = [];
        channelDiscussions.forEach((channelDiscussion) => {
            const iDiscussions = channelDiscussion.iDiscussions;
            if(iDiscussions){
                iDiscussions.forEach((iDiscussion) => {
                    discussions.push(iDiscussion);
                });
            }
            discussionIds.concat(channelDiscussion.discussionIds);
        });

        return {
            iDiscussions: getUniqueArray(discussions),
            discussionIds: _.flatten(_.uniq(discussionIds))
        };
    });

};
