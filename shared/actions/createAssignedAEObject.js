'use strict';

const AWS = require('aws-sdk');

const ActionRequestHandler = require('../../shared/utils/ActionRequestHandler.js');

module.exports = new ActionRequestHandler(__filename, (params) => {

    const dynamodb = new AWS.DynamoDB.DocumentClient();

    const objectId = params.objectId;
    const associatedId = params.associatedId;
    const associatedType = params.associatedType;
    const objectType = params.objectType;
    const sortDate = new Date(params.sortDate).toISOString();

    return dynamodb.put({
        TableName: `ObjectAssigned-AE`,
        Item: {
            'associatedId-objectType': `${associatedId}-${objectType}`,
            'sortDate-objectId': `${sortDate}-${objectId}`,
            objectId: objectId,
            associatedId: associatedId,
            associatedType: associatedType
        }
    })

    .promise()

    .then(() => {
        console.log('Assigned AE object created successfully');
        return true;
    });
});
