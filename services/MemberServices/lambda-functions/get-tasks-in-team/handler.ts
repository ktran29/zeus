'use strict';

const GetTaskRequest_V0_Schema = require('./GetTaskRequest_V0_Schema_generated.json');
const converters = {
    TaskConverter: require('../../shared/converters/TaskConverter'),
    UserConverter: require('../../shared/converters/UserConverter'),
    CommentThreadConverter: require('../../shared/converters/CommentThreadConverter'),
    ChecklistConverter: require('../../shared/converters/ChecklistConverter')
};
const LambdaRequestHandler = require('../../shared/utils/LambdaRequestHandler.js');

const transactions = {
    getTasksInTeam: require('../../shared/transactions/getTasksInTeam.js')
};

module.exports.handler = new LambdaRequestHandler(GetTaskRequest_V0_Schema, (request) => {

    const teamId = request.teamId;
    const channelIds = request.channels;
    const returnAsObjects = request.returnAsObjects && (request.returnAsObjects.toLowerCase() === 'true');

    const apiVersion = request.apiVersion;

    return transactions.getTasksInTeam({
        teamId: teamId,
        channelIds: channelIds,
        returnAsObjects: returnAsObjects
    })

    .then((results) => {

        const iTasks = results.iTasks;
        const taskIds = results.taskIds;

        // construct the appropriate response based on the api version
        switch (apiVersion) {
            case 'v0': {
                if(returnAsObjects) {
                    return {
                        tasks: iTasks.map((iTask) => {
                            return converters.TaskConverter.convertToLongV0(iTask);
                        })
                    };
                } else {
                    return {
                        taskIds: taskIds
                    }
                }
            }
            default: {
                throw new Error(`Unsupported api version: ${apiVersion}`);
            }
        }
    });
});
