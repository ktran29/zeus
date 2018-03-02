'use strict';

const AWS = require('aws-sdk');

const ActionRequestHandler = require('../../shared/utils/ActionRequestHandler.js');

module.exports = new ActionRequestHandler(__filename, (commentId) => {

    const dynamodb = new AWS.DynamoDB.DocumentClient();

    return dynamodb.delete({
        TableName: 'Comments',
        Key: {
            objectId: commentId
        }
    })

    .promise()

    .then(() => {
        console.log('Successfully deleted comment');
        return true;
    });

});
