'use strict';

const AWS = require('aws-sdk');
const ObjectNotFoundError = require('../utils/Errors.js').ObjectNotFoundError;

const ActionRequestHandler = require('../../shared/utils/ActionRequestHandler.js');

module.exports = new ActionRequestHandler(__filename, (checklistItemId) => {
    const dynamoDB = new AWS.DynamoDB.DocumentClient();

    return dynamoDB.get({
        TableName: 'ChecklistItems',
        Key: {
            'objectId': checklistItemId
        }
    })

    // Convert dynamo operation to a promise
    .promise()

    .then((data) => {
        const dynamoChecklistItemObject = data.Item;
        if(!dynamoChecklistItemObject) {
            throw new ObjectNotFoundError('checklistItem', checklistItemId, {
                checklistItem: null
            });
        }
        const iChecklistItem = {
            objectId: dynamoChecklistItemObject.objectId,
            completed: dynamoChecklistItemObject.completed,
            updatedAt: dynamoChecklistItemObject.updatedAt,
            createdAt: dynamoChecklistItemObject.createdAt,
            checklistId: dynamoChecklistItemObject.checklistId,
            description: dynamoChecklistItemObject.description,
            index: dynamoChecklistItemObject.index
        };

        console.log('Successfully retrieved checklist item');

        return {
            iChecklistItem: iChecklistItem
        };
    });
});
