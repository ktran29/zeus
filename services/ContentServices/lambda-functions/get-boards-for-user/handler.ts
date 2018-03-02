'use strict';

const GetBoardRequest_V0_Schema = require('./GetBoardRequest_V0_Schema_generated.json');
const BoardConverter = require('../../shared/converters/BoardConverter');
const LambdaRequestHandler = require('../../shared/utils/LambdaRequestHandler.js');

const transactions = {
    getBoardsForUser: require('../../shared/transactions/getBoardsForUser.js')
};

module.exports.handler = new LambdaRequestHandler(GetBoardRequest_V0_Schema, (request) => {

    const teamId = request.teamId;
    const userId = request.userId;
    const apiVersion = request.apiVersion;
    const short = request.short && (request.short.toLowerCase() === 'true');

    return transactions.getBoardsForUser({
        teamId: teamId,
        userId: userId
    })

    .then((results) => {

        const iBoards = results.iBoards;

        // construct the appropriate response based on the api version
        switch (apiVersion) {
            case 'v0': {
                if(short) {
                    return {
                        boards: iBoards.map((iBoard) => BoardConverter.convertToShortV0(iBoard))
                    };
                } else {
                    return {
                        boards: iBoards.map((iBoard) => BoardConverter.convertToLongV0(iBoard))
                    };
                }
            }
            default: {
                throw new Error(`Unsupported api version: ${apiVersion}`);
            }
        }
    });
});
