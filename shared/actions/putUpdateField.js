'use strict';

/*
* Updates the given field in the given table to the given value
*
*/

const AWS = require('aws-sdk');
const dynamoDB = new AWS.DynamoDB.DocumentClient();

const ActionRequestHandler = require('../../shared/utils/ActionRequestHandler.js');

module.exports = new ActionRequestHandler(__filename, (params) => {

    // Extract parameters
    const tableName = params.tableName;
    const objectId = params.objectId;
    const field = params.field;
    var value = params.value;

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

    // If no field specified, just updates the updatedAt column
    if (field) {
        if(value && value.constructor === Array) {
            if(value.length > 0) {
                value = dynamoDB.createSet(value);
            } else {
                value = undefined;
            }
        }

        // Add the field to be updated and the new value to the update request
        updateParams.AttributeUpdates[field] = {
            'Action': 'PUT',
            // Puts in a set if the passed in value is an array,
            // otherwise just the value
            'Value': value
        };

        if(value === undefined) {
            updateParams.AttributeUpdates[field].Action = 'DELETE';
        }
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
