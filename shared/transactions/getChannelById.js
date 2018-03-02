'use strict';

const actions = {
    getChannelById: require('../actions/getChannelById.js'),
    getAllUserIdMembershipsForObject: require('../actions/getAllUserIdMembershipsForObject.js')
};

module.exports = (channelId) => {

    return actions.getChannelById(channelId)

    .then((result) => {

        const iChannel = result.iChannel;

        return actions.getAllUserIdMembershipsForObject({
            objectId: channelId
        })

        .then((result) => {
            const memberIds = result.userIds;
            iChannel.memberIds = memberIds;
            return {
                iChannel: iChannel
            };
        });
    });

};
