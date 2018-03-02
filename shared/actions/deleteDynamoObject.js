'use strict';

const AWS = require('aws-sdk');

const ActionRequestHandler = require('../../shared/utils/ActionRequestHandler.js');

module.exports = new ActionRequestHandler(__filename, (params) => {

    const tableName = params.tableName;
    const objectId = params.objectId;

    const dynamodb = new AWS.DynamoDB.DocumentClient();

    return dynamodb.delete({
        TableName: tableName,
        Key: {
            objectId: objectId
        }
    })

    .promise()

    .then((result) => {

        console.log('Successfully deleted dynamo object');
        return result;
    });
});
