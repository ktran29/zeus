'use strict';

const AWS = require('aws-sdk');

const ActionRequestHandler = require('../../shared/utils/ActionRequestHandler.js');

module.exports = new ActionRequestHandler(__filename, (params) => {

    // extract parameters

    const creatorId = params.creatorId;
    var description = params.description;
    const dueDate = params.dueDate;
    const titleText = params.titleText;
    const taggedChannelIds = params.taggedChannelIds;
    const checklistId = params.checklistId;
    const commentThreadId = params.commentThreadId;
    const teamId = params.teamId;
    const taskId = params.taskId;
    const createdAt = params.createdAt;
    const updatedAt = params.updatedAt;
    const bottomLanePosition = params.bottomLanePosition;

    // optional parameters
    const boardId = params.boardId;
    const laneId = params.laneId;

    // checks to see if description is an empty string
    if(!description) {
        description = undefined;
    }

    const dynamodb = new AWS.DynamoDB.DocumentClient();

    return dynamodb.put({
        TableName: 'Tasks',
        Item: {
            objectId: taskId,
            createdAt: createdAt,
            updatedAt: updatedAt,
            boardId: boardId,
            checklistId: checklistId,
            commentThreadId: commentThreadId,
            creatorId: creatorId,
            description: description,
            dueDate: dueDate,
            laneId: laneId,
            status: 'InProgress',
            title: titleText,
            taggedChannelIds: taggedChannelIds,
            teamId: teamId,
            lanePosition: bottomLanePosition
        }
    })

    .promise()

    .then(() => {
        console.log('Task created succesfully');
        return {
            taskId: taskId
        };
    });

});
