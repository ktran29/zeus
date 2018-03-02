'use strict';

const AWS = require('aws-sdk');

const ActionRequestHandler = require('../../shared/utils/ActionRequestHandler.js');

module.exports = new ActionRequestHandler(__filename, (taskId) => {

    const dynamodb = new AWS.DynamoDB.DocumentClient();

    return dynamodb.delete({
        TableName: 'Tasks',
        Key: {
            objectId: taskId
        }
    })

    .promise()

    .then(() => {
        console.log('Successfully deleted task');
        return true;
    });

});
