'use strict';

const actions = {
    getUserById: require('../actions/getUserById.js'),
    getChannelById: require('./getChannelById.js'),
    getTeamById: require('./getTeamById.js'),
    getAllUserIdMembershipsForObject: require('../actions/getAllUserIdMembershipsForObject.js'),
    getAllOfObjectTypeForUser: require('../actions/getAllOfObjectTypeForUser.js'),
    putUpdateField: require('../actions/putUpdateField.js'),
    getUserDataForTeamAndUser: require('../actions/getUserDataForTeamAndUser.js')
};

module.exports = (params) => {
    const teamId = params.teamId;
    const userId = params.userId;

    // Check to make sure the user is in the given team
    return actions.getUserDataForTeamAndUser({
        userId: userId,
        teamId: teamId
    })

    .then(() => {
        return Promise.all([
            // Gets all of the user's channels
            actions.getAllOfObjectTypeForUser({
                userId: userId,
                objectType: 'CHANNEL'
            }),
            // Gets all of the users in the given team
            actions.getAllUserIdMembershipsForObject({
                objectId: teamId
            }),
            // Updates the user's active team
            actions.putUpdateField({
                tableName: 'Users',
                objectId: userId,
                field: 'activeTeamId',
                value: teamId
            })
        ]);
    })

    .then((result) => {
        const channelIds = result[0].objectIds;
        const userIds = result[1].userIds;

        const getActiveTeam = actions.getTeamById(teamId);
        const getActiveUsers = actions.getUserById(userId);
        const getChannels = Promise.all(channelIds.map((channelId) => {
            return actions.getChannelById(channelId);
        }));
        const getUsers = Promise.all(userIds.map((userId) => {
            return actions.getUserById(userId);
        }));

        return Promise.all([
            getActiveTeam,
            getActiveUsers,
            getChannels,
            getUsers
        ]);

    })

    .then((result) => {

        const iTeam = result[0].iTeam;
        const iUser = result[1].iUser;
        const iChannels = result[2];
        const iUsers = result[3];

        const collapsedChannels = [];
        const collapsedUsers = [];

        iChannels.forEach((iChannel) => {
            collapsedChannels.push(iChannel.iChannel);
        });
        iUsers.forEach((iUser) => {
            collapsedUsers.push(iUser.iUser);
        });

        return {
            iTeam: iTeam,
            iUser: iUser,
            iChannels: collapsedChannels,
            iUsers: collapsedUsers
        };
    });
};
