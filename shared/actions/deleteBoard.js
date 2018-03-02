'use strict';

const AWS = require('aws-sdk');

const ActionRequestHandler = require('../../shared/utils/ActionRequestHandler.js');

module.exports = new ActionRequestHandler(__filename, (boardId) => {

    const dynamodb = new AWS.DynamoDB.DocumentClient();

    return dynamodb.delete({
        TableName: 'Boards',
        Key: {
            objectId: boardId
        }
    })

    .promise()

    .then(() => {
        console.log('Successfully deleted board');
        return true;
    });
});
