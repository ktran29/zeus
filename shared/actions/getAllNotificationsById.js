'use strict';

/*
Query description;
Get all objects associated with a given objectId. Can be filtered by associatedType.
Currently the supported associated types are CHANNEL and USER.

TABLE: Notifications
Primary index

Partition key - notificationId
Sort key - userId-teamId (Not actually used. Only put in to maintain uniqueness because notificationId can be reused);
*/

const AWS = require('aws-sdk');
const ObjectNotFoundError = require('../utils/Errors.js').ObjectNotFoundError;
const ActionRequestHandler = require('../../shared/utils/ActionRequestHandler.js');

module.exports = new ActionRequestHandler(__filename, (notificationId) => {
    const dynamodb = new AWS.DynamoDB.DocumentClient();

    var dynamoParams = {
        TableName: 'Notifications'
    };

    var KeyConditions = {};

    KeyConditions['notificationId'] = {
        ComparisonOperator: 'EQ',
        AttributeValueList: [
            `${notificationId}`
        ]
    };

    dynamoParams.KeyConditions = KeyConditions;

    return dynamodb.query(dynamoParams)

    .promise()

    .then((data) => {
        const dynamoObjects = data.Items;

        if(dynamoObjects.length === 0) {
            throw new ObjectNotFoundError('Notifications with notificationId:', notificationId);
        }

        return {
            notifications: dynamoObjects
        };
    });

});
