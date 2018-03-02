'use strict';

/*
Query description;
Get all objects relating to a user of a given object type.
Currently this table supports CHANNEL, TEAM and BOARD for objectType.

TABLE: ObjectUserMembership-AE
Secondary index

Partition key - userId
Sort key - objectType
*/

const AWS = require('aws-sdk');
const InvalidArgumentError = require('../utils/Errors.js').InvalidArgumentError;

const ActionRequestHandler = require('../../shared/utils/ActionRequestHandler.js');

module.exports = new ActionRequestHandler(__filename, (params) => {

    const dynamodb = new AWS.DynamoDB.DocumentClient();

    // Extract params
    const userId = params.userId;
    const objectType = params.objectType;

    if (!userId || !objectType) {
        throw new InvalidArgumentError('No userId or objectType was passed in');
    }

    var dynamoParams = {
        TableName: 'ObjectUserMembership-AE'
    };

    dynamoParams.IndexName = `userId-objectType-index`;
    dynamoParams.KeyConditions = {
        userId: {
            ComparisonOperator: 'EQ',
            AttributeValueList: [
                userId
            ]
        },
        objectType: {
            ComparisonOperator: 'EQ',
            AttributeValueList: [
                objectType
            ]
        }
    };

    return dynamodb.query(dynamoParams)

    .promise()

    .then((data) => {

        const dynamoAEObjects = data.Items;
        console.log(dynamoAEObjects);
        const userIds = dynamoAEObjects.map(res => res.userId);
        const objectIds = dynamoAEObjects.map(res => res.objectId);

        console.log('Successfully retrieved associated ids');
        return {
            objectIds: objectIds,
            userIds: userIds
        };
    });

});
