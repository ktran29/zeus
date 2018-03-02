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
    const task = params.objectInfo;

    switch(operation) {
        case 'INSERT': {
            return handleInsert(task);
        }

        case 'REMOVE': {
            return handleInsert(task);
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

const handleInsert = function(task) {
    return gatherInsertData(task)

    .then((data) => {
        return constructInsertPayloads(data);
    })

    .then((payloads) => {
        return massUpdate(payloads);
    });
};

const handleRemove = function(task) {
    return gatherRemoveData(task)

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

const gatherInsertData = function(task) {
    console.log('[Gather Data] - START');
    console.log('[Gather Data] - Task', task);

    var data = {
        task: task
    };

    return Promise.all([
        actions.getAllAssociatedObjectsForObjectId({
            objectId: task.objectId.S,
            associatedType: 'CHANNEL'
        }),
        actions.getAllAssociatedObjectsForObjectId({
            objectId: task.objectId.S,
            associatedType: 'USER'
        })
    ])

    .then((result) => {
        data.channelIds = result[0].associatedIds;
        data.userIds = result[1].associatedIds;
        console.log('[Gather Data] - Get all assigned channels : SUCCESS');

        return actions.getUserById(task.creatorId.S);
    })

    .then((result) => {
        data.sender = result.iUser;
        console.log('[Gather Data] - Get task sender : SUCCESS');

        return actions.aggregateUserIds({
            assignedChannelIds: data.channelIds,
            assignedUserIds: data.userIds
        });
    })

    .then((result) => {
        data.aggregatedUserIds = result.userIds;
        console.log('[Gather Data] - Aggregate all users for task : SUCCESS');
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
    dataEventCreator.addObject('TASK', data.task.objectId.S, data.task.updatedAt.N);

    payloads.push({
        targets: [data.sender.objectId],
        dataEvent: dataEventCreator.getDataEvent()
    });

    console.log('[Constructing Payloads] - Default payload constructed');
    var defaultDataTargetIds = data.aggregatedUserIds.filter((objectId) => objectId !== data.sender.objectId);

    return createInsertNotification(data.task, data.sender, defaultDataTargetIds)

    .then((notificationInfo) => {
        var notificationId = notificationInfo.notificationId;
        var updatedAt = notificationInfo.updatedAt;

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

const createInsertNotification = function(task, sender, targetIds) {
    var notification = new utils.notificationConstructor();

    var taskNotifShort = {
        updatedAt: task.updatedAt.N,
        createdAt: task.createdAt.N,
        text: task.description.S
    };

    notification.setType('TASK_NEW');
    notification.addActor(sender);
    notification.addToSubject('TASK', taskNotifShort);

    return createNotification( {notification: notification, targetIds: targetIds} )

    .then((notification) => {
        return notification;
    });
};

//------------------------------------------------------------------------------
// Insert helper functions
//------------------------------------------------------------------------------

const gatherRemoveData = function(task) {
    console.log('[Gather Data] - START');
    console.log('[Gather Data] - Task', task);

    var data = {
        task: task
    };

    return Promise.all([
        actions.getAllAssociatedObjectsForObjectId({
            objectId: task.objectId.S,
            associatedType: 'CHANNEL'
        }),
        actions.getAllAssociatedObjectsForObjectId({
            objectId: task.objectId.S,
            associatedType: 'USER'
        })
    ])

    .then((result) => {
        data.channelIds = result[0].associatedIds;
        data.userIds = result[1].associatedIds;
        console.log('[Gather Data] - Get all assigned channels : SUCCESS');

        return actions.getUserById(task.creatorId.S);
    })

    .then((result) => {
        data.sender = result.iUser;
        console.log('[Gather Data] - Get task sender : SUCCESS');

        return actions.aggregateUserIds({
            assignedChannelIds: data.channelIds,
            assignedUserIds: data.userIds
        });
    })

    .then((result) => {
        data.aggregatedUserIds = result.userIds;
        console.log('[Gather Data] - Aggregate all users for task : SUCCESS');
        console.log('[Gather Data] - END');

        return data;
    });
};

const constructRemovePayloads = function(data) {
    console.log('[Constructing Payloads] - START');
    console.log('[Constructing Payloads] - What is data?', data);
    var payloads = [];

    const dataEventCreator = new utils.dataEventConstructor();
    dataEventCreator.addObject('TASK', data.task.objectId.S, -1);

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
