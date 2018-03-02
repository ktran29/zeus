'use strict';

const actions = {
    getAllUserIdMembershipsForObject: require('../actions/getAllUserIdMembershipsForObject.js'),
    getUserById: require('../actions/getUserById.js')
};

module.exports = (params) => {

    const objectId = params.objectId;
    const short = params.short;
    const returnAsObjects = params.returnAsObjects;

    var userIds;

    return actions.getAllUserIdMembershipsForObject({
        objectId: objectId
    })

    .then((result) => {
        userIds = result.userIds;
        return Promise.resolve();
    })

    .then(() => {
        if(short || returnAsObjects) {
            return Promise.all(userIds.map((userId) => actions.getUserById(userId)));
        }
    })

    .then((result) => {
        if(result) {
            var iUsers = result;
        }
        return {
            iUsers: iUsers,
            userIds: userIds
        };
    });
};
