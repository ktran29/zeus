'use strict';

/*
Query description;
Get all objects associated with a given objectId. Can be filtered by associatedType.
Currently the supported associated types are CHANNEL and USER.

TABLE: ObjectAssigned-AE
Primary index

Partition key - objectId
Sort key - associatedType
*/

const AWS = require('aws-sdk');

const ActionRequestHandler = require('../../shared/utils/ActionRequestHandler.js');

module.exports = new ActionRequestHandler(__filename, (params) => {

    const dynamodb = new AWS.DynamoDB.DocumentClient();

    // Extract params
    const objectId = params.objectId;
    const associatedType = params.associatedType;

    var dynamoParams = {
        TableName: 'ObjectAssigned-AE'
    };

    var KeyConditions = {};

    KeyConditions['objectId'] = {
        ComparisonOperator: 'EQ',
        AttributeValueList: [
            objectId
        ]
    };

    if(associatedType) {
        dynamoParams.IndexName = `objectId-associatedType-index`;
        KeyConditions['associatedType'] = {
            ComparisonOperator: 'EQ',
            AttributeValueList: [
                associatedType
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
        const primaryKeyIds = dynamoAEObjects.map(res => res['associatedId-objectType']);
        const secondaryKeyIds = dynamoAEObjects.map(res => res['sortDate-objectId']);

        console.log('Successfully retrieved associated ids');
        return {
            objectIds: objectIds,
            associatedIds: associatedIds,
            primaryKeyIds: primaryKeyIds,
            secondaryKeyIds: secondaryKeyIds
        };
    })

    .catch((error) => {
        console.log('What the eff is the error', error);
        throw error;
    });

});
