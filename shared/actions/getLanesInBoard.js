'use strict';

/*
Query description;
Get all laneIds associated with a given boardId. Can be filtered by createdAt date.

TABLE: Lanes
Primary index

Partition key - boardId
Sort key - createdAt
*/

const AWS = require('aws-sdk');

const ActionRequestHandler = require('../../shared/utils/ActionRequestHandler.js');

module.exports = new ActionRequestHandler(__filename, (boardId) => {
    const dynamodb = new AWS.DynamoDB.DocumentClient();

    return dynamodb.query({
        TableName: 'Lanes',
        IndexName: 'boardId-createdAt-index',
        KeyConditions: {
            boardId: {
                ComparisonOperator: 'EQ',
                AttributeValueList: [
                    boardId
                ]
            }
        },
        ScanIndexForward: false
    })

    .promise()

    .then((data) => {
        const dynamoLaneObjects = data.Items;

        const laneIds = dynamoLaneObjects.map(res => res.objectId) || [];

        console.log('Successfully retrieved lane ids');
        return {
            laneIds: laneIds
        };
    });

});
