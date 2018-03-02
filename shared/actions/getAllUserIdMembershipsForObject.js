'use strict';

/*
Query description;
Get all userIds are on a roster of a given objectId.
Currently this table supports CHANNEL, TEAM and BOARD as objectTypes.

TABLE: ObjectUserMembership-AE
Primary index

Partition key - objectId
Sort key - userId
*/

const AWS = require('aws-sdk');
const InvalidArgumentError = require('../utils/Errors.js').InvalidArgumentError;

const ActionRequestHandler = require('../../shared/utils/ActionRequestHandler.js');

module.exports = new ActionRequestHandler(__filename, (params) => {

    const dynamodb = new AWS.DynamoDB.DocumentClient();

    // Extract params
    const objectId = params.objectId;

    if (!objectId) {
        throw new InvalidArgumentError('No objectId was passed in.');
    }

    var dynamoParams = {
        TableName: 'ObjectUserMembership-AE'
    };

    dynamoParams.KeyConditions = {
        objectId: {
            ComparisonOperator: 'EQ',
            AttributeValueList: [
                objectId
            ]
        }
    };

    return dynamodb.query(dynamoParams)

    .promise()

    .then((data) => {

        const dynamoAEObjects = data.Items;
        const userIds = dynamoAEObjects.map(res => res.userId);
        const objectIds = dynamoAEObjects.map(res => res.objectId);

        return {
            objectIds: objectIds,
            userIds: userIds
        };
    });

});
