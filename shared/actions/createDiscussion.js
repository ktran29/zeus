'use strict';

const AWS = require('aws-sdk');

const ActionRequestHandler = require('../../shared/utils/ActionRequestHandler.js');

module.exports = new ActionRequestHandler(__filename, (params) => {

    const dynamoDB = new AWS.DynamoDB.DocumentClient();

    // Extract parameters
    const creatorId = params.creatorId;
    const originalPostText = params.originalPostText;
    const commentThreadId = params.commentThreadId;
    const teamId = params.teamId;
    const updatedAt = params.updatedAt;
    const createdAt = params.createdAt;
    const objectId = params.objectId;


    return dynamoDB.put({
        TableName: 'Discussions',
        Item: {
            objectId: objectId,
            createdAt: createdAt,
            updatedAt: updatedAt,
            itemText: originalPostText,
            commentThreadId: commentThreadId,
            teamId: teamId,
            creatorId: creatorId
        }
    })

    // Convert dynamo operation to promise
    .promise()

    .then(() => {
        console.log('Successfully created discussion');

        return {
            discussionId: objectId
        };
    });

});
