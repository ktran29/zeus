'use strict';

const AWS = require('aws-sdk');

const ActionRequestHandler = require('../../shared/utils/ActionRequestHandler.js');

module.exports = new ActionRequestHandler(__filename, (params) => {

    const dynamodb = new AWS.DynamoDB.DocumentClient();

    const objectId = params.objectId;
    const userId = params.userId;
    const objectType = params.objectType;

    return dynamodb.put({
        TableName: 'ObjectUserMembership-AE',
        Item: {
            objectId: objectId,
            userId: userId,
            objectType: objectType
        }
    })

    .promise()

    .then(() => {
        console.log('Object user membership created successfully');
        return true;
    });
});
