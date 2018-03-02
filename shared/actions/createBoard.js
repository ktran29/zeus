'use strict';

const AWS = require('aws-sdk');

const generateUniqueIdentifier = require('../utils/generateUniqueIdentifier.js');

const ActionRequestHandler = require('../../shared/utils/ActionRequestHandler.js');

module.exports = new ActionRequestHandler(__filename, (params) => {

    const dynamodb = new AWS.DynamoDB.DocumentClient();

    const boardId = generateUniqueIdentifier();
    const name = params.name;
    const teamId = params.teamId;
    const creatorId = params.creatorId;

    return dynamodb.put({
        TableName: 'Boards',
        Item: {
            objectId: boardId,
            createdAt: Date.now(),
            updatedAt: Date.now(),
            name: name,
            teamId: teamId,
            creatorId: creatorId
        }
    })

    .promise()

    .then(() => {
        console.log('Successfully created board');

        return {
            boardId: boardId
        };
    });
});
