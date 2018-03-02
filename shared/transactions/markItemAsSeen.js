'use strict';

const actions = {
    markItemAsSeen: require('../actions/markItemAsSeen.js')
};

module.exports = (params) => {

    // Extract results
    const objectId = params.objectId;
    const userId = params.userId;
    const teamId = params.teamId;

    return actions.markItemAsSeen({
        objectId: objectId,
        userId: userId,
        teamId: teamId
    })

    .then((result) => {

        const success = result && result.constructor === Object && Object.keys(result).length === 0;

        return {
            success: success
        };
    });

};
