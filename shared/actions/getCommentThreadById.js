'use strict';

const AWS = require('aws-sdk');
const ObjectNotFoundError = require('../utils/Errors.js').ObjectNotFoundError;

const ActionRequestHandler = require('../../shared/utils/ActionRequestHandler.js');

module.exports = new ActionRequestHandler(__filename, (commentThreadId) => {

    const dynamoDB = new AWS.DynamoDB.DocumentClient();

    const dynamoParams = {
        TableName: 'CommentThreads',
        Key: {
            'objectId': commentThreadId
        }
    };
    // Get commentThread from dynamo
    return dynamoDB.get(dynamoParams).promise()

    .then((data) => {

        // Extract results
        const dynamoCommentThreadObject = data.Item;
        if(!dynamoCommentThreadObject) {
            throw new ObjectNotFoundError('commentThread', commentThreadId, {
                commentThread: null
            });
        }
        const iCommentThread = {
            objectId: dynamoCommentThreadObject.objectId,
            createdAt: dynamoCommentThreadObject.createdAt,
            updatedAt: dynamoCommentThreadObject.updatedAt,
            parentObjectId: dynamoCommentThreadObject.parentObjectId,
            parentObjectType: dynamoCommentThreadObject.parentObjectType
        };

        console.log('Successfully retrieved comment thread.');

        return {
            iCommentThread: iCommentThread
        };
    });
});
