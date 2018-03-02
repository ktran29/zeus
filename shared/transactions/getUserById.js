'use strict';

const actions = {
    getUserById: require('../actions/getUserById.js')
};

module.exports = (userId) => {

    return actions.getUserById(userId)

    .then((results) => {
        const iUser = results.iUser;
        return {
            iUser: iUser
        };
    });
};
