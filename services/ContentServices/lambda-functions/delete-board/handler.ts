'use strict';

// for validating request
const DeleteBoardRequest_V0_Schema = require('./DeleteBoardRequest_V0_Schema_generated.json');
// for outsourcing common request / response handling
const LambdaRequestHandler = require('../../shared/utils/LambdaRequestHandler.js');
// helper methods
const transactions = {
    deleteBoard: require('../../shared/transactions/deleteBoard.js')
};

module.exports.handler = new LambdaRequestHandler(DeleteBoardRequest_V0_Schema, (request) => {

    const apiVersion = request.apiVersion;
    const boardId = request.boardId;
    const teamId = request.teamId;

    return transactions.deleteBoard({
        boardId: boardId,
        teamId: teamId
    })

    .then((result) => {
        switch(apiVersion) {
            case 'v0': {
                return result;
            }

            default: {
                throw new Error(`Unsupported api version: ${apiVersion}`);
            }
        }
    });


});
