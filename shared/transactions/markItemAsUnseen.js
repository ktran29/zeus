'use strict';

const actions = {
    createUnseenAEObject: require('../actions/createUnseenAEObject.js')
};

module.exports = (params) => {

    // Extract results
    const objectIds = params.objectIds;
    const userIds = params.userIds;
    const teamId = params.teamId;
    const updatedAt = params.updatedAt;

    return Promise.all(objectIds.map((objectId) => {
        return Promise.all(userIds.map((userId) => {
            return actions.createUnseenAEObject({
                objectId: objectId,
                userId: userId,
                teamId: teamId,
                updatedAt: updatedAt
            });
        }));
    }))

    .then(() => {

        return {
            success: true
        };
    });

};
