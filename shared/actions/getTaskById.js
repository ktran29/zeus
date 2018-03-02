'use strict';

const AWS = require('aws-sdk');
const ObjectNotFoundError = require('../utils/Errors.js').ObjectNotFoundError;

const ActionRequestHandler = require('../../shared/utils/ActionRequestHandler.js');

module.exports = new ActionRequestHandler(__filename, (taskId) => {

    const dynamodb = new AWS.DynamoDB.DocumentClient();

    const dynamoParams = {
        TableName: 'Tasks',
        Key: {
            objectId: taskId
        }
    };

    return dynamodb.get(dynamoParams).promise()

    .then((data) => {

        const dynamoTaskObject = data.Item;

        if(!dynamoTaskObject) {
            throw new ObjectNotFoundError('task', taskId, {
                task: null
            });
        }

        const iTask = {
            objectId: dynamoTaskObject.objectId,
            createdAt: dynamoTaskObject.createdAt,
            updatedAt: dynamoTaskObject.updatedAt,
            title: dynamoTaskObject.title,
            dueDate: dynamoTaskObject.dueDate,
            checklistId: dynamoTaskObject.checklistId,
            commentThreadId: dynamoTaskObject.commentThreadId,
            creatorId: dynamoTaskObject.creatorId,
            boardId: dynamoTaskObject.boardId || '',
            description: dynamoTaskObject.description,
            laneId: dynamoTaskObject.laneId || '',
            lanePosition: dynamoTaskObject.lanePosition || '',
            status: dynamoTaskObject.status,
            teamId: dynamoTaskObject.teamId
        };

        console.log('Successfully retrieved task');

        return {
            iTask: iTask,
            creatorId: iTask.creatorId,
            commentThreadId: iTask.commentThreadId,
            checklistId: iTask.checklistId
        };
    });

});
