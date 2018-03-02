'use strict';

// for validating request
const EditLaneRequest_V0_Schema = require('./EditLaneRequest_V0_Schema_generated.json');
// for creating versioned response
const LaneConverter = require('../../shared/converters/LaneConverter.js');
// for outsourcing common request / response handling
const LambdaRequestHandler = require('../../shared/utils/LambdaRequestHandler.js');
// helper methods
const transactions = {
    editLane: require('../../shared/transactions/editLane.js')
};

module.exports.handler = new LambdaRequestHandler(EditLaneRequest_V0_Schema, (request) => {

    // extract parameters
    const apiVersion = request.apiVersion;
    const laneId = request.laneId;
    const name = request.name;

    return transactions.editLane({
        laneId: laneId,
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
