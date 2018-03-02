'use strict';

const actions = {
    getUserById: require('../actions/getUserById.js'),
    getAllUserIdMembershipsForObject: require('../actions/getAllUserIdMembershipsForObject.js')
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
    const channel = params.objectInfo;

    switch(operation) {
        case 'INSERT': {
            return handleInsert(channel);
        }

        case 'MODIFY': {
            return handleModify(channel);
        }

        case 'REMOVE': {
            return handleRemove(channel);
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

const handleInsert = function(channel) {
    return gatherInsertData(channel)

    .then((data) => {
        return constructInsertPayloads(data);
    })

    .then((payloads) => {
        return massUpdate(payloads);
    });
};

const handleModify = function(channel) {
    return gatherModifyData(channel)

    .then((data) => {
        return constructModifyPayloads(data);
    })

    .then((payloads) => {
        return massUpdate(payloads);
    });
};

const handleRemove = function(channel) {
    return gatherRemoveData(channel)

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

const gatherInsertData = function(channel) {
    console.log('[Gather Data] - START');

    var data = {
        channel: channel
    };

    return actions.getAllUserIdMembershipsForObject({
        objectId: channel.teamId.S
    })

    .then((result) => {
        data.userIds = result.userIds;
        console.log('[Gather Data] - Get all team members : SUCCESS');

        return actions.getUserById(channel.creatorId.S);
    })

    .then((result) => {
        data.sender = result.iUser;
        console.log('[Gather Data] - Get channel creator : SUCCESS');

        return data;
    })

    .catch((error) => {
        console.log('[Gather Data] - FAILED', error);
        throw error;
    });
};

const constructInsertPayloads = function(data) {
    console.log('[Constructing Payloads] - START');
    var payloads = [];

    const dataEventCreator = new utils.dataEventConstructor();
    dataEventCreator.addObject('CHANNEL', data.channel.objectId.S, data.channel.updatedAt.N);

    payloads.push({
        targets: [data.sender.objectId],
        dataEvent: dataEventCreator.getDataEvent()
    });

    console.log('[Constructing Payloads] - Default payload constructed');
    var defaultDataTargetIds = data.userIds.filter((objectId) => objectId !== data.sender.objectId);

    return createInsertNotification(data.channel, data.sender, defaultDataTargetIds)

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

const createInsertNotification = function(channel, sender, targetIds) {
    var notification = new utils.notificationConstructor();

    var channelNotifShort = {
        updatedAt: channel.updatedAt.N,
        createdAt: channel.createdAt.N,
        name: channel.name.S
    };

    notification.teamId = channel.teamId.S;

    notification.setType('CHANNEL_NEW');
    notification.addActor(sender);
    notification.addToSubject('CHANNEL', channelNotifShort);

    return createNotification( {notification: notification, targetIds: targetIds} )

    .then((notification) => {
        return notification;
    });
};

//------------------------------------------------------------------------------
// Modify helper functions
//------------------------------------------------------------------------------

const gatherModifyData = function(channel) {
    console.log('[Gather Data] - START');

    var data = {
        channel: channel
    };

    return actions.getAllUserIdMembershipsForObject({
        objectId: channel.objectId.S
    })

    .then((result) => {
        data.userIds = result.userIds;
        console.log('[Gather Data] - Get all channel members : SUCCESS');

        return data;
    })

    .catch((error) => {
        console.log('[Gather Data] - FAILED', error);
        throw error;
    });
};

const constructModifyPayloads = function(data) {
    console.log('[Constructing Payloads] - START');
    var payloads = [];

    const dataEventCreator = new utils.dataEventConstructor();
    dataEventCreator.addObject('CHANNEL', data.channel.objectId.S, data.channel.updatedAt.N);

    payloads.push({
        targets: data.userI,
        dataEvent: dataEventCreator.getDataEvent()
    });

    console.log('[Constructing Payloads] - Default payload constructed');
    console.log('[Constructing Payloads] - END');

    return payloads;
};

//------------------------------------------------------------------------------
// Remove helper functions
//------------------------------------------------------------------------------

const gatherRemoveData = function(channel) {
    console.log('[Gather Data] - START');

    var data = {
        channel: channel
    };

    return actions.getAllUserIdMembershipsForObject({
        objectId: channel.teamId.S
    })

    .then((result) => {
        data.userIds = result.userIds;
        console.log('[Gather Data] - Get all team members : SUCCESS');

        return data;
    })

    .catch((error) => {
        console.log('[Gather Data] - FAILED', error);
        throw error;
    });
};

const constructRemovePayloads = function(data) {
    console.log('[Constructing Payloads] - START');
    var payloads = [];

    const dataEventCreator = new utils.dataEventConstructor();
    dataEventCreator.addObject('CHANNEL', data.channel.objectId.S, -1);

    payloads.push({
        targets: data.userIds,
        dataEvent: dataEventCreator.getDataEvent()
    });

    console.log('[Constructing Payloads] - Default payload constructed');

    console.log('[Constructing Payloads] - END');

    return payloads;
};
