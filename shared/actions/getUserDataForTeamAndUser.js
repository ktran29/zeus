'use strict';

const AWS = require('aws-sdk');
const Debug = require('../utils/Debug.js');
const ObjectNotFoundError = require('../utils/Errors.js').ObjectNotFoundError;
const stringifyObject = require('../../shared/utils/stringifyObject.js');

const ActionRequestHandler = require('../../shared/utils/ActionRequestHandler.js');

module.exports = new ActionRequestHandler(__filename, (params) => {

    // extract parameters
    const userId = params.userId;
    const teamId = params.teamId;

    const dynamodb = new AWS.DynamoDB.DocumentClient();

    // get UserData from dynamo
    return dynamodb.query({
        TableName: 'UserData',
        IndexName: 'teamId-userId-index',
        KeyConditions: {
            teamId: {
                ComparisonOperator: 'EQ',
                AttributeValueList: [
                    teamId
                ]
            },
            userId: {
                ComparisonOperator: 'EQ',
                AttributeValueList: [
                    userId
                ]
            }
        }
    })

    // use promise syntax
    .promise()

    .then((data) => {

        console.log('data retrieved from dynamo:', stringifyObject(data));

        if (data.Count === 0) {
            throw new ObjectNotFoundError('userData', `teamId: ${teamId}, userId: ${userId}`, {
                'params': params
            });
        }

        if (data.Count > 1) {
            Debug.warnAndContinue('Found multiple UserDatas for the same user/team combo.', {
                'params': params
            });
        }
        const dynamoUserData = data['Items'][0];

        const iUserData = {
            // metadata
            objectId: dynamoUserData.objectId,
            createdAt: dynamoUserData.createdAt,
            updatedAt: dynamoUserData.updatedAt,

            // data
            teamId: dynamoUserData.teamId,
            userId: dynamoUserData.userId
        };

        return {
            iUserData: iUserData
        };
    });
});
