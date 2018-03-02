'use strict';

// for validating request
const SwurveTaskRequest_V0_Schema = require('./SwurveTaskRequest_V0_Schema_generated.json');
// for creating versioned response
const LaneConverter = require('../../shared/converters/LaneConverter.js');
// for outsourcing common request / response handling
const LambdaRequestHandler = require('../../shared/utils/LambdaRequestHandler.js');
// helper methods
const transactions = {
    swurveTask: require('../../shared/transactions/swurveTask.js')
};

module.exports.handler = new LambdaRequestHandler(SwurveTaskRequest_V0_Schema, (request) => {

    // extract parameters
    const apiVersion = request.apiVersion;
    const taskId = request.taskId;
    const newLaneId = request.newLaneId;
    const newLanePosition = request.newLanePosition;
    const currentLaneId = request.laneId;
    const currentBoardId = request.currentBoardId;

    return transactions.swurveTask({
        taskId: taskId,
        newLaneId: newLaneId,
        newLanePosition: newLanePosition,
        currentLaneId: currentLaneId,
        currentBoardId: currentBoardId
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
