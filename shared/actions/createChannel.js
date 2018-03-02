'use strict';

const AWS = require('aws-sdk');

const generateUniqueIdentifier = require('../utils/generateUniqueIdentifier.js');

const ActionRequestHandler = require('../../shared/utils/ActionRequestHandler.js');

module.exports = new ActionRequestHandler(__filename, (params) => {

    const dynamodb = new AWS.DynamoDB.DocumentClient();

    const channelId = generateUniqueIdentifier();
    const teamId = params.teamId;
    const channelName = params.channelName;
    const creatorId = params.creatorId;

    return dynamodb.put({
        TableName: 'Channels',
        Item: {
            objectId: channelId,
            createdAt: Date.now(),
            updatedAt: Date.now(),
            name: channelName,
            teamId: teamId,
            creatorId: creatorId
        }
    })

    .promise()

    .then(() => {
        console.log('Channel created successfully');
        return {
            channelId: channelId
        };
    });
});
