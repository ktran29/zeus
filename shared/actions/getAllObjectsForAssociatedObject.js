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
    const associatedId = params.associatedId;
    const objectType = params.objectType;

    const lowerBoundDate = params.lowerBoundDate;
    const upperBoundDate = params.upperBoundDate;
    const objectId = params.objectId;

    var dynamoParams = {
        TableName: 'ObjectAssigned-AE'
    };

    var KeyConditions = {};

    KeyConditions['associatedId-objectType'] = {
        ComparisonOperator: 'EQ',
        AttributeValueList: [
            `${associatedId}-${objectType}`
        ]
    };

    // Ranges not comepletely implemented.
    if(lowerBoundDate && upperBoundDate && objectId) {
        dynamoParams.IndexName = `sortDate-objectId-index`;
        KeyConditions['associatedType'] = {
            ComparisonOperator: 'EQ',
            AttributeValueList: [
                `${lowerBoundDate}-${objectId}`
            ]
        };
    }

    dynamoParams.KeyConditions = KeyConditions;

    return dynamodb.query(dynamoParams)

    .promise()

    .then((data) => {
        const dynamoAEObjects = data.Items;
        const objectIds = dynamoAEObjects.map(res => res.objectId);
        const associatedIds = dynamoAEObjects.map(res => res.associatedId);

        console.log('Successfully retrieved associated ids');
        return {
            objectIds: objectIds,
            associatedIds: associatedIds
        };
    });

});
