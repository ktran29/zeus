'use strict';

const actions = {
    createObjectUserMembership: require('../actions/createObjectUserMembership.js'),
    getChannelById: require('./getChannelById.js'),
    getUserDataForTeamAndUser: require('../actions/getUserDataForTeamAndUser.js'),
    putUpdateField: require('../actions/putUpdateField.js')
};

module.exports = (params) => {

    const channelId = params.channelId;
    const teamId = params.teamId;
    const userIds = params.userIds;

    return Promise.all(userIds.map((userId) => {
        return actions.getUserDataForTeamAndUser({
            userId: userId,
            teamId: teamId
        })

        .then(() => {
            return actions.createObjectUserMembership({
                objectId: channelId,
                userId: userId,
                objectType: 'CHANNEL'
            });
        })

        .catch(() => {
            console.log('User is not part of the team');
        });
    }))

    .then(() => {
        return actions.putUpdateField({
            tableName: 'Channels',
            objectId: channelId
        });
    })

    .then(() => {
        return actions.getChannelById(channelId);
    })

    .then((result) => {
        return {
            iChannel: result.iChannel
        };
    });
};
