'use strict';

const _ = require('lodash');

const actions = {
    getBoardsInTeam: require('../actions/getBoardsInTeam.js'),
    getAllOfObjectTypeForUser: require('../actions/getAllOfObjectTypeForUser.js'),
    getBoardById: require('./getBoardById.js')
};

module.exports = (params) => {

    const teamId = params.teamId;
    const userId = params.userId;

    return Promise.all([
        actions.getAllOfObjectTypeForUser({
            userId: userId,
            objectType: 'BOARD'
        }),
        actions.getBoardsInTeam(teamId)
    ])

    .then((result) => {
        var boardIds = result[0].objectIds;
        const teamBoardIds = result[1].boardIds;

        // Finds the difference between user board ids and team board ids
        // Then pulls difference from user board ids
        boardIds = _.without(boardIds, _.difference(boardIds, teamBoardIds));

        return Promise.all(boardIds.map((boardId) => actions.getBoardById({
            boardId: boardId,
            includeChildren: true
        })));
    })

    .then((result) => {
        const iBoards = result;
        const collapsedBoards = [];
        return Promise.all(iBoards.map((iBoard) => {

            const board = iBoard.iBoard;
            collapsedBoards.push(board);
        }))

        .then(() => {
            return {
                iBoards: collapsedBoards
            };
        });
    });

};
