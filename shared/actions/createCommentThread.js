'use strict';

const AWS = require('aws-sdk');

const generateUniqueIdentifier = require('../utils/generateUniqueIdentifier.js');

const ActionRequestHandler = require('../../shared/utils/ActionRequestHandler.js');

module.exports = new ActionRequestHandler(__filename, (params) => {

    const dynamoDB = new AWS.DynamoDB.DocumentClient();

    // Generate a unique identifier
    const objectId = generateUniqueIdentifier();

    const parentObjectId = params.parentObjectId;
    const parentObjectType = params.parentObjectType;

    return dynamoDB.put({
        TableName: 'CommentThreads',
        Item: {
            objectId: objectId,
            createdAt: Date.now(),
            updatedAt: Date.now(),
            parentObjectId: parentObjectId,
            parentObjectType: parentObjectType
        }
    })

    .promise()

    .then(() => {
        console.log('Successfully created comment thread');
        const iCommentThread = {
            objectId: objectId,
            createdAt: Date.now(),
            updatedAt: Date.now(),
            parentObjectId: parentObjectId
        };

        return {
            iCommentThread: iCommentThread
        };
    });
});
