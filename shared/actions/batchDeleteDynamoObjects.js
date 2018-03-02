'use strict';

/*
    Batch deletion is used to delete dynamo objects in tables
    that have multiple keys, i.e. ObjectAssigned-AE, ObjectChannelTagged-AE, etc
*/

const AWS = require('aws-sdk');

const ActionRequestHandler = require('../../shared/utils/ActionRequestHandler.js');

module.exports = new ActionRequestHandler(__filename, (params) => {

    const dynamodb = new AWS.DynamoDB.DocumentClient();

    const tableName = params.tableName;
    const primaryKey = params.primaryKey;
    const secondaryKey = params.secondaryKey;
    const primaryKeyId = params.primaryKeyId;
    const secondaryKeyId = params.secondaryKeyId;

    var Key = {};

    Key[primaryKey] = primaryKeyId;
    Key[secondaryKey] = secondaryKeyId;

    var RequestItems = {};

    RequestItems[tableName] = [
        {
            DeleteRequest: {
                Key
            }
        }
    ];

    return dynamodb.batchWrite({
        RequestItems
    })

    .promise()

    .then((result) => {
        return result.UnprocessedItems;
    });

});
