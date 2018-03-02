'use strict';

const AWS = require('aws-sdk');

const ActionRequestHandler = require('../../shared/utils/ActionRequestHandler.js');

module.exports = new ActionRequestHandler(__filename, (params) => {

    const dynamodb = new AWS.DynamoDB.DocumentClient();

    const objectId = params.objectId;
    const userId = params.userId;

    return dynamodb.batchWrite({
        RequestItems: {
            'ObjectUserMembership-AE': [
                {
                    DeleteRequest: {
                        Key: {
                            objectId: objectId,
                            userId: userId
                        }
                    }
                }
            ]
        }
    })

    .promise()

    .then((result) => {
        return result.UnprocessedItems;
    });

});
