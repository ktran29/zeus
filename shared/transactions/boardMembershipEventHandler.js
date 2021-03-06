'use strict';

const actions = {
    getBoardById: require('../actions/getBoardById.js'),
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

//------------------------------------------------------------------------------
// Main
//------------------------------------------------------------------------------

module.exports = (params) => {
    const operation = params.operation;
    const membershipEntry = params.objectInfo;

    switch(operation) {
        case 'INSERT': {
            return handleInsert(membershipEntry);
        }

        case 'REMOVE': {
            return handleRemove(membershipEntry);
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

const handleInsert = function(membershipEntry) {
    return gatherInsertData(membershipEntry)

    .then((data) => {
        return constructInsertPayloads(data);
    })

    .then((payloads) => {
        return massUpdate(payloads);
    });
};

const handleRemove = function(membershipEntry) {
    return gatherRemoveData(membershipEntry)

    .then((data) => {
        return constructRemovePayloads(data);
    })

    .then((payloads) => {
        return massUpdate(payloads);
    });
};

//------------------------------------------------------------------------------
// Handle Insert
//------------------------------------------------------------------------------

const gatherInsertData = function(membershipEntry) {
    console.log('[Gather Data] - START');

    var data = {
        membershipEntry: membershipEntry
    };

    return actions.getUserById(membershipEntry.userId.S)

    .then((result) => {
        data.user = result.iUser;
        console.log('[Gather Data] - Get membershipEntry user : SUCCESS');
        return actions.getBoardById(membershipEntry.objectId.S);
    })

    .then((result) => {
        data.board = result.iBoard;
        console.log('[Gather Data] - Get designated board : SUCCESS');

        return actions.getAllUserIdMembershipsForObject({
            objectId: membershipEntry.objectId.S
        });
    })

    .then((result) => {
        data.boardUserIds = result.userIds;
        console.log('[Gather Data] - Get all users in board : SUCCESS');
        console.log('[Gather Data] - END');

        return data;
    });
};

const constructInsertPayloads = function(data) {
    console.log('[Constructing Payloads] - START');
    var payloads = [];

    const dataEventCreator = new utils.dataEventConstructor();
    dataEventCreator.addObject('USER', data.user.objectId, data.user.updatedAt);
    dataEventCreator.addObject('BOARD', data.board.objectId, data.board.updatedAt);

    console.log('[Constructing Payloads] - Default payload constructed');
    var defaultDataTargetIds = data.boardUserIds.filter((objectId) => objectId !== data.user.objectId) || [];

    payloads.push({
        targets: [data.user.objectId],
        dataEvent: dataEventCreator.getDataEvent()
    });

    return createInsertNotification(data.user, data.board, defaultDataTargetIds)

    .then((notification) => {

        console.log('[Constructing Payloads] - Notification constructed');

        var notificationId = notification.objectId;
        var updatedAt = notification.updatedAt;

        dataEventCreator.addObject('NOTIFICATION', notificationId, updatedAt);

        payloads.push({
            targets: defaultDataTargetIds,
            dataEvent: dataEventCreator.getDataEvent()
        });

        console.log('[Constructing Payloads] - END');
        return payloads;
    })

    .catch((error) => {
        console.log('[ConstructInsertPayloads] - FAILED', error);
        throw error;
    });

};

const createInsertNotification = function(user, board, targetIds) {
    var notification = new utils.notificationConstructor();

    notification.teamId = board.teamId;

    notification.setType('BOARD_NEW_MEMBER');
    notification.addToSubject('USER', user);
    notification.addToSubject('BOARD', board);

    return createNotification( {notification: notification, targetIds: targetIds} )

    .then((notification) => {
        return notification;
    });
};

//------------------------------------------------------------------------------
// Handle Remove
//------------------------------------------------------------------------------

const gatherRemoveData = function(membershipEntry) {
    console.log('[Gather Data] - START');

    var data = {
        membershipEntry: membershipEntry
    };

    return actions.getUserById(membershipEntry.userId.S)

    .then((result) => {
        data.user = result.iUser;
        console.log('[Gather Data] - Get membershipEntry user : SUCCESS');
        return actions.getBoardById(membershipEntry.objectId.S);
    })

    .catch(() => {
        console.log('[Gather Data] - Board no longer exists');
        console.log('[Gather Data] - Get designated board : FAIL');
    })

    .then((result) => {
        if(result) {
            data.board = result.iBoard;
            console.log('[Gather Data] - Get designated board : SUCCESS');
        }

        return actions.getAllUserIdMembershipsForObject({
            objectId: membershipEntry.objectId.S
        });
    })

    .then((result) => {
        data.boardUserIds = result.userIds;
        console.log('[Gather Data] - Get all users in board : SUCCESS');
        console.log('[Gather Data] - END');

        return data;
    });
};

const constructRemovePayloads = function(data) {
    console.log('[Constructing Payloads] - START');
    var payloads = [];
    if(data.board) {
        const dataEventCreator = new utils.dataEventConstructor();
        dataEventCreator.addObject('USER', data.user.objectId, Date.now());
        dataEventCreator.addObject('BOARD', data.board.objectId, data.board.updatedAt);

        var defaultDataTargetIds = data.boardUserIds.filter((objectId) => objectId !== data.user.objectId) || [];

        payloads.push({
            targets: [data.user.objectId],
            dataEvent: dataEventCreator.getDataEvent()
        });

        payloads.push({
            targets: defaultDataTargetIds,
            dataEvent: dataEventCreator.getDataEvent()
        });

        console.log('[Constructing Payloads] - Payloads constructed');
        console.log('[Constructing Payloads] - END');
    } else {
        console.log('[Constructing Payloads] - No users left in board');
        console.log('[Constructing Payloads] - END');
    }

    return payloads;
};
