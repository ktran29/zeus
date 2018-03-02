'use strict';

// for validating request
const DeleteTaskRequest_V0_Schema = require('./DeleteTaskRequest_V0_Schema_generated.json');
// for outsourcing common request / response handling
const LambdaRequestHandler = require('../../shared/utils/LambdaRequestHandler.js');
// helper methods
const transactions = {
    deleteTask: require('../../shared/transactions/deleteTask.js')
};

module.exports.handler = new LambdaRequestHandler(DeleteTaskRequest_V0_Schema, (request) => {

    const apiVersion = request.apiVersion;
    const taskId = request.taskId;
    const teamId = request.teamId;

    return transactions.deleteTask({
        taskId: taskId,
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
