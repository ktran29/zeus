'use strict';

const _ = require('lodash');

const actions = {
    createChannel: require('../actions/createChannel.js'),
    getChannelById: require('./getChannelById.js'),
    createObjectUserMembership: require('../actions/createObjectUserMembership.js')
};

module.exports = (params) => {

    // extract parameters
    const channelName = params.channelName;
    const teamId = params.teamId;
    const creatorId = params.creatorId;
    var memberIds = params.memberIds || [];

    memberIds = _.uniq(memberIds.concat(creatorId));

    var channelId;

    return actions.createChannel({
        channelName: channelName,
        teamId: teamId,
        creatorId: creatorId
    })

    .then((result) => {
        channelId = result.channelId;

        return Promise.all(memberIds.map((memberId) => {
            return actions.createObjectUserMembership({
                objectId: channelId,
                userId: memberId,
                objectType: 'CHANNEL'
            });
        }));
    })

    .then(() => {
        return actions.getChannelById(channelId);
    })

    .then((result) => {
        const iChannel = result.iChannel;
        return {
            iChannel: iChannel
        };
    });
};
