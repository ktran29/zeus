'use strict';

/*
NOTE: Creates a notification with a two week expiration date.
*/

const AWS = require('aws-sdk');

const generateUniqueIdentifier = require('../utils/generateUniqueIdentifier.js');

const ActionRequestHandler = require('../../shared/utils/ActionRequestHandler.js');

module.exports = new ActionRequestHandler(__filename, (notification) => {

    // console.log('Here is the passed in notification:', notification);
    const dynamodb = new AWS.DynamoDB.DocumentClient();
    const twoWeeks = 2 * 7 * 24 * 60 * 60 * 1000;

    if (!notification.objectId) {
        notification.objectId = generateUniqueIdentifier();
    }

    const notificationInfo = {
        objectId: notification.objectId,
        'userId-teamId': `${notification.userId}-${notification.teamId}`,
        createdAt: notification.createdAt,
        updatedAt: notification.updatedAt,
        expirationDate: notification.createdAt + twoWeeks,
        type: notification.notificationType,
        actors: notification.actors,
        subjects: notification.subjects
    };

    return dynamodb.put({
        TableName: 'Notifications',
        Item: notificationInfo
    })

    .promise()

    .then(() => {
        console.log('Successfully created notification info');
        return {
            notificationInfo: notificationInfo,
        };
    });
});
