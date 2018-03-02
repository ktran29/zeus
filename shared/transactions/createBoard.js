'use strict';

const _ = require('lodash');

const actions = {
    createBoard: require('../actions/createBoard.js'),
    inviteToBoard: require('./inviteToBoard.js'),
    getBoardById: require('./getBoardById.js'),
    createObjectUserMembership: require('../actions/createObjectUserMembership.js')
};

module.exports = (params) => {

    // extract parameters
    const name = params.name;
    const creatorId = params.creatorId;
    const teamId = params.teamId;
    var memberIds = params.memberIds || [];

    memberIds = _.uniq(memberIds.concat(creatorId));

    var boardId;

    return actions.createBoard({
        name: name,
        teamId: teamId,
        creatorId: creatorId
    })

    .then((result) => {
        boardId = result.boardId;

        return Promise.all(memberIds.map((memberId) => {
            return actions.createObjectUserMembership({
                objectId: boardId,
                userId: memberId,
                objectType: 'BOARD'
            });
        }));
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
