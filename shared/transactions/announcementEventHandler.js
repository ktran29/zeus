'use strict';

const actions = {
    getUserById: require('../actions/getUserById.js'),
    getAllAssociatedObjectsForObjectId: require('../actions/getAllAssociatedObjectsForObjectId.js'),
    aggregateUserIds: require('../actions/aggregateUserIds.js')
};

const utils = {
    notificationConstructor: require('../utils/notificationConstructor.js'),
    dataEventConstructor: require('../utils/dataEventConstructor.js'),
};

const createNotification = require('../transactions/createNotification.js');

const firebaseAdapter = require('../services/firebaseAdapter.js');
const massUpdate = firebaseAdapter.massUpdate;

module.exports = (params) => {
    const operation = params.operation;
    const announcement = params.objectInfo;

    switch(operation) {
        case 'INSERT': {
            return handleInsert(announcement);
        }

        case 'REMOVE': {
            return handleRemove(announcement);
        }

        default: {
            console.log(`Skipping unsupported operation: ${operation}`);
            break;
        }
    }
};

//------------------------------------------------------------------------------
// Handle functions
//------------------------------------------------------------------------------

const handleInsert = function(announcement) {
    return gatherInsertData(announcement)

    .then((data) => {
        return constructInsertPayloads(data);
    })

    .then((payloads) => {
        return massUpdate(payloads);
    });
};

const handleRemove = function(announcement) {
    return gatherRemoveData(announcement)

    .then((data) => {
        return constructRemovePayloads(data);
    })

    .then((payloads) => {
        return massUpdate(payloads);
    });
};

//------------------------------------------------------------------------------
// Insert helper functions
//------------------------------------------------------------------------------

const gatherInsertData = function(announcement) {
    console.log('[Gather Data] - START');

    var data = {
        announcement: announcement
    };

    return actions.getAllAssociatedObjectsForObjectId({
        objectId: announcement.objectId.S,
        associatedType: 'CHANNEL'
    })

    .then((result) => {
        data.channelIds = result.associatedIds;
        console.log('[Gather Data] - Get all assigned channels : SUCCESS');

        return actions.getUserById(announcement.creatorId.S);
    })

    .then((result) => {
        data.sender = result.iUser;
        console.log('[Gather Data] - Get announcement sender : SUCCESS');

        return actions.aggregateUserIds({
            assignedChannelIds: data.channelIds
        });
    })

    .then((result) => {
        data.aggregatedUserIds = result.userIds;
        console.log('[Gather Data] - Aggregate all users in channels : SUCCESS');
        console.log('[Gather Data] - END');

        return data;
    })

    .catch((error) => {
        console.log('[Gater Data] - FAILED', error);
        throw error;
    });
};

const constructInsertPayloads = function(data) {
    console.log('[Constructing Payloads] - START');
    var payloads = [];

    const dataEventCreator = new utils.dataEventConstructor();
    dataEventCreator.addObject('ANNOUNCEMENT', data.announcement.objectId.S, data.announcement.updatedAt.N);

    payloads.push({
        targets: [data.sender.objectId],
        dataEvent: dataEventCreator.getDataEvent()
    });

    console.log('[Constructing Payloads] - Default payload constructed');
    var defaultDataTargetIds = data.aggregatedUserIds.filter((objectId) => objectId !== data.sender.objectId);

    return createInsertNotification(data.announcement, data.sender, defaultDataTargetIds)

    .then((notification) => {
        var objectId = notification.objectId;
        var updatedAt = notification.updatedAt;

        console.log('[Constructing Payloads] - Notification constructed');

        dataEventCreator.addObject('NOTIFICATION', objectId, updatedAt);

        payloads.push({
            targets: defaultDataTargetIds,
            dataEvent: dataEventCreator.getDataEvent()
        });

        console.log('[Constructing Payloads] - Notification payload constructed');
        console.log('[Constructing Payloads] - END');

        return payloads;
    });
};

const createInsertNotification = function(announcement, sender, targetIds) {
    var notification = new utils.notificationConstructor();

    var announcementNotifShort = {
        updatedAt: announcement.updatedAt.N,
        createdAt: announcement.createdAt.N,
        text: announcement.text.S
    };

    notification.teamId = announcement.teamId.S;

    notification.setType('ANNOUNCEMENT_NEW');
    notification.addActor(sender);
    notification.addToSubject('ANNOUNCEMENT', announcementNotifShort);

    return createNotification( {notification: notification, targetIds: targetIds} )

    .then((notification) => {
        return notification;
    });
};

//------------------------------------------------------------------------------
// Remove helper functions
//------------------------------------------------------------------------------

const gatherRemoveData = function(announcement) {
    console.log('[Gather Data] - START');

    var data = {
        announcement: announcement
    };

    return actions.getAllAssociatedObjectsForObjectId({
        objectId: announcement.objectId.S,
        associatedType: 'CHANNEL'
    })

    .then((result) => {
        data.channelIds = result.associatedIds;
        console.log('[Gather Data] - Get all assigned channels : SUCCESS');

        return actions.getUserById(announcement.creatorId.S);
    })

    .then((result) => {
        data.sender = result.iUser;
        console.log('[Gather Data] - Get announcement sender : SUCCESS');

        return actions.aggregateUserIds({
            assignedChannelIds: data.channelIds
        });
    })

    .then((result) => {
        data.aggregatedUserIds = result.userIds;
        console.log('[Gather Data] - Aggregate all users in channels : SUCCESS');
        console.log('[Gather Data] - END');

        return data;
    });
};

const constructRemovePayloads = function(data) {
    console.log('[Constructing Payloads] - START');
    var payloads = [];

    const dataEventCreator = new utils.dataEventConstructor();
    dataEventCreator.addObject('ANNOUNCEMENT', data.announcement.objectId.S, -1);

    payloads.push({
        targets: [data.sender.objectId],
        dataEvent: dataEventCreator.getDataEvent()
    });

    var defaultDataTargetIds = data.aggregatedUserIds.filter((objectId) => objectId !== data.sender.objectId);

    payloads.push({
        targets: defaultDataTargetIds,
        dataEvent: dataEventCreator.getDataEvent()
    });

    console.log('[Constructing Payloads] - Payloads constructed');

    console.log('[Constructing Payloads] - END');

    return payloads;
};
