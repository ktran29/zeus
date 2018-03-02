'use strict';

const AWS = require('aws-sdk');
const ObjectNotFoundError = require('../utils/Errors.js').ObjectNotFoundError;

const ActionRequestHandler = require('../../shared/utils/ActionRequestHandler.js');

module.exports = new ActionRequestHandler(__filename, (discussionId) => {
    const dynamoDB = new AWS.DynamoDB.DocumentClient();

    return dynamoDB.get({
        'TableName': 'Discussions',
        'Key': {
            'objectId': discussionId
        }
    })

    // Convert dynamo operation to promise
    .promise()

    .then((data) => {
        // Extract results
        const dynamoDiscussionObject = data.Item;
        if(!dynamoDiscussionObject) {
            throw new ObjectNotFoundError('discussion', discussionId, {
                discussion: null
            });
        }

        const iDiscussion = {
            objectId: dynamoDiscussionObject.objectId,
            createdAt: dynamoDiscussionObject.createdAt,
            updatedAt: dynamoDiscussionObject.updatedAt,
            commentThreadId: dynamoDiscussionObject.commentThreadId,
            itemText: dynamoDiscussionObject.itemText,
            creatorId: dynamoDiscussionObject.creatorId,
            teamId: dynamoDiscussionObject.teamId
        };

        console.log('Successfully retrieved discussion');

        return {
            iDiscussion: iDiscussion,
            creatorId: iDiscussion.userId,
            commentThreadId: iDiscussion.commentThreadId
        };
    });
});
