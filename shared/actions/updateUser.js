'use strict';

const AWS = require('aws-sdk');

const ActionRequestHandler = require('../../shared/utils/ActionRequestHandler.js');

module.exports = new ActionRequestHandler(__filename, (params) => {

    const userId = params.userId;
    const firstName = params.firstName;
    const lastName = params.lastName;
    const middleName = params.middleName;

    var attributeUpdates = {
        updatedAt: {
            Action: 'PUT',
            Value: Date.now()
        }
    };

    if(firstName || firstName === '') {
        attributeUpdates.firstName = {
            Action: 'PUT',
            Value: firstName || null
        };
    }

    if(lastName || lastName === '') {
        attributeUpdates.lastName = {
            Action: 'PUT',
            Value: lastName || null
        };
    }

    if(middleName || middleName === '') {
        attributeUpdates.middleName = {
            Action: 'PUT',
            Value: middleName || null
        };
    }

    const dynamodb = new AWS.DynamoDB.DocumentClient();

    const dynamoParams = {
        TableName: 'Users',
        Key: {
            'objectId': userId
        },
        AttributeUpdates: attributeUpdates
    };

    return dynamodb.update(dynamoParams).promise()

    .then(() => {
        console.log('User updated successfully');
        return {
            userId: userId
        };
    });
});
