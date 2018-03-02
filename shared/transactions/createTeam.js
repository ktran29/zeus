'use strict';

const actions = {
    createTeam: require('../actions/createTeam.js'),
    createChannel: require('./createChannel.js'),
    getTeamById: require('./getTeamById.js'),
    getUserById: require('../actions/getUserById.js'),
    createUserData: require('../actions/createUserData.js'),
    putUpdateField: require('../actions/putUpdateField.js'),
    getChannelById: require('./getChannelById.js'),
    getUserDataById: require('../actions/getUserDataById.js'),
    createTeamNameMap: require('../actions/createTeamNameMap.js'),
    createObjectUserMembership: require('../actions/createObjectUserMembership.js')
};

module.exports = (params) => {

    // extract parameters
    const teamName = params.teamName;
    const userId = params.userId;

    var sharedData = {};

    return actions.createTeam({
        teamName: teamName,
        userId: userId
    })

    .then((result) => {
        sharedData.teamId = result.teamId;

        const createObjectUserMembership = actions.createObjectUserMembership({
            objectId: sharedData.teamId,
            userId: userId,
            objectType: 'TEAM'
        });

        const createChannel = actions.createChannel({
            channelName: 'general',
            creatorId: userId,
            teamId: sharedData.teamId
        });
        const createTeamNameCodeMap = actions.createTeamNameMap({
            teamName: teamName,
            teamId: sharedData.teamId
        });

        return Promise.all([
            createChannel,
            createTeamNameCodeMap,
            createObjectUserMembership
        ]);
    })

    .then((result) => {
        sharedData.channelId = result[0].iChannel.objectId;
        sharedData.teamCode = result[1].iTeamCode;

        const createUserDataFromNewTeam = actions.createUserData({
            userId: userId,
            teamId: sharedData.teamId
        });
        const setNewTeamToActiveTeam = actions.putUpdateField({
            tableName: 'Users',
            objectId: userId,
            field: 'activeTeamId',
            value: sharedData.teamId
        });

        const addChannelIntoTeam = actions.putUpdateField({
            tableName: 'Teams',
            objectId: sharedData.teamId,
            field: 'generalChannelId',
            value: sharedData.channelId,
        });
        const addTeamCodeToTeam = actions.putUpdateField({
            tableName: 'Teams',
            objectId: sharedData.teamId,
            field: 'code',
            value: sharedData.teamCode
        });

        return Promise.all([
            createUserDataFromNewTeam,
            setNewTeamToActiveTeam,
            addChannelIntoTeam,
            addTeamCodeToTeam
        ]);
    })

    .then((result) => {
        const userDataId = result[0].userDataId;

        const getNewTeamById = actions.getTeamById(sharedData.teamId);
        const getNewChannelById = actions.getChannelById(sharedData.channelId);
        const getUserObjectById = actions.getUserById(userId);
        const getNewUserDataById = actions.getUserDataById(userDataId);

        return Promise.all([
            getNewTeamById,
            getNewChannelById,
            getUserObjectById,
            getNewUserDataById
        ]);
    })

    .then((result) => {
        const iTeam = result[0].iTeam;
        const iChannel = result[1].iChannel;
        const iUser = result[2].iUser;
        const iUserData = result[3].iUserData;

        return {
            iTeam: iTeam,
            iChannel: iChannel,
            iUser: iUser,
            iUserData: iUserData
        };
    });
};
