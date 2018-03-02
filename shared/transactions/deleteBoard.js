'use strict';

const actions = {
    getBoardById: require('../actions/getBoardById.js'),
    getLanesInBoard: require('../actions/getLanesInBoard.js'),
    deleteDynamoObject: require('../actions/deleteDynamoObject.js'),
    deleteLane: require('./deleteLane.js'),
    putUpdateField: require('../actions/putUpdateField.js'),
    getTeamById: require('../actions/getTeamById.js'),
    deleteObjectUserMembership: require('../actions/deleteObjectUserMembership.js'),
    getAllUserIdMembershipsForObject: require('../actions/getAllUserIdMembershipsForObject.js')
};

module.exports = (params) => {
    const boardId = params.boardId;

    return actions.getLanesInBoard(boardId)

    .then((result) => {
        const laneIds = result.laneIds;
        return Promise.all(laneIds.map((laneId) => {
            return actions.deleteLane({
                laneId: laneId
            });
        }));
    })

    .then(() => {
        return actions.getAllUserIdMembershipsForObject({
            objectId: boardId
        });
    })

    .then((result) => {
        const userIds = result.userIds;

        return Promise.all(userIds.map((userId) => {
            return actions.deleteObjectUserMembership({
                objectId: boardId,
                userId: userId
            });
        }));
    })

    .then(() => {
        return actions.deleteDynamoObject({
            objectId: boardId,
            tableName: 'Boards'
        });
    })

    .then((result) => {
        return result.constructor === Object && Object.keys(result).length === 0;
    });
};
