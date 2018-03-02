'use strict';

// for validating request
const GetNotificationsRequest_V0_Schema = require('./GetNotificationsRequest_V0_Schema_generated.json');

// for creating versioned response
const NotificationConverter = require('../../shared/converters/NotificationConverter.js');
const AnnouncementConverter = require('../../shared/converters/AnnouncementConverter.js');

// for outsourcing common request / response handling
const LambdaRequestHandler = require('../../shared/utils/LambdaRequestHandler.js');

// errors
const UnsupportedObjectTypeError = require('../../shared/utils/Errors.js').UnsupportedObjectTypeError;

module.exports.handler = new LambdaRequestHandler(GetNotificationsRequest_V0_Schema, (request) => {

    // extract parameters
    const apiVersion = request.apiVersion;
    const notificationIds = request.notificationIds;

    return Promise.reject();

    // return transactions.getNotificationPayloads(notificationIds)
    //
    // .then((notificationPayloads) => {
    // 
    //     switch (apiVersion) {
    //         case 'v0': {
    //             return notificationPayloads.map((payload) => ({
    //                 notification: NotificationConverter.convertTo_V0(payload.iNotification),
    //                 data: convertToShort_V0(payload.iNotification.objectType, payload.iObject)
    //             }));
    //         }
    //
    //         default: break; // handled in LambdaRequestHandler
    //     }
    // });
});

const convertToShort_V0 = (objectType, object) => {

    switch (objectType.toLowerCase()) {
        case 'announcement':
            return AnnouncementConverter.convertToShortV0(object);

        default:
            throw new UnsupportedObjectTypeError('convertToShort_V0', objectType);
    }
};
