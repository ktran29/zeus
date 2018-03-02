'use strict';

// for validating request
const GetBoardRequest_V0_Schema = require('./GetBoardRequest_V0_Schema_generated.json');
// for creating versioned response
const converters = {
    BoardConverter: require('../../shared/converters/BoardConverter.js'),
    UserConverter: require('../../shared/converters/UserConverter.js'),
    LaneConverter: require('../../shared/converters/LaneConverter.js')
}
// for outsourcing common request / response handling
const LambdaRequestHandler = require('../../shared/utils/LambdaRequestHandler.js');
// helper methods
const transactions = {
    getBoardById: require('../../shared/transactions/getBoardById.js')
};

module.exports.handler = new LambdaRequestHandler(GetBoardRequest_V0_Schema, (request) => {

    // extract parameters
    const apiVersion = request.apiVersion;
    const boardId = request.boardId;
    const short = request.short && (request.short.toLowerCase() === 'true');
    const numberOfUserShorts = parseInt(request.numberOfUserShorts) || 0;

    return transactions.getBoardById({
        boardId: boardId,
        includeChildren: short,
        numberOfUserShorts: numberOfUserShorts
    })

    .then((result) => {
        const iBoard = result.iBoard
        switch (apiVersion) {
            case 'v0': {
                if(short) {
                    const iUsers = result.iUsers;
                    const iLanes = result.iLanes;
                    return {
                        board: converters.BoardConverter.convertToShortV0(iBoard),
                        users: iUsers.map((iUser) => converters.UserConverter.convertToShortV0(iUser.iUser)),
                        lanes: iLanes.map((iLane) => converters.LaneConverter.convertToLongV0(iLane.iLane))
                    }
                }
                return {
                    board: converters.BoardConverter.convertToLongV0(iBoard),
                };
            }

            default: {
                throw new Error(`Unsupported api version: ${apiVersion}`);
            }
        }
    });


});
