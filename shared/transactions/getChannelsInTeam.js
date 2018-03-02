'use strict';

const actions = {
    getChannelsInTeam: require('../actions/getChannelsInTeam.js'),
    getChannelById: require('../actions/getChannelById.js'),
    getAllUserIdMembershipsForObject: require('../actions/getAllUserIdMembershipsForObject.js')
};

module.exports = (teamId) => {

    return actions.getChannelsInTeam(teamId)

    .then((result) => {
        const channelIds = result.channelIds;

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
