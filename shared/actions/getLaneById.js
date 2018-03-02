'use strict';

const AWS = require('aws-sdk');
const ObjectNotFoundError = require('../utils/Errors.js').ObjectNotFoundError;

const ActionRequestHandler = require('../../shared/utils/ActionRequestHandler.js');

module.exports = new ActionRequestHandler(__filename, (laneId) => {
    const dynamodb = new AWS.DynamoDB.DocumentClient();

    return dynamodb.get({
        TableName: 'Lanes',
        Key: {
            objectId: laneId
        }
    })

    .promise()

    .then((data) => {

        const dynamoLaneObject = data.Item;

        if(!dynamoLaneObject) {
            throw new ObjectNotFoundError('lane', laneId, {
                lane: null
            });
        }

        const iLane = {
            objectId: dynamoLaneObject.objectId,
            createdAt: dynamoLaneObject.createdAt,
            updatedAt: dynamoLaneObject.updatedAt,
            name: dynamoLaneObject.name,
            boardId: dynamoLaneObject.boardId
        };

        console.log('Successfully retrieved lane');

        return {
            iLane: iLane
        };
    });

});
