'use strict';

const AWS = require('aws-sdk');

const generateUniqueIdentifier = require('../utils/generateUniqueIdentifier');

const ActionRequestHandler = require('../../shared/utils/ActionRequestHandler.js');

module.exports = new ActionRequestHandler(__filename, (params) => {

    const userDataId = generateUniqueIdentifier();

    const teamId = params.teamId;
    const userId = params.userId;

    const dynamodb = new AWS.DynamoDB.DocumentClient();

    return dynamodb.put({
        TableName: 'UserData',
        Item: {
            objectId: userDataId,
            userId: userId,
            createdAt: Date.now(),
            updatedAt: Date.now(),
            teamId: teamId,
        }
    })

    .promise()

    .then(() => {
        console.log('User data created successfully');
        return {
            userDataId: userDataId
        };
    });

});
