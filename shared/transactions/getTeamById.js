'use strict';

const actions = {
    getTeamById: require('../actions/getTeamById.js'),
    getAllUserIdMembershipsForObject: require('../actions/getAllUserIdMembershipsForObject.js'),
    getChannelsInTeam: require('../actions/getChannelsInTeam.js')
};

module.exports = (teamId) => {

    return actions.getTeamById(teamId)

    .then((result) => {

        const iTeam = result.iTeam;

        return Promise.all([
            actions.getAllUserIdMembershipsForObject({
                objectId: teamId
            }),
            actions.getChannelsInTeam(teamId)
        ])

        .then((result) => {
            const memberIds = result[0].userIds;
            const channelIds = result[1].channelIds;

            iTeam.memberIds = memberIds;
            iTeam.channelIds = channelIds;

            return {
                iTeam: iTeam
            };
        });
    });

};
