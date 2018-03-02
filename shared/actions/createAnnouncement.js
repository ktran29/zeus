'use strict';

const AWS = require('aws-sdk');

const ActionRequestHandler = require('../../shared/utils/ActionRequestHandler.js');

module.exports = new ActionRequestHandler(__filename, (params) => {

    const dynamodb = new AWS.DynamoDB.DocumentClient();

    const announcementId = params.announcementId;
    const userId = params.userId;
    const teamId = params.teamId;
    const text = params.text;
    const createdAt = params.createdAt;
    const updatedAt = params.updatedAt;

    return dynamodb.put({
        TableName: 'Announcements',
        Item: {
            objectId: announcementId,
            createdAt: createdAt,
            updatedAt: updatedAt,
            creatorId: userId,
            teamId: teamId,
            text: text,
        }
    })

    // Convert to promise syntax
    .promise()

    .then(() => {

        console.log('Announcement created successfully');

        return {
            announcementId: announcementId,
        };
    });
});
