'use strict';

const AWS = require('aws-sdk');
const generateUniqueIdentifier = require('../utils/generateUniqueIdentifier.js');

const ActionRequestHandler = require('../../shared/utils/ActionRequestHandler.js');

module.exports = new ActionRequestHandler(__filename, (params) => {

    const dynamodb = new AWS.DynamoDB.DocumentClient();

    const teamId = generateUniqueIdentifier();

    const teamName = params.teamName;
    const userId = params.userId;

    const now = Date.now();

    return dynamodb.put({
        TableName: 'Teams',
        Item: {
            objectId: teamId,
            createdAt: now,
            updatedAt: now,
            name: teamName,
            creatorId: userId
        }
    })

    .promise()

    .then(() => {
        console.log('Team created successfully');
        return {
            teamId: teamId
        };
    });
});
