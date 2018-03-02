'use strict';

const actions = {
    getUserDataForTeamAndUser: require('../actions/getUserDataForTeamAndUser.js')
};

module.exports = (params) => {

    // extract parameters
    const userId = params.userId;
    const teamId = params.teamId;

    return actions.getUserDataForTeamAndUser({
        userId: userId,
        teamId: teamId
    })

    .then((results) => {
        // extract results
        const iUserData = results.iUserData;

        return {
            iUserData: iUserData
        };
    });
};
