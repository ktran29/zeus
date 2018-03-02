'use strict';

const AWS = require('aws-sdk');

const generateUniqueIdentifier = require('../utils/generateUniqueIdentifier.js');

const ActionRequestHandler = require('../../shared/utils/ActionRequestHandler.js');

module.exports = new ActionRequestHandler(__filename, (params) => {

    const dynamoDB = new AWS.DynamoDB.DocumentClient();

    // Extract parameters
    const commentThreadId = params.commentThreadId;
    const userId = params.userId;
    const commentText = params.commentText;

    // Generate a unique identifier for the object
    const commentId = generateUniqueIdentifier();

    return dynamoDB.put({
        TableName: 'Comments',
        Item: {
            commentThreadId: commentThreadId,
            authorId: userId,
            objectId: commentId,
            commentText: commentText,
            createdAt: Date.now(),
            updatedAt: Date.now()
        }
    })

    .promise()

    .then(() => {
        console.log('Comment created successfully.');
        return ({
            commentId: commentId
        });
    });
});
