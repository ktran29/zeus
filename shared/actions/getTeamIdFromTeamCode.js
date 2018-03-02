'use strict';

const AWS = require('aws-sdk');

const ActionRequestHandler = require('../../shared/utils/ActionRequestHandler.js');

module.exports = new ActionRequestHandler(__filename, (params) => {

    const dynamodb = new AWS.DynamoDB.DocumentClient();

    const teamName = params.teamName;
    const teamCode = params.teamCode;

    const dynamoParams = {
        TableName: 'TeamCodes',
        Key: {
            teamKey: `${teamName}-${teamCode}`
        }
    };

    return dynamodb.get(dynamoParams).promise()

    .then((result) => {
        console.log(`Retrieved teamId from ${teamName}-${teamCode}`);
        const dynamoTeamMapObject = result.Item;

        // Returns null if no teamName-teamCode exists
        if (!dynamoTeamMapObject) {
            return {
                teamId: null
            };
        }

        return {
            teamId: dynamoTeamMapObject.teamId
        };
    });
});
