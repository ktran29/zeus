'use strict';

const actions = {
    getUserById: require('../actions/getUserById.js'),
    aggregateUserIds: require('../actions/aggregateUserIds.js'),
    getCommentThreadById: require('../actions/getCommentThreadById.js'),
    getTaskById: require('../actions/getTaskById.js'),
    getDiscussionById: require('../actions/getDiscussionById.js'),
    createNotificationInfo: require('../actions/createNotificationInfo.js'),
    getAllAssociatedObjectsForObjectId: require('../actions/getAllAssociatedObjectsForObjectId.js'),
    putUpdateField: require('../actions/putUpdateField.js')
};

const utils = {
    notificationConstructor: require('../utils/notificationConstructor.js'),
    dataEventConstructor: require('../utils/dataEventConstructor.js'),
};

const createNotification = require('../transactions/createNotification.js');

const firebaseAdapter = require('../services/firebaseAdapter.js');
const massUpdate = firebaseAdapter.massUpdate;
const _ = require('lodash');

module.exports = (params) => {
    const operation = params.operation;
    const comment = params.objectInfo;

    switch(operation) {
        case 'INSERT': {
            return handleInsert(comment);
        }

        case 'REMOVE': {
            return handleRemove(comment);
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

const handleInsert = function(comment) {
    return gatherInsertData(comment)

    .then((data) => {
        return constructInsertPayloads(data);
    })

    .then((payloads) => {
        return massUpdate(payloads);
    })

    .catch((error) => {
        console.log('Handling of Insert Comment Event FAILED', error);
        throw error;
    });
};

const handleRemove = function(comment) {
    return gatherRemoveData(comment)

    .then((data) => {
        return constructRemovePayloads(data);
    })

    .then((payloads) => {
        return massUpdate(payloads);
    })

    .catch((error) => {
        console.log('Handling of Remove Comment Event FAILED', error);
        throw error;
    });
};

//------------------------------------------------------------------------------
// Insert helper functions
//------------------------------------------------------------------------------

const gatherInsertData = function(comment) {
    console.log('[Gather Data] - START');

    var data = {
        comment: comment
    };

    return actions.getCommentThreadById(data.comment.commentThreadId.S)

    .then((result) => {
        data.commentThread = result.iCommentThread;
        data.parentObjectType = data.commentThread.parentObjectType;
        data.parentObjectId = data.commentThread.parentObjectId;

        console.log('[Gather Data] - Get commentThread SUCCESS', data.commentThread.parentObjectType);

        if (data.parentObjectType === 'TASK') {
            return actions.getTaskById(data.commentThread.parentObjectId);
        } else if (data.parentObjectType === 'DISCUSSION') {
            return actions.getDiscussionById(data.commentThread.parentObjectId);
        } else {
            console.log('[Gather Data] - This commentThread has an invalid parentObjectType:', data.commentThread.parentObjectType);
            return Promise.reject();
        }
    })

    .then((result) => {
        console.log('[Gather Data] - Got the parent object of type:', data.commentThread.parentObjectType);

        if (data.parentObjectType === 'TASK') {
            data.parentObject = result.iTask;
        } else {
            data.parentObject = result.iDiscussion;
        }

        return actions.getUserById(comment.authorId.S);
    })

    .then((result) => {
        data.author = result.iUser;
        console.log('[Gather Data] - Got the author:', data.commentThread.parentObjectType);

        return Promise.all([
            actions.getAllAssociatedObjectsForObjectId({ objectId: data.parentObject.objectId, associatedType: 'CHANNEL' }),
            actions.getAllAssociatedObjectsForObjectId({ objectId: data.parentObject.objectId, associatedType: 'USER' })
        ]);
    })

    .then((result) => {
        console.log('[Gather Data] - Users associated:', result[1]);
        console.log('[Gather Data] - Channels associated:', result[0]);
        data.userIds = result[1].associatedIds;
        return actions.aggregateUserIds({ assignedChannelIds: result[0].associatedIds });
    })

    .then((result) => {
        console.log('[Gather Data] - What are the results of aggregation?', result);
        data.userIds =  _.uniq(data.userIds.concat(result.userIds));

        console.log('[Gather Data] - What is userIds:', data.userIds);
        console.log('[Gather Data] - Aggregated all users assigned and tagged!');
        console.log('[Gather Data] - END');
        return data;
    })

    .catch((error) => {
        console.log('[Gater Data] - FAILED.', error);
        throw error;
    });
};

const constructInsertPayloads = function(data) {
    console.log('[Constructing Payloads] - START');
    var payloads = [];

    const dataEventCreator = new utils.dataEventConstructor();
    dataEventCreator.addObject('COMMENT', data.comment.objectId.S, parseInt(data.comment.updatedAt.N));
    dataEventCreator.addObject('COMMENT_THREAD', data.commentThread.objectId, data.commentThread.updatedAt);
    dataEventCreator.addObject(data.parentObjectType, data.parentObject.objectId, data.parentObject.updatedAt);

    console.log('[Constructing Payloads] - Default payload constructed');
    var defaultDataTargetIds = data.userIds.filter((objectId) => objectId !== data.author.objectId) || [];

    payloads.push({
        targets: [data.author.objectId],
        dataEvent: dataEventCreator.getDataEvent()
    });

    return createInsertNotification(data, defaultDataTargetIds)

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
    })

    .catch((error) => {
        console.log('[ConstructInsertPayloads] - FAILED', error);
        throw error;
    });
};

const createInsertNotification = function(data, targetIds) {
    var notification = new utils.notificationConstructor();

    var commentNotifShort = {
        updatedAt: parseInt(data.comment.updatedAt.N),
        createdAt: parseInt(data.comment.updatedAt.N),
        text: data.comment.commentText.S
    };

    var parentNotifShort = {
        updatedAt: data.parentObject.updatedAt,
        createdAt: data.parentObject.createdAt
    };

    if (data.parentObjectType === 'TASK') {
        notification.setType('TASK_COMMENT_NEW');
        parentNotifShort.text = data.parentObject.itemtext;
        notification.addToSubject('TASK', parentNotifShort);
    } else {
        notification.setType('DISCUSSION_COMMENT_NEW');
        parentNotifShort.text = data.parentObject.title;
        notification.addToSubject('DISCUSSION', parentNotifShort);
    }

    notification.teamId = data.parentObject.teamId.S;

    notification.addActor(data.author);
    notification.addToSubject('COMMENT', commentNotifShort);

    console.log('What is inside this notification?', notification);

    return createNotification( {notification: notification, targetIds: targetIds} )

    .then((notification) => {
        return notification;
    })

    .catch((error) => {
        console.log('[CreateInsertNotification] - FAILED', error);
        throw error;
    });
};

const gatherRemoveData = function(comment) {
    console.log('[Gather Data] - START');

    var data = {
        comment: comment
    };

    return actions.getCommentThreadById(data.comment.commentThreadId.S)

    .then((result) => {
        data.commentThread = result.iCommentThread;
        data.parentObjectType = data.commentThread.parentObjectType;
        data.parentObjectId = data.commentThread.parentObjectId;

        console.log('[Gather Data] - Get commentThread SUCCESS', data.commentThread.parentObjectType);

        if (data.parentObjectType === 'TASK') {
            return actions.getTaskById(data.commentThread.parentObjectId);
        } else if (data.parentObjectType === 'DISCUSSION') {
            return actions.getDiscussionById(data.commentThread.parentObjectId);
        } else {
            console.log('[Gather Data] - This commentThread has an invalid parentObjectType:', data.commentThread.parentObjectType);
            return Promise.reject();
        }
    })

    .then((result) => {
        console.log('[Gather Data] - Got the parent object of type:', data.commentThread.parentObjectType);

        if (data.parentObjectType === 'TASK') {
            data.parentObject = result.iTask;
        } else {
            data.parentObject = result.iDiscussion;
        }

        return actions.getUserById(comment.authorId.S);
    })

    .then((result) => {
        data.author = result.iUser;
        console.log('[Gather Data] - Got the author:', data.commentThread.parentObjectType);

        return Promise.all([
            actions.getAllAssociatedObjectsForObjectId({ objectId: data.parentObject.objectId, associatedType: 'CHANNEL' }),
            actions.getAllAssociatedObjectsForObjectId({ objectId: data.parentObject.objectId, associatedType: 'USER' })
        ]);
    })

    .then((result) => {
        console.log('[Gather Data] - Users associated:', result[1]);
        console.log('[Gather Data] - Channels associated:', result[0]);
        data.userIds = result[1].associatedIds;
        return actions.aggregateUserIds({ assignedChannelIds: result[0].associatedIds });
    })

    .then((result) => {
        console.log('[Gather Data] - What are the results of aggregation?', result);
        data.userIds =  _.uniq(data.userIds.concat(result.userIds));

        console.log('[Gather Data] - What is userIds:', data.userIds);
        console.log('[Gather Data] - Aggregated all users assigned and tagged!');
        console.log('[Gather Data] - END');
        return data;
    })

    .catch((error) => {
        console.log('[Gater Data] - FAILED.', error);
        throw error;
    });
};

const constructRemovePayloads = function(data) {
    console.log('[Constructing Payloads] - START');
    var payloads = [];

    const dataEventCreator = new utils.dataEventConstructor();
    dataEventCreator.addObject('COMMENT', data.comment.objectId.S, -1);
    dataEventCreator.addObject('COMMENT_THREAD', data.commentThread.objectId, data.commentThread.updatedAt);
    dataEventCreator.addObject(data.parentObjectType, data.parentObject.objectId, data.parentObject.updatedAt);

    var defaultDataTargetIds = data.userIds.filter((objectId) => objectId !== data.author.objectId);

    payloads.push({
        targets: [data.author.objectId],
        dataEvent: dataEventCreator.getDataEvent()
    });

    payloads.push({
        targets: defaultDataTargetIds,
        dataEvent: dataEventCreator.getDataEvent()
    });

    console.log('[Constructing Payloads] - Payloads constructed');
    console.log('[Constructing Payloads] - END');

    return payloads;

};
