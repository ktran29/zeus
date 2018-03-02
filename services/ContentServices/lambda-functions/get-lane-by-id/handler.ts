'use strict';

// for validating request
const GetLaneRequest_V0_Schema = require('./GetLaneRequest_V0_Schema_generated.json');
// for creating versioned response
const LaneConverter = require('../../shared/converters/LaneConverter.js');
// for outsourcing common request / response handling
const LambdaRequestHandler = require('../../shared/utils/LambdaRequestHandler.js');
// helper methods
const transactions = {
    getLaneById: require('../../shared/transactions/getLaneById.js')
};

module.exports.handler = new LambdaRequestHandler(GetLaneRequest_V0_Schema, (request) => {

    // extract parameters
    const apiVersion = request.apiVersion;
    const laneId = request.laneId;

    return transactions.getLaneById(laneId)

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
