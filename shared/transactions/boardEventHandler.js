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
    const board = params.objectInfo;

    switch(operation) {
        case 'INSERT': {
            return handleInsert(board);
        }

        case 'MODIFY': {
            return handleModify(board);
        }

        case 'REMOVE': {
            return handleRemove(board);
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

const handleInsert = function(board) {
    return gatherInsertData(board)

    .then((data) => {
        return constructInsertPayloads(data);
    })

    .then((payloads) => {
        return massUpdate(payloads);
    });
};

const handleModify = function(board) {
    return gatherModifyData(board)

    .then((data) => {
        return constructModifyPayloads(data);
    })

    .then((payloads) => {
        return massUpdate(payloads);
    });
};

const handleRemove = function(board) {
    return gatherRemoveData(board)

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

const gatherInsertData = function(board) {
    console.log('[Gather Data] - START');

    var data = {
        board: board
    };

    return actions.getAllUserIdMembershipsForObject({
        objectId: board.teamId.S
    })

    .then((result) => {
        data.userIds = result.userIds;
        console.log('[Gather Data] - Get all team members : SUCCESS');

        return actions.getUserById(board.creatorId.S);
    })

    .then((result) => {
        data.sender = result.iUser;
        console.log('[Gather Data] - Get board creator : SUCCESS');

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
    dataEventCreator.addObject('BOARD', data.board.objectId.S, data.board.updatedAt.N);

    payloads.push({
        targets: [data.sender.objectId],
        dataEvent: dataEventCreator.getDataEvent()
    });

    console.log('[Constructing Payloads] - Default payload constructed');
    var defaultDataTargetIds = data.userIds.filter((objectId) => objectId !== data.sender.objectId);

    return createInsertNotification(data.board, data.sender, defaultDataTargetIds)

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

const createInsertNotification = function(board, sender, targetIds) {
    var notification = new utils.notificationConstructor();

    var boardNotifShort = {
        updatedAt: board.updatedAt.N,
        createdAt: board.createdAt.N,
        name: board.name.S
    };

    notification.teamId = board.teamId.S;

    notification.setType('BOARD_NEW');
    notification.addActor(sender);
    notification.addToSubject('BOARD', boardNotifShort);

    return createNotification( {notification: notification, targetIds: targetIds} )

    .then((notification) => {
        return notification;
    });
};

//------------------------------------------------------------------------------
// Modify helper functions
//------------------------------------------------------------------------------

const gatherModifyData = function(board) {
    console.log('[Gather Data] - START');

    var data = {
        board: board
    };

    return actions.getAllUserIdMembershipsForObject({
        objectId: board.objectId.S
    })

    .then((result) => {
        data.userIds = result.userIds;
        console.log('[Gather Data] - Get all board members : SUCCESS');

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
    dataEventCreator.addObject('BOARD', data.board.objectId.S, data.board.updatedAt.N);

    payloads.push({
        targets: data.userIds,
        dataEvent: dataEventCreator.getDataEvent()
    });

    console.log('[Constructing Payloads] - Default payload constructed');
    console.log('[Constructing Payloads] - END');

    return payloads;
};

//------------------------------------------------------------------------------
// Remove helper functions
//------------------------------------------------------------------------------

const gatherRemoveData = function(board) {
    console.log('[Gather Data] - START');

    var data = {
        board: board
    };

    return actions.getAllUserIdMembershipsForObject({
        objectId: board.teamId.S
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
    dataEventCreator.addObject('BOARD', data.board.objectId.S, -1);

    payloads.push({
        targets: data.userIds,
        dataEvent: dataEventCreator.getDataEvent()
    });

    console.log('[Constructing Payloads] - Default payload constructed');

    console.log('[Constructing Payloads] - END');

    return payloads;
};
