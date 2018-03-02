'use strict';

// for validating request
const RemoveFromBoardRequest_V0_Schema = require('./RemoveFromBoardRequest_V0_Schema_generated.json');
// for outsourcing common request / response handling
const LambdaRequestHandler = require('../../shared/utils/LambdaRequestHandler.js');
// helper methods
const transactions = {
    removeFromBoard: require('../../shared/transactions/removeFromBoard.js')
};

module.exports.handler = new LambdaRequestHandler(RemoveFromBoardRequest_V0_Schema, (request) => {

    // extract parameters
    const apiVersion = request.apiVersion;
    const userId = request.userId;
    const teamId = request.teamId;
    const boardId = request.boardId;

    return transactions.removeFromBoard({
        userId: userId,
        teamId: teamId,
        boardId: boardId
    })

    .then((result) => {
        const success = result.success
        switch (apiVersion) {
            case 'v0': {
                return {
                    success: success,
                };
            }

            default: {
                throw new Error(`Unsupported api version: ${apiVersion}`);
            }
        }
    });


});
