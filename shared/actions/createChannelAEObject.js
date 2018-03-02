'use strict';

const AWS = require('aws-sdk');

const ActionRequestHandler = require('../../shared/utils/ActionRequestHandler.js');

module.exports = new ActionRequestHandler(__filename, (params) => {

    const dynamodb = new AWS.DynamoDB.DocumentClient();

    const objectId = params.objectId;
    const channelId = params.channelId;
    const objectType = params.objectType;

    return dynamodb.put({
        TableName: 'ObjectChannelTagged-AE',
        Item: {
            objectId: objectId,
            channelId: channelId,
            objectType: objectType
        }
    })

    .promise()

    .then(() => {
        console.log('Channel AE object created successfully');
        return true;
    });
});
