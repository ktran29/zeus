'use strict';

const AWS = require('aws-sdk');

const ActionRequestHandler = require('../../shared/utils/ActionRequestHandler.js');

module.exports = new ActionRequestHandler(__filename, (params) => {

    // Extract params
    const checklistItemId = params.checklistItemId;

    const dynamodb = new AWS.DynamoDB.DocumentClient();

    const dynamoParams = {
        TableName: 'ChecklistItems',
        Key: {
            'objectId': checklistItemId
        }
    };

    return dynamodb.delete(dynamoParams).promise()

    .then(() => {
        console.log(`ChecklistItem ${checklistItemId} deleted successfully`);
        return {
            success: true
        };
    });

});
