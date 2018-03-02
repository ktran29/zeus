'use strict';

const AWS = require('aws-sdk');
const ObjectNotFoundError = require('../utils/Errors.js').ObjectNotFoundError;

const ActionRequestHandler = require('../../shared/utils/ActionRequestHandler.js');

module.exports = new ActionRequestHandler(__filename, (announcementId) => {

    const dynamodb = new AWS.DynamoDB.DocumentClient();

    const dynamoParams = {
        TableName: 'Announcements',
        Key: {
            objectId: announcementId
        }
    };

    return dynamodb.get(dynamoParams)

    // Convert to promise
    .promise()

    .then((data) => {
        const dynamoAnnouncementObject = data.Item;
        if(!dynamoAnnouncementObject) {
            throw new ObjectNotFoundError('announcement', announcementId, {
                announcement: null
            });
        }
        const iAnnouncement = {
            objectId: dynamoAnnouncementObject.objectId,
            creatorId: dynamoAnnouncementObject.creatorId,
            teamId: dynamoAnnouncementObject.teamId,
            text: dynamoAnnouncementObject.text,
            createdAt: dynamoAnnouncementObject.createdAt,
            updatedAt: dynamoAnnouncementObject.updatedAt
        };

        console.log('Successfully retrieved announcement');
        return {
            iAnnouncement: iAnnouncement,
            creatorId: iAnnouncement.creatorId
        };
    });
});
