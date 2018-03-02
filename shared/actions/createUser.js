'use strict';

const AWS = require('aws-sdk');

const ActionRequestHandler = require('../../shared/utils/ActionRequestHandler.js');

module.exports = new ActionRequestHandler(__filename, (params) => {

    const dynamodb = new AWS.DynamoDB.DocumentClient();

    const userId = params.userId;
    const email = params.email;

    return dynamodb.put({
        TableName: 'Users',
        Item: {
            objectId: userId,
            createdAt: Date.now(),
            updatedAt: Date.now(),
            email: email
        },
        ConditionExpression: 'attribute_not_exists(objectId)'
    })

    .promise()

    .then(() => {
        console.log('User created succesfully');
        return userId;
    });
});
