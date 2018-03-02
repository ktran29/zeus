'use strict';

const actions = {
    getUserDataForTeamAndUser: require('../actions/getUserDataForTeamAndUser.js'),
    getBoardById: require('./getBoardById.js'),
    createObjectUserMembership: require('../actions/createObjectUserMembership.js'),
    putUpdateField: require('../actions/putUpdateField.js')
};

module.exports = (params) => {

    const teamId = params.teamId;
    const userIds = params.userIds;
    const boardId = params.boardId;

    return Promise.all(userIds.map((userId) => {
        return actions.getUserDataForTeamAndUser({
            teamId: teamId,
            userId: userId
        })

        .then(() => {
            return actions.createObjectUserMembership({
                objectId: boardId,
                userId: userId,
                objectType: 'BOARD'
            });
        });
    }))

    .then(() => {
        return actions.putUpdateField({
            tableName: 'Boards',
            objectId: boardId
        });
    })

    .then(() => {
        return actions.getBoardById({
            boardId: boardId
        });
    })

    .then((result) => {
        const iBoard = result.iBoard;

        return {
            iBoard: iBoard
        };
    });


};
