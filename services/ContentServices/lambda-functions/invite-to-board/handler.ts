'use strict';

// for validating request
const InviteToBoardRequest_V0_Schema = require('./InviteToBoardRequest_V0_Schema_generated.json');
// for creating versioned response
const BoardConverter = require('../../shared/converters/BoardConverter.js');
// for outsourcing common request / response handling
const LambdaRequestHandler = require('../../shared/utils/LambdaRequestHandler.js');
// helper methods
const transactions = {
    inviteToBoard: require('../../shared/transactions/inviteToBoard.js')
};

module.exports.handler = new LambdaRequestHandler(InviteToBoardRequest_V0_Schema, (request) => {

    // extract parameters
    const apiVersion = request.apiVersion;
    const userIds = request.userIds;
    const teamId = request.teamId;
    const boardId = request.boardId;

    return transactions.inviteToBoard({
        userIds: userIds,
        teamId: teamId,
        boardId: boardId
    })

    .then((result) => {
        const iBoard = result.iBoard
        switch (apiVersion) {
            case 'v0': {
                return {
                    board: BoardConverter.convertToLongV0(iBoard),
                };
            }

            default: {
                throw new Error(`Unsupported api version: ${apiVersion}`);
            }
        }
    });


});
