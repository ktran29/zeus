'use strict';

const _ = require('lodash');

const generateUniqueIdentifier = require('../utils/generateUniqueIdentifier.js');

const ActionRequestHandler = require('../../shared/utils/ActionRequestHandler.js');

const actions = {
    createNotificationInfo: require('../../shared/actions/createNotificationInfo.js')
};

module.exports = new ActionRequestHandler(__filename, (params) => {
    const notification = params.notification;
    const targetIds = params.targetIds;

    const generatedId = generateUniqueIdentifier();
    const now = Date.now();

    notification.updatedAt = now;
    notification.createdAt = now;
    notification.objectId = generatedId;

    // Create a notification per targetId.
    return Promise.all(
        targetIds.map((id) => {
            var uniqueNotification = {};
            _.merge(uniqueNotification, notification, { userId: id });
            actions.createNotificationInfo(uniqueNotification);
        })
    )

    .then(() => {
        console.log('Successfully created all notifications. Returning base notification');
        return notification;
    })

    .catch((error) => {
        console.log('For some reason creating a notification for everyone failed;', error);
        throw error;
    });
});
