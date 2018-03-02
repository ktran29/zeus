'use strict';

/*
* Updates the given field in the given table to the given value
*
*/

const AWS = require('aws-sdk');

const ActionRequestHandler = require('../../shared/utils/ActionRequestHandler.js');

module.exports = new ActionRequestHandler(__filename, (params) => {

    const dynamoDB = new AWS.DynamoDB.DocumentClient();

    // Extract parameters
    const tableName = params.tableName;
    const objectId = params.objectId;
    const field = params.field;
    const value = params.value;

    // Get the current datetime
    const now = Date.now();

    var updateParams = {
        'TableName': tableName,
        'Key': {
            'objectId': objectId
        },
        'AttributeUpdates': {
            'updatedAt': {
                'Action': 'PUT',
                'Value': now
            }
        },
        'ReturnValues': 'ALL_NEW'
    };

    if(value === undefined) {
        updateParams.AttributeUpdates[field].Action = 'DELETE';
    } else {
        // Add the field to be updated and the new value to the update request
        updateParams.AttributeUpdates[field] = {
            'Action': 'ADD',
            'Value': dynamoDB.createSet(value)
        };
    }

    return dynamoDB.update(updateParams)

    // Convert dynamo operation to promise
    .promise()

    .then((data) => {
        console.log('Successfully updated fields');
        // Extract results
        const newObject = data.Attributes;
        return {
            newObject: newObject
        };
    });
});
