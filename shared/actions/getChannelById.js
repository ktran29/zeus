'use strict';

const AWS = require('aws-sdk');
const ObjectNotFoundError = require('../utils/Errors.js').ObjectNotFoundError;

const ActionRequestHandler = require('../../shared/utils/ActionRequestHandler.js');

module.exports = new ActionRequestHandler(__filename, (channelId) => {

    const dynamodb = new AWS.DynamoDB.DocumentClient();
    const dynamoParams = {
        TableName: 'Channels',
        Key: {
            objectId: channelId
        }
    };

    return dynamodb.get(dynamoParams).promise()

    .then((data) => {
        const dynamoChannelObject = data.Item;
        if(!dynamoChannelObject) {
            throw new ObjectNotFoundError('channel', channelId, {
                channel: null
            });
        }
        const iChannel = {
            objectId: dynamoChannelObject.objectId,
            createdAt: dynamoChannelObject.createdAt,
            updatedAt: dynamoChannelObject.updatedAt,
            name: dynamoChannelObject.name,
            creatorId: dynamoChannelObject.creatorId,
            teamId: dynamoChannelObject.teamId
        };

        console.log('Successfully retrieved channel');
        return {
            iChannel: iChannel
        };
    });
});
