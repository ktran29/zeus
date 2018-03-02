'use strict';

const AWS = require('aws-sdk');

const generateUniqueIdentifier = require('../utils/generateUniqueIdentifier.js');

const ActionRequestHandler = require('../../shared/utils/ActionRequestHandler.js');

module.exports = new ActionRequestHandler(__filename, (params) => {

    const dynamodb = new AWS.DynamoDB.DocumentClient();

    const name = params.name;
    const boardId = params.boardId;
    const laneId = generateUniqueIdentifier();

    return dynamodb.put({
        TableName: 'Lanes',
        Item: {
            objectId: laneId,
            createdAt: Date.now(),
            updatedAt: Date.now(),
            name: name,
            boardId: boardId,
            taskIds: undefined
        }
    })

    .promise()

    .then(() => {
        console.log('Successfully created lane');
        return {
            laneId: laneId,
        };
    });

});
