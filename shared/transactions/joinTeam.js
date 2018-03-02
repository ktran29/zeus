'use strict';

const actions = {
    createUserData: require('../actions/createUserData.js'),
    getTeamById: require('./getTeamById.js'),
    getChannelById: require('./getChannelById.js'),
    getUserById: require('../actions/getUserById.js'),
    getUserDataForTeamAndUser: require('../actions/getUserDataForTeamAndUser.js'),
    putUpdateField: require('../actions/putUpdateField.js'),
    getTeamIdFromTeamCode: require('../actions/getTeamIdFromTeamCode.js'),
    createObjectUserMembership: require('../actions/createObjectUserMembership.js')
};

module.exports = (params) => {

    const userId = params.userId;
    const teamName = decodeURI(params.teamName);
    const teamCode = params.teamCode;

    var sharedData = {};


    return actions.getTeamIdFromTeamCode({
        teamName: teamName,
        teamCode: teamCode
    })

        .then((result) => {
            sharedData.teamId = result.teamId;

            return actions.createObjectUserMembership({
                objectId: sharedData.teamId,
                objectType: 'TEAM',
                userId: userId
            });
        })

        .then(() => {
            return actions.getTeamById(sharedData.teamId);
        })

        .then((result) => {
            sharedData.generalChannelId = result.iTeam.generalChannelId;
            return actions.createObjectUserMembership({
                objectId: sharedData.generalChannelId,
                userId: userId,
                objectType: 'CHANNEL'
            });
        })

        .then(() => {
            return actions.getUserDataForTeamAndUser({
                userId: userId,
                teamId: sharedData.teamId
            })

            .then((result) => {
                sharedData.userDataId = result.iUserData.objectId;
            })

            .catch(() => {
                return actions.createUserData({
                    userId: userId,
                    teamId: sharedData.teamId,
                });
            });
        })

        .then(() => {

            return Promise.all([
                actions.putUpdateField({
                    tableName: 'Users',
                    objectId: userId,
                    field: 'activeTeamId',
                    value: sharedData.teamId
                }),
                actions.putUpdateField({
                    tableName: 'Teams',
                    objectId: sharedData.teamId
                })
            ]);
        })

        .then(() => {
            const p1 = actions.getTeamById(sharedData.teamId);
            const p2 = actions.getChannelById(sharedData.generalChannelId);
            const p3 = actions.getUserById(userId);
            const p4 = actions.getUserDataForTeamAndUser({
                userId: userId,
                teamId: sharedData.teamId
            });
            return Promise.all([p1, p2, p3, p4]);
        })

        .then((results) => {
            const iTeam = results[0].iTeam;
            const iChannel = results[1].iChannel;
            const iUser = results[2].iUser;
            const iUserData = results[3].iUserData;
            return {
                iTeam: iTeam,
                iChannel: iChannel,
                iUser: iUser,
                iUserData: iUserData
            };
        });
};
