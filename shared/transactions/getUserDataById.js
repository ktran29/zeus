'use strict';

const actions = {
    getUserDataById: require('../actions/getUserDataById.js')
};

module.exports = (userDataId) => {

    return actions.getUserDataById(userDataId)

    .then((results) => {
        // extract results
        const iUserData = results.iUserData;

        return {
            iUserData: iUserData
        };
    });
};
