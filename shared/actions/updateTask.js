'use strict';

const AWS = require('aws-sdk');
const ObjectNotFoundError = require('../utils/Errors.js').ObjectNotFoundError;
const Debug = require('../utils/Debug.js');

const ActionRequestHandler = require('../../shared/utils/ActionRequestHandler.js');

module.exports = new ActionRequestHandler(__filename, (params) => {

    // extract parameters
    const taskId = params.taskId;
    const newDueDate = params.newDueDate;
    const taskLastUpdatedDate = params.taskLastUpdatedDate;

    const dynamodb = new AWS.DynamoDB.DocumentClient();
    const dynamoParams = {
        TableName: 'Tasks',
        Key: {
            'objectId': taskId
        }
    };

    return dynamodb.get(dynamoParams).promise()

    .then((data) => {
        const dynamoTaskObject = data.Item;
        if(!dynamoTaskObject) {
            throw new ObjectNotFoundError('Task', taskId, {
                task: null
            });
        }
        if (dynamoTaskObject.updatedAt === taskLastUpdatedDate) {
            dynamoParams.AttributeUpdates = {
                'dueDate': {
                    Action: 'PUT',
                    Value: newDueDate
                },
                'updatedAt': {
                    Action: 'PUT',
                    Value: Date.now()
                }
            };
            return dynamodb.update(dynamoParams).promise();
        } else {
            const lastUpdatedDate = new Date(dynamoTaskObject.updatedAt);
            Debug.throwError('The task you want to update has been updated recently at ' + lastUpdatedDate + '. Please refresh for the lastest version.');
        }
    })

    .then(() => {
        console.log('Successfully updated task');
        return {
            taskId: taskId
        };
    });

});
