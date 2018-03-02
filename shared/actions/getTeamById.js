'use strict';

const AWS = require('aws-sdk');
const ObjectNotFoundError = require('../utils/Errors.js').ObjectNotFoundError;

const ActionRequestHandler = require('../../shared/utils/ActionRequestHandler.js');

module.exports = new ActionRequestHandler(__filename, (teamId) => {

    const dynamodb = new AWS.DynamoDB.DocumentClient();
    const dynamoParams = {
        Key: {
            objectId: teamId
        },
        TableName: 'Teams'
    };

    return dynamodb.get(dynamoParams).promise()

    .then((data) => {

        const dynamoTeamObject = data.Item;
        if(!dynamoTeamObject) {
            throw new ObjectNotFoundError('team', teamId, {
                team: null
            });
        }
        const iTeam = {
            objectId: dynamoTeamObject.objectId,
            createdAt: dynamoTeamObject.createdAt,
            updatedAt: dynamoTeamObject.updatedAt,
            generalChannelId: dynamoTeamObject.generalChannelId,
            name: dynamoTeamObject.name,
            creatorId: dynamoTeamObject.creatorId,
            code: dynamoTeamObject.code
        };

        console.log('Successfully retrieved team');

        return {
            iTeam: iTeam
        };
    });

});
