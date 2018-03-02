'use strict';

const _ = require('lodash');

const actions = {
    getChannelsInTeam: require('../actions/getChannelsInTeam.js'),
    getAllOfObjectTypeForUser: require('../actions/getAllOfObjectTypeForUser.js'),
    getChannelById: require('../actions/getChannelById.js'),
    getAllUserIdMembershipsForObject: require('../actions/getAllUserIdMembershipsForObject.js')
};

module.exports = (params) => {

    const teamId = params.teamId;
    const userId = params.userId;

    return Promise.all([
        actions.getAllOfObjectTypeForUser({
            userId: userId,
            objectType: 'CHANNEL'
        }),
        actions.getChannelsInTeam(teamId)
    ])

    .then((result) => {
        var channelIds = result[0].objectIds;
        const teamChannelIds = result[1].channelIds;

        // Finds the difference between user channel ids and team channel ids
        // Then pulls difference from user channel ids
        channelIds = _.without(channelIds, _.difference(channelIds, teamChannelIds));

        return Promise.all(channelIds.map((channelId) => actions.getChannelById(channelId)));
    })

    .then((result) => {
        const iChannels = result;
        const collapsedChannels = [];
        return Promise.all(iChannels.map((iChannel) => {

            const channel = iChannel.iChannel;
            const objectId = channel.objectId;

            return actions.getAllUserIdMembershipsForObject({
                objectId: objectId
            })

            .then((result) => {
                const memberIds = result.userIds;
                channel.memberIds = memberIds;
                collapsedChannels.push(channel);
            });
        }))

        .then(() => {
            return {
                iChannels: collapsedChannels
            };
        });
    });

};
