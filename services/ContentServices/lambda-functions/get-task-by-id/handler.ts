'use strict';

// for validating request
const GetTaskRequest_V0_Schema = require('./GetTaskRequest_V0_Schema_generated.json');
// for creating validated response
const converters = {
    TaskConverter: require('../../shared/converters/TaskConverter.js'),
    UserConverter: require('../../shared/converters/UserConverter.js'),
    CommentThreadConverter: require('../../shared/converters/CommentThreadConverter.js'),
    ChecklistConverter: require('../../shared/converters/ChecklistConverter.js')
}
// for outsourcing common request / response handling
const LambdaRequestHandler = require('../../shared/utils/LambdaRequestHandler.js');
// helper methods
const transactions = {
    getTask: require('../../shared/transactions/getTaskById.js')
};

module.exports.handler = new LambdaRequestHandler(GetTaskRequest_V0_Schema, (request) => {

    const taskId = request.taskId;
    const short = request.short && (request.short.toLowerCase() === 'true');
    const apiVersion = request.apiVersion;

    return transactions.getTask({
        taskId: taskId,
        includeChildren: short
    })

    .then((result) => {
        const iTask = result.iTask;
        switch(apiVersion) {
            case 'v0': {
                if(short) {
                    const iUser = result.iUser;
                    const iCommentThread = result.iCommentThread;
                    const iChecklist = result.iChecklist;

                    return {
                        task: converters.TaskConverter.convertToShortV0(iTask),
                        user: converters.UserConverter.convertToShortV0(iUser),
                        commentThread: converters.CommentThreadConverter.convertToShortV0(iCommentThread),
                        checklist: converters.ChecklistConverter.convertToShortV0(iChecklist)
                    }
                } else {
                    return {
                        task: converters.TaskConverter.convertToLongV0(iTask)
                    };
                }
            }

            default: {
                throw new Error(`Unsupported api version: ${apiVersion}`);
            }
        }
    });


});
