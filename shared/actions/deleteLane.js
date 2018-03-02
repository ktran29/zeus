'use strict';

const AWS = require('aws-sdk');

const ActionRequestHandler = require('../../shared/utils/ActionRequestHandler.js');

module.exports = new ActionRequestHandler(__filename, (laneId) => {

    const dynamodb = new AWS.DynamoDB.DocumentClient();

    return dynamodb.delete({
        TableName: 'Lanes',
        Key: {
            objectId: laneId
        }
    })

    .promise()

    .then(() => {
        console.log('Successfully deleted lane');
        return true;
    });
});
