'use strict';

/*
Query description;
Get all channelIds associated with a given teamId.

TABLE: Channels
*/

const AWS = require('aws-sdk');

const ActionRequestHandler = require('../../shared/utils/ActionRequestHandler.js');

module.exports = new ActionRequestHandler(__filename, (teamId) => {

    const dynamodb = new AWS.DynamoDB.DocumentClient();

    return dynamodb.query({
        TableName: 'Channels',
        KeyConditions: {
            teamId: {
                ComparisonOperator: 'EQ',
                AttributeValueList: [teamId]
            }
        },
        IndexName: 'teamId-index'
    })

    .promise()

    .then((data) => {

        const dynamoChannelObjects = data.Items;
        const channelIds = dynamoChannelObjects.map(res => res.objectId);

        console.log('Successfully retrieved channel ids');
        return {
            channelIds: channelIds,
        };
    });

});
