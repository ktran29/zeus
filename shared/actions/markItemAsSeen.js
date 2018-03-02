'use strict';

const AWS = require('aws-sdk');

const ActionRequestHandler = require('../../shared/utils/ActionRequestHandler.js');

module.exports = new ActionRequestHandler(__filename, (params) => {

    const dynamodb = new AWS.DynamoDB.DocumentClient();

    const objectId = params.objectId;
    const userId = params.userId;
    const teamId = params.teamId;

    return dynamodb.batchWrite({
        RequestItems: {
            'UnseenObject-AE': [
                {
                    DeleteRequest: {
                        Key: {
                            objectId: objectId,
                            'userId-teamId': `${userId}-${teamId}`
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
