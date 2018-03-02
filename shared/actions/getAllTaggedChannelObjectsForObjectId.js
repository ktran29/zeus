'use strict';

/*
Query description;
Get all objects associated with a given objectId.

TABLE: ObjectChannelTagged-AE
Primary index

Partition key - objectId
*/

const AWS = require('aws-sdk');

const ActionRequestHandler = require('../../shared/utils/ActionRequestHandler.js');

module.exports = new ActionRequestHandler(__filename, (params) => {

    const dynamodb = new AWS.DynamoDB.DocumentClient();

    // Extract params
    const objectId = params.objectId;
    const channelId = params.channelId;
    const objectType = params.objectType;

    if(objectId) {
        var dynamoParams = {
            TableName: 'ObjectChannelTagged-AE',
            KeyConditions: {
                objectId: {
                    ComparisonOperator: 'EQ',
                    AttributeValueList: [
                        objectId
                    ]
                }
            }
        };
    } else {
        dynamoParams = {
            TableName: 'ObjectChannelTagged-AE',
            KeyConditions: {
                channelId: {
                    ComparisonOperator: 'EQ',
                    AttributeValueList: [
                        channelId
                    ]
                },
                objectType: {
                    ComparisonOperator: 'EQ',
                    AttributeValueList: [
                        objectType
                    ]
                }
            },
            IndexName: 'channelId-objectType-index'
        };
    }

    return dynamodb.query(dynamoParams)

    .promise()

    .then((data) => {

        const dynamoAEObjects = data.Items;
        const objectIds = dynamoAEObjects.map(res => res.objectId);
        const channelIds = dynamoAEObjects.map(res => res.channelId);

        console.log('Successfully retrieved channel ids');
        return {
            objectIds: objectIds,
            channelIds: channelIds
        };
    });

});
