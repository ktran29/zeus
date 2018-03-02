'use strict';

/*
Query description;
Get all objects associated with a given objectId. Can be filtered by associatedType.
Currently the supported associated types are CHANNEL and USER.

TABLE: Notifications
GSI

Partition key - userId-teamId
Sort key - updatedAt (Not yet implemented);
*/

const AWS = require('aws-sdk');
const ObjectNotFoundError = require('../utils/Errors.js').ObjectNotFoundError;

const ActionRequestHandler = require('../../shared/utils/ActionRequestHandler.js');

module.exports = new ActionRequestHandler(__filename, (userId, teamId) => {
    const dynamodb = new AWS.DynamoDB.DocumentClient();

    var dynamoParams = {
        TableName: 'Notifications'
    };

    var KeyConditions = {};

    KeyConditions['userId-=teamId'] = {
        ComparisonOperator: 'EQ',
        AttributeValueList: [
            `${userId}-${teamId}`
        ]
    };

    dynamoParams.KeyConditions = KeyConditions;

    return dynamodb.query(dynamoParams)

    .promise()

    .then((data) => {
        const dynamoObjects = data.Items;

        if(dynamoObjects.length === 0) {
            throw new ObjectNotFoundError('No notifications found with that combination. userId:', userId, 'teamId:', teamId );
        }

        return {
            notifications: dynamoObjects
        };
    });

});
