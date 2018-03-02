'use strict';

const AWS = require('aws-sdk');
const ObjectNotFoundError = require('../utils/Errors.js').ObjectNotFoundError;

const ActionRequestHandler = require('../../shared/utils/ActionRequestHandler.js');

module.exports = new ActionRequestHandler(__filename, (boardId) => {
    const dynamodb = new AWS.DynamoDB.DocumentClient();

    return dynamodb.get({
        TableName: 'Boards',
        Key: {
            objectId: boardId
        }
    })

    .promise()

    .then((data) => {

        const dynamoBoardObject = data.Item;

        if(!dynamoBoardObject) {
            throw new ObjectNotFoundError('board', boardId, {
                board: null
            });
        }

        const iBoard = {
            objectId: dynamoBoardObject.objectId,
            createdAt: dynamoBoardObject.createdAt,
            updatedAt: dynamoBoardObject.updatedAt,
            name: dynamoBoardObject.name,
            teamId: dynamoBoardObject.teamId,
            creatorId: dynamoBoardObject.creatorId
        };

        console.log('Successfully retrieved board');

        return {
            iBoard: iBoard
        };
    });

});
