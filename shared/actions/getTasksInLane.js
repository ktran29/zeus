'use strict';

const AWS = require('aws-sdk');

const ActionRequestHandler = require('../../shared/utils/ActionRequestHandler.js');

module.exports = new ActionRequestHandler(__filename, (laneId) => {
    const dynamodb = new AWS.DynamoDB.DocumentClient();

    return dynamodb.query({
        TableName: 'Tasks',
        IndexName: 'laneId-lanePosition-index',
        KeyConditions: {
            laneId: {
                ComparisonOperator: 'EQ',
                AttributeValueList: [
                    laneId
                ]
            }
        },
        ScanIndexForward: false
    })

    .promise()

    .then((data) => {
        const dynamoTaskObjects = data.Items;

        var bottomLanePosition = 0;

        if(dynamoTaskObjects.length > 0) {
            bottomLanePosition = dynamoTaskObjects[0].lanePosition;
        }

        const taskIds = dynamoTaskObjects.map(res => res.objectId);

        console.log('Successfully retrieved task ids');

        return {
            taskIds: taskIds,
            bottomLanePosition: bottomLanePosition
        };
    });

});
