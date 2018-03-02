'use strict';

const actions = {
    getTeamIdFromTeamCode: require('../actions/getTeamIdFromTeamCode.js'),
    getTeamById: require('../actions/getTeamById.js')
};

module.exports = (params) => {

    const teamName = params.teamName;
    const teamCode = params.teamCode;

    var sharedData = {};

    return actions.getTeamIdFromTeamCode(teamName, teamCode)

    .then((result) => {
        sharedData.teamId = result.teamId;

        return actions.getTeamById(sharedData.teamId);
    })

    .then((result) => {

        const iTeam = result.iTeam;

        return {
            iTeam: iTeam
        };
    });

};
