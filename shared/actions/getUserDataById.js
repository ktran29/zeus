'use strict';

const AWS = require('aws-sdk');
const ObjectNotFoundError = require('../utils/Errors.js').ObjectNotFoundError;

const ActionRequestHandler = require('../../shared/utils/ActionRequestHandler.js');

module.exports = new ActionRequestHandler(__filename, (userDataId) => {

    const dynamodb = new AWS.DynamoDB.DocumentClient();

    const dynamoParams = {
        TableName: 'UserData',
        Key: {
            objectId: userDataId
        }
    };

    return dynamodb.get(dynamoParams).promise()

    .then((data) => {
        const dynamoUserData = data.Item;
        if(!dynamoUserData) {
            throw new ObjectNotFoundError('userData', userDataId, {
                userData: null
            });
        }

        const iUserData = {
            // metadata
            objectId: dynamoUserData.objectId,
            createdAt: dynamoUserData.createdAt,
            updatedAt: dynamoUserData.updatedAt,

            // data
            teamId: dynamoUserData.teamId,
            userId: dynamoUserData.userId
        };

        console.log('Successfully retrieved user data');

        return {
            iUserData: iUserData
        };
    });
});
