'use strict';

const AWS = require('aws-sdk');

const ObjectNotFoundError = require('../utils/Errors.js').ObjectNotFoundError;

const ActionRequestHandler = require('../../shared/utils/ActionRequestHandler.js');

module.exports = new ActionRequestHandler(__filename, (userId) => {

    const dynamodb = new AWS.DynamoDB.DocumentClient();

    const dynamoParams = {
        TableName: 'Users',
        Key: {
            objectId: userId
        }
    };

    return dynamodb.get(dynamoParams).promise()

    .then((data) => {
        const dynamoUserObject = data.Item;
        if(!dynamoUserObject) {
            throw new ObjectNotFoundError('user', userId, {
                user: null
            });
        }

        const iUser = {
            objectId: dynamoUserObject.objectId,
            firstName: dynamoUserObject.firstName,
            middleName: dynamoUserObject.middleName,
            lastName: dynamoUserObject.lastName,
            profilePicture: null,
            createdAt: dynamoUserObject.createdAt,
            updatedAt: dynamoUserObject.updatedAt,
            activeTeamId: dynamoUserObject.activeTeamId,
            email: dynamoUserObject.email
        };

        console.log('Successfully retrieved user');
        return {
            iUser: iUser
        };
    });

});
