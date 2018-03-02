'use strict';

// for validating request
const UpdateTaskRequest_V0_Schema = require('./UpdateTaskRequest_V0_Schema_generated.json');
// for creating validated response
const TaskConverter = require('../../shared/converters/TaskConverter.js');
// for outsourcing common request / response handling
const LambdaRequestHandler = require('../../shared/utils/LambdaRequestHandler.js');
// helper methods
const transactions = {
    updateTask: require('../../shared/transactions/updateTask.js')
};

module.exports.handler = new LambdaRequestHandler(UpdateTaskRequest_V0_Schema, (request) => {

    // extract parameters
    const newDueDate = request.newDueDate;
    const taskId = request.taskId;
    const taskLastUpdatedDate = request.taskLastUpdatedDate;
    const apiVersion = request.apiVersion;

    return transactions.updateTask({
        newDueDate: newDueDate,
        taskId: taskId,
        taskLastUpdatedDate: taskLastUpdatedDate
    })

    .then((result) => {
        const iTask = result.iTask;
        switch(apiVersion) {
            case 'v0': {
                return {
                    updatedTask: TaskConverter.convertToLongV0(iTask)
                };
            }

            default: {
                throw new Error(`Unsupported api version: ${apiVersion}`);
            }
        }
    });

});
