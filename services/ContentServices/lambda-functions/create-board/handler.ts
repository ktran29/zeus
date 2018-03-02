'use strict';

// for validating request
const CreateBoardRequest_V0_Schema = require('./CreateBoardRequest_V0_Schema_generated.json');
// for creating versioned response
const BoardConverter = require('../../shared/converters/BoardConverter.js');
// for outsourcing common request / response handling
const LambdaRequestHandler = require('../../shared/utils/LambdaRequestHandler.js');
// helper methods
const transactions = {
    createBoard: require('../../shared/transactions/createBoard.js')
};

module.exports.handler = new LambdaRequestHandler(CreateBoardRequest_V0_Schema, (request) => {

    // extract parameters
    const apiVersion = request.apiVersion;
    const creatorId = request.creatorId;
    const teamId = request.teamId;
    const name = request.name;
    const memberIds = request.memberIds;

    return transactions.createBoard({
        creatorId: creatorId,
        teamId: teamId,
        name: name,
        memberIds: memberIds
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
