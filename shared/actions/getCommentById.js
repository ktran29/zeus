'use strict';

const AWS = require('aws-sdk');
const ObjectNotFoundError = require('../utils/Errors.js').ObjectNotFoundError;

const ActionRequestHandler = require('../../shared/utils/ActionRequestHandler.js');

module.exports = new ActionRequestHandler(__filename, (commentId) => {

    const dynamodb = new AWS.DynamoDB.DocumentClient();

    const dynamoParams = {
        TableName: 'Comments',
        Key: {
            objectId: commentId
        }
    };

    return dynamodb.get(dynamoParams).promise()

    .then((data) => {

        const dynamoCommentObject = data.Item;
        if(!dynamoCommentObject) {
            throw new ObjectNotFoundError('comment', commentId, {
                comment: null
            });
        }
        const iComment = {
            objectId: dynamoCommentObject.objectId,
            createdAt: dynamoCommentObject.createdAt,
            updatedAt: dynamoCommentObject.updatedAt,
            authorId: dynamoCommentObject.authorId,
            commentText: dynamoCommentObject.commentText,
            commentThreadId: dynamoCommentObject.commentThreadId
        };

        console.log('Successfully retrieved comment');

        return {
            iComment: iComment
        };
    });

});
