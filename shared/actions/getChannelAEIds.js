'use strict';

const AWS = require('aws-sdk');

const ActionRequestHandler = require('../../shared/utils/ActionRequestHandler.js');

module.exports = new ActionRequestHandler(__filename, (params) => {

    const dynamodb = new AWS.DynamoDB.DocumentClient();

    // Extract params
    const partitionKeyId = params.partitionKeyId;
    const sortKeyId = params.sortKeyId;
    const partitionKey = params.partitionKey;
    const sortKey = params.sortKey;

    var dynamoParams = {
        TableName: 'ObjectChannelTagged-AE'
    };

    var KeyConditions = {};

    KeyConditions[partitionKey] = {
        ComparisonOperator: 'EQ',
        AttributeValueList: [
            partitionKeyId
        ]
    };
    if(sortKey) {
        dynamoParams.IndexName = `${partitionKey}-${sortKey}-index`;
        KeyConditions[sortKey] = {
            ComparisonOperator: 'EQ',
            AttributeValueList: [
                sortKeyId
            ]
        };
    }

    dynamoParams.KeyConditions = KeyConditions;

    return dynamodb.query(dynamoParams)

    .promise()

    .then((data) => {
        const dynamoAEObjects = data.Items;
        const objectIds = dynamoAEObjects.map(res => res.objectId);
        const channelIds = dynamoAEObjects.map(res => res.channelId);

        console.log('Successfully retrieved object ids');
        return {
            objectIds: objectIds,
            channelIds: channelIds
        };
    });

});
