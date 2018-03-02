'use strict';

// for validating request
const CreateLaneRequest_V0_Schema = require('./CreateLaneRequest_V0_Schema_generated.json');
// for creating versioned response
const LaneConverter = require('../../shared/converters/LaneConverter.js');
// for outsourcing common request / response handling
const LambdaRequestHandler = require('../../shared/utils/LambdaRequestHandler.js');
// helper methods
const transactions = {
    createLane: require('../../shared/transactions/createLane.js')
};

module.exports.handler = new LambdaRequestHandler(CreateLaneRequest_V0_Schema, (request) => {

    // extract parameters
    const apiVersion = request.apiVersion;
    const boardId = request.boardId;
    const name = request.name;

    return transactions.createLane({
        boardId: boardId,
        name: name
    })

    .then((result) => {
        const iLane = result.iLane
        switch (apiVersion) {
            case 'v0': {
                return {
                    lane: LaneConverter.convertToLongV0(iLane),
                };
            }

            default: {
                throw new Error(`Unsupported api version: ${apiVersion}`);
            }
        }
    });


});
