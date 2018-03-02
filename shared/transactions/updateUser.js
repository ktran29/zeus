'use strict';

const actions = {
    updateUser: require('../actions/updateUser.js'),
    getUserById: require('../actions/getUserById.js')
};

module.exports = (params) => {

    const userId = params.userId;
    const firstName = params.firstName;
    const lastName = params.lastName;
    const middleName = params.middleName;

    return actions.getUserById(userId)


    .then(() => {
        return actions.updateUser({
            userId: userId,
            firstName: firstName,
            lastName: lastName,
            middleName: middleName
        });
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
