'use strict';

const actions = {
    deleteObjectUserMembership: require('../actions/deleteObjectUserMembership.js'),
    getAllUserIdMembershipsForObject: require('../actions/getAllUserIdMembershipsForObject.js'),
    deleteBoard: require('./deleteBoard.js'),
    putUpdateField: require('../actions/putUpdateField.js')
};

module.exports = (params) => {
    const userId = params.userId;
    const boardId = params.boardId;

    return actions.getAllUserIdMembershipsForObject({
        objectId: boardId
    })

    .then((result) => {
        const userIds = result.userIds;

        if(userIds.length === 1) {
            return actions.deleteBoard({
                boardId: boardId
            });
        } else {
            var removeMembershipSuccess;

            return actions.deleteObjectUserMembership({
                userId: userId,
                objectId: boardId
            })

            .then((result) => {
                removeMembershipSuccess = result && result.constructor === Object && Object.keys(result).length === 0;

                return actions.putUpdateField({
                    tableName: 'Boards',
                    objectId: boardId
                });
            })

            .then(() => {
                return {
                    success: removeMembershipSuccess
                };
            });
        }
    })

    .then((result) => {
        const success = result.success || result;

        return {
            success: success
        };
    });
};
