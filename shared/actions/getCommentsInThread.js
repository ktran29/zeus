'use strict';

const AWS = require('aws-sdk');

const ActionRequestHandler = require('../../shared/utils/ActionRequestHandler.js');

module.exports = new ActionRequestHandler(__filename, (params) => {

    const dynamodb = new AWS.DynamoDB.DocumentClient();

    // Extract params
    const commentThreadId = params.commentThreadId;
    const before = parseInt(params.before);
    const max = params.max || 10;

    var dynamoParams = {
        TableName: 'Comments',
        IndexName: 'commentThreadId-createdAt-index',
        KeyConditions: {
            commentThreadId: {
                ComparisonOperator: 'EQ',
                AttributeValueList: [
                    commentThreadId
                ]
            }
        },
        Limit: max,
        ScanIndexForward: false
    };

    if(before) {
        dynamoParams.KeyConditions['createdAt'] = {
            ComparisonOperator: 'LT',
            AttributeValueList: [
                before
            ]
        };
    }

    return dynamodb.query(dynamoParams)

    .promise()

    .then((data) => {
        const dynamoCommentObjects = data.Items;

        var iComments = [];
        var commentIds = [];

        dynamoCommentObjects.forEach((dynamoCommentObject) => {
            commentIds.push(dynamoCommentObject.objectId);
            const iComment = {
                objectId: dynamoCommentObject.objectId,
                createdAt: dynamoCommentObject.createdAt,
                updatedAt: dynamoCommentObject.updatedAt,
                authorId: dynamoCommentObject.authorId,
                commentText: dynamoCommentObject.commentText,
                commentThreadId: dynamoCommentObject.commentThreadId
            };
            iComments.push(iComment);
        });


        console.log('Successfully retrieved comments');
        return {
            iComments: iComments,
            commentIds: commentIds
        };
    });

});
