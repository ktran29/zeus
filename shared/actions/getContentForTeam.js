'use strict';

/*
Query description;
Get all objects of objectType that have been assigned directly to associatedObject.
Currently this table supports USER or CHANNEL for associatedTypes

TABLE: ObjectAssigned-AE
Primary index

Partition key - associatedId-objectType
Sort key - sortDate-ObjectId
*/

const AWS = require('aws-sdk');

const ActionRequestHandler = require('../../shared/utils/ActionRequestHandler.js');

module.exports = new ActionRequestHandler(__filename, (params) => {

    const dynamodb = new AWS.DynamoDB.DocumentClient();

    // Extract params
    const teamId = params.teamId;
    const tableName = params.tableName;

    var dynamoParams = {
        IndexName: 'teamId-index',
        TableName: tableName,
        KeyConditions: {
            teamId: {
                ComparisonOperator: 'EQ',
                AttributeValueList: [
                    teamId
                ]
            }
        }
    };

    return dynamodb.query(dynamoParams)

    .promise()

    .then((data) => {
        const dynamoAEObjects = data.Items;
        const objectIds = dynamoAEObjects.map(res => res.objectId);

        console.log('Successfully retrieved object ids');
        return {
            objectIds: objectIds
        };
    });

});
