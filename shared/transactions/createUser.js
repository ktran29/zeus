'use strict';

const actions = {
    createUser: require('../actions/createUser.js'),
    getUserById: require('../actions/getUserById.js')
};

const Errors = require('../utils/Errors.js');
const ObjectAlreadyExistsError = Errors.ObjectAlreadyExistsError;

module.exports = (params) => {

    const userId = params.userId;
    const email = params.email;

    return actions.createUser({
        userId: userId,
        email: email
    })

    .catch(() => {
        throw new ObjectAlreadyExistsError('User', userId);
    })

    .then(() => {
        return actions.getUserById(userId);
    })

    .then((result) => {
        const iUser = result.iUser;
        return {
            iUser: iUser
        };
    });
};
