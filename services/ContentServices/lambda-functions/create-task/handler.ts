'use strict';

// for validating request
const CreateTaskRequest_V0_Schema = require('./CreateTaskRequest_V0_Schema_generated.json');
// for creating versioned response
const converters = {
    TaskConverter: require('../../shared/converters/TaskConverter.js'),
    CommentThreadConverter: require('../../shared/converters/CommentThreadConverter.js'),
    ChecklistConverter: require('../../shared/converters/ChecklistConverter.js'),
    ChecklistItemConverter: require('../../shared/converters/ChecklistItemConverter.js'),
};
// for outsourcing common request / response handling
const LambdaRequestHandler = require('../../shared/utils/LambdaRequestHandler.js');
// helper methods
const transactions = {
    createTask: require('../../shared/transactions/createTask.js')
};

module.exports.handler = new LambdaRequestHandler(CreateTaskRequest_V0_Schema, (request) => {

    // extract parameters
    const apiVersion = request.apiVersion;
    const assignedChannelIds = request.assignedChannelIds;
    const assignedUserIds = request.assignedUserIds;
    const boardId = request.boardId;
    const checklistItemTexts = request.checklistItemTexts;
    const creatorId = request.creatorId;
    const description = request.description;
    const dueDate = request.dueDate;
    const laneId = request.laneId;
    const titleText = request.titleText;
    const teamId = request.teamId;
    const taggedChannelIds = request.taggedChannelIds;

    return transactions.createTask({
        assignedChannelIds: assignedChannelIds,
        assignedUserIds: assignedUserIds,
        boardId: boardId,
        checklistItemTexts: checklistItemTexts,
        creatorId: creatorId,
        description: description,
        dueDate: dueDate,
        laneId: laneId,
        titleText: titleText,
        teamId: teamId,
        taggedChannelIds: taggedChannelIds
    })

    .then((result) => {
        const iTask = result.iTask;
        const iCommentThread = result.iCommentThread;
        const iChecklist = result.iChecklist;
        const iChecklistItems = result.iChecklistItems;
        switch (apiVersion) {
            case 'v0': {
                return {
                    task: converters.TaskConverter.convertToLongV0(iTask),
                    commentThread: converters.CommentThreadConverter.convertToLongV0(iCommentThread),
                    checklist: converters.ChecklistConverter.convertToLongV0(iChecklist),
                    checklistItems: iChecklistItems.map((iChecklistItem) => {
                        return converters.ChecklistItemConverter.convertToLongV0(iChecklistItem);
                    })
                };
            }

            default: {
                throw new Error(`Unsupported api version: ${apiVersion}`);
            }
        }
    });


});
