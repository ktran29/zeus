'use strict';

const actions = {
    getUserById: require('../actions/getUserById.js'),
    getAllAssociatedObjectsForObjectId: require('../actions/getAllAssociatedObjectsForObjectId.js'),
    aggregateUserIds: require('../actions/aggregateUserIds.js')
};

const utils = {
    notificationConstructor: require('../utils/notificationConstructor.js'),
    dataEventConstructor: require('../utils/dataEventConstructor.js')
};

const createNotification = require('../transactions/createNotification.js');

const firebaseAdapter = require('../services/firebaseAdapter.js');
const massUpdate = firebaseAdapter.massUpdate;

module.exports = (params) => {
    const operation = params.operation;
    const discussion = params.objectInfo;

    console.log('What is objectinfo?', discussion);

    switch(operation) {
        case 'INSERT': {
            return handleInsert(discussion);
        }

        case 'REMOVE': {
            return handleRemove(discussion);
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

const handleInsert = function(discussion) {
    return gatherInsertData(discussion)

    .then((data) => {
        return constructInsertPayloads(data);
    })

    .then((payloads) => {
        return massUpdate(payloads);
    });
};

const handleRemove = function(discussion) {
    return gatherRemoveData(discussion)

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

const gatherInsertData = function(discussion) {
    console.log('[Gather Data] - START');
    console.log('[Gather Data] - Discussion', discussion);

    var data = {
        discussion: discussion
    };

    return actions.getAllAssociatedObjectsForObjectId({
        objectId: discussion.objectId.S,
        associatedType: 'CHANNEL'
    })

    .then((result) => {
        data.channelIds = result.associatedIds;
        console.log('[Gather Data] - Get all assigned channels : SUCCESS');

        return actions.getUserById(discussion.creatorId.S);
    })

    .then((result) => {
        data.sender = result.iUser;
        console.log('[Gather Data] - Get discussion sender : SUCCESS');

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
        console.log('[Gather Data] - FAILED', error);
        throw error;
    });
};

const constructInsertPayloads = function(data) {
    console.log('[Constructing Payloads] - START');
    console.log('[Constructing Payloads] - What is data?', data);
    var payloads = [];

    const dataEventCreator = new utils.dataEventConstructor();
    dataEventCreator.addObject('DISCUSSION', data.discussion.objectId.S, data.discussion.updatedAt.N);

    payloads.push({
        targets: [data.sender.objectId],
        dataEvent: dataEventCreator.getDataEvent()
    });

    console.log('[Constructing Payloads] - Default payload constructed');
    var defaultDataTargetIds = data.aggregatedUserIds.filter((objectId) => objectId !== data.sender.objectId);

    return createInsertNotification(data.discussion, data.sender, defaultDataTargetIds)

    .then((notification) => {
        var notificationId = notification.objectId;
        var updatedAt = notification.updatedAt;

        console.log('[Constructing Payloads] - Notification constructed');

        dataEventCreator.addObject('NOTIFICATION', notificationId, updatedAt);

        payloads.push({
            targets: defaultDataTargetIds,
            dataEvent: dataEventCreator.getDataEvent()
        });

        console.log('[Constructing Payloads] - Notification payload constructed');
        console.log('[Constructing Payloads] - END');

        return payloads;
    });
};

const createInsertNotification = function(discussion, sender, targetIds) {
    var notification = new utils.notificationConstructor();

    var discussionNotifShort = {
        updatedAt: discussion.updatedAt.N,
        createdAt: discussion.createdAt.N,
        text: discussion.itemText.S
    };

    notification.teamId = discussion.teamId.S;

    notification.setType('DISCUSSION_NEW');
    notification.addActor(sender);
    notification.addToSubject('DISCUSSION', discussionNotifShort);

    return createNotification( {notification: notification, targetIds: targetIds} )

    .then((notification) => {
        return notification;
    });
};

//------------------------------------------------------------------------------
// Remove helper functions
//------------------------------------------------------------------------------

const gatherRemoveData = function(discussion) {
    console.log('[Gather Data] - START');
    console.log('[Gather Data] - Discussion', discussion);

    var data = {
        discussion: discussion
    };

    return actions.getAllAssociatedObjectsForObjectId({
        objectId: discussion.objectId.S,
        associatedType: 'CHANNEL'
    })

    .then((result) => {
        data.channelIds = result.associatedIds;
        console.log('[Gather Data] - Get all assigned channels : SUCCESS');

        return actions.getUserById(discussion.creatorId.S);
    })

    .then((result) => {
        data.sender = result.iUser;
        console.log('[Gather Data] - Get discussion sender : SUCCESS');

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
        console.log('[Gather Data] - FAILED', error);
        throw error;
    });
};

const constructRemovePayloads = function(data) {
    console.log('[Constructing Payloads] - START');
    console.log('[Constructing Payloads] - What is data?', data);
    var payloads = [];

    const dataEventCreator = new utils.dataEventConstructor();
    dataEventCreator.addObject('DISCUSSION', data.discussion.objectId.S, -1);

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
