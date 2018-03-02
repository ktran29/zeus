'use strict';

const AWS = require('aws-sdk');

const ActionRequestHandler = require('../../shared/utils/ActionRequestHandler.js');

module.exports = new ActionRequestHandler(__filename, (checklistId) => {

    const dynamodb = new AWS.DynamoDB.DocumentClient();

    return dynamodb.query({
        TableName: 'ChecklistItems',
        IndexName: 'checklistId-index-index',
        KeyConditions: {
            checklistId: {
                ComparisonOperator: 'EQ',
                AttributeValueList: [
                    checklistId
                ]
            }
        },
        ScanIndexForward: false
    })

    .promise()

    .then((data) => {
        const dynamoChecklistItemObjects = data.Items;

        var bottomChecklistItemPosition = 0;
        // Gets the highest index of existing checklist items
        if(dynamoChecklistItemObjects[0]) {
            bottomChecklistItemPosition = dynamoChecklistItemObjects[0].index + 1;
        }
        var iChecklistItems = [];
        var checklistItemIds = [];
        var numberOfCompletedItems = 0;
        dynamoChecklistItemObjects.forEach((dynamoChecklistItemObject) => {
            checklistItemIds.push(dynamoChecklistItemObject.objectId);
            const iChecklistItem = {
                objectId: dynamoChecklistItemObject.objectId,
                createdAt: dynamoChecklistItemObject.createdAt,
                updatedAt: dynamoChecklistItemObject.updatedAt,
                checklistId: dynamoChecklistItemObject.checklistId,
                completed: dynamoChecklistItemObject.completed,
                description: dynamoChecklistItemObject.description,
                index: dynamoChecklistItemObject.index
            };
            iChecklistItems.push(iChecklistItem);
            numberOfCompletedItems += iChecklistItem.completed;
        });


        console.log('Successfully retrieved comments');
        return {
            iChecklistItems: iChecklistItems,
            checklistItemIds: checklistItemIds,
            numberOfCompletedItems: numberOfCompletedItems,
            bottomChecklistItemPosition: bottomChecklistItemPosition
        };
    });

});
