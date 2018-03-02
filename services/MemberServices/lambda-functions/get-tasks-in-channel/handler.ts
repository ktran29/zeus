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
    getTasksInChannel: require('../../shared/transactions/getTasksInChannel.js')
};

module.exports.handler = new LambdaRequestHandler(GetTaskRequest_V0_Schema, (request) => {

    const channelId = request.channelId;
    const short = request.short && request.short.toLowerCase() === 'true';
    const returnAsObjects = request.returnAsObjects && request.returnAsObjects.toLowerCase() === 'true';

    const apiVersion = request.apiVersion;

    return transactions.getTasksInChannel({
        channelId: channelId,
        includeChildren: short,
        returnAsObjects: returnAsObjects
    })

    .then((results) => {

        const iTasks = results.iTasks;
        const taskIds = results.taskIds;

        // construct the appropriate response based on the api version
        switch (apiVersion) {
            case 'v0': {
                if(short) {
                    const iUsers = results.iUsers;
                    const iChecklists = results.iChecklists;
                    const iCommentThreads = results.iCommentThreads;
                    return {
                        tasks: iTasks.map((iTask) => converters.TaskConverter.convertToShortV0(iTask)),
                        users: iUsers.map((iUser) => converters.UserConverter.convertToShortV0(iUser)),
                        checklists: iChecklists.map((iChecklist) =>
                            converters.ChecklistConverter.convertToShortV0(iChecklist)),
                        commentThreads: iCommentThreads.map((iCommentThread) =>
                            converters.CommentThreadConverter.convertToShortV0(iCommentThread))
                    }
                } else if(returnAsObjects){
                    return {
                        tasks: iTasks.map((iTask) => converters.TaskConverter.convertToLongV0(iTask))
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
