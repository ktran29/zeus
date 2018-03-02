'use strict';

const AWS = require('aws-sdk');

const generateUniqueIdentifier = require('../utils/generateUniqueIdentifier.js');

const ActionRequestHandler = require('../../shared/utils/ActionRequestHandler.js');

module.exports = new ActionRequestHandler(__filename, (params) => {

    const dynamoDB = new AWS.DynamoDB.DocumentClient();

    // Extract parameters
    const description = params.description;
    const index = params.index;
    const checklistId = params.checklistId;

    const objectId = generateUniqueIdentifier();
    const now = Date.now();

    return dynamoDB.put({
        TableName: 'ChecklistItems',
        Item: {
            objectId: objectId,
            checklistId: checklistId,
            completed: false,
            description: description,
            index: index,
            createdAt: now,
            updatedAt: now
        }
    })

    .promise()

    .then(() => {
        const checklistItem = {
            objectId: objectId,
            checklistId: checklistId,
            completed: false,
            description: description,
            index: index,
            createdAt: now,
            updatedAt: now
        };
        console.log('Checklist item created succesfully');
        return {
            iChecklistItem: checklistItem,
            iChecklistItemId: objectId
        };
    });

});
