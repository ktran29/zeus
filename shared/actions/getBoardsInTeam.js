'use strict';

const AWS = require('aws-sdk');

const ActionRequestHandler = require('../../shared/utils/ActionRequestHandler.js');

module.exports = new ActionRequestHandler(__filename, (teamId) => {

    const dynamodb = new AWS.DynamoDB.DocumentClient();

    return dynamodb.query({
        TableName: 'Boards',
        KeyConditions: {
            teamId: {
                ComparisonOperator: 'EQ',
                AttributeValueList: [teamId]
            }
        },
        IndexName: 'teamId-index'
    })

    .promise()

    .then((data) => {

        const dynamoBoardObjects = data.Items;
        const boardIds = dynamoBoardObjects.map(res => res.objectId);

        console.log('Successfully retrieved board ids');
        return {
            boardIds: boardIds,
        };
    });

});
