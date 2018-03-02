'use strict';

const AWS = require('aws-sdk');

// Creates a random 6 digit pin
const generateTeamCode = () => {
    return Math.floor(Math.random()*900000) + 100000;
};

const ActionRequestHandler = require('../../shared/utils/ActionRequestHandler.js');

module.exports = new ActionRequestHandler(__filename, (params) => {

    const dynamodb = new AWS.DynamoDB.DocumentClient();

    const teamName = params.teamName;
    const teamId = params.teamId;

    const attemptToAddMapToDynamo = () => {
        var teamCode = generateTeamCode();
        var dynamoParams = {
            TableName: 'TeamCodes',
            Item: {
                teamKey: `${teamName}-${teamCode}`,
                teamId: teamId
            }
        };

        return dynamodb.put(dynamoParams).promise()

        .then(() => {
            console.log(`Team ${teamName}-${teamCode} created successfully`);
            return {
                iTeamCode: teamCode
            };
        })

        // If the teamName-teamPin combo exists, recursively tries a new combo
        .catch(() => {
            console.log(`${teamName}-${teamCode} exists. Trying again.`);
            attemptToAddMapToDynamo();
        });

    };

    return attemptToAddMapToDynamo();
});
