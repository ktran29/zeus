'use strict';

const AWS = require('aws-sdk');
const ObjectNotFoundError = require('../utils/Errors.js').ObjectNotFoundError;

const ActionRequestHandler = require('../../shared/utils/ActionRequestHandler.js');

module.exports = new ActionRequestHandler(__filename, (checklistId) => {
    const dynamoDB = new AWS.DynamoDB.DocumentClient();
    return dynamoDB.get({
        TableName: 'Checklists',
        Key: {
            'objectId': checklistId
        }
    })

    // Convert dynamo operation to a promise
    .promise()

    .then((data) => {
        // Extract results
        const dynamoChecklistObject = data.Item;

        if(!dynamoChecklistObject) {
            throw new ObjectNotFoundError('checklist', checklistId, {
                checklist: null
            });
        }

        const iChecklist = {
            objectId: dynamoChecklistObject.objectId,
            createdAt: dynamoChecklistObject.createdAt,
            updatedAt: dynamoChecklistObject.updatedAt,
            parentObjectId: dynamoChecklistObject.parentObjectId
        };

        console.log('Successfully retrieved checklist.');

        return {
            iChecklist: iChecklist
        };
    });
});
