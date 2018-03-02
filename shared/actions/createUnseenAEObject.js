'use strict';

const AWS = require('aws-sdk');

const ActionRequestHandler = require('../../shared/utils/ActionRequestHandler.js');

module.exports = new ActionRequestHandler(__filename, (params) => {

    const dynamodb = new AWS.DynamoDB.DocumentClient();

    const objectId = params.objectId;
    const userId = params.userId;
    const teamId = params.teamId;
    const updatedAt = params.updatedAt;

    return dynamodb.put({
        TableName: 'UnseenObject-AE',
        Item: {
            objectId: objectId,
            'userId-teamId': `${userId}-${teamId}`,
            updatedAt: updatedAt
        }
    })

    .promise()

    .then(() => {
        console.log('Unseen AE object created successfully');
        return true;
    });
});
