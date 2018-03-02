'use strict';

const actions = {
    getTeamById: require('../actions/getTeamById.js'),
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
        return actions.getTeamById(membershipEntry.objectId.S);
    })

    .then((result) => {
        data.team = result.iTeam;
        console.log('[Gather Data] - Get designated team : SUCCESS');

        return actions.getAllUserIdMembershipsForObject({
            objectId: membershipEntry.objectId.S
        });
    })

    .then((result) => {
        data.teamUserIds = result.userIds;
        console.log('[Gather Data] - Get all users in team : SUCCESS');
        console.log('[Gather Data] - END');

        return data;
    });
};

const constructInsertPayloads = function(data) {
    console.log('[Constructing Payloads] - START');
    var payloads = [];

    const dataEventCreator = new utils.dataEventConstructor();
    dataEventCreator.addObject('USER', data.user.objectId, data.user.updatedAt);
    dataEventCreator.addObject('TEAM', data.team.objectId, data.team.updatedAt);

    console.log('[Constructing Payloads] - Default payload constructed');
    var defaultDataTargetIds = data.teamUserIds.filter((objectId) => objectId !== data.user.objectId) || [];

    payloads.push({
        targets: [data.user.objectId],
        dataEvent: dataEventCreator.getDataEvent()
    });

    return createInsertNotification(data.user, data.team, defaultDataTargetIds)

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

const createInsertNotification = function(user, team, targetIds) {
    var notification = new utils.notificationConstructor();

    notification.teamId = team.teamId;

    notification.setType('TEAM_NEW_MEMBER');
    notification.addToSubject('USER', user);
    notification.addToSubject('TEAM', team);

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
        return actions.getTeamById(membershipEntry.objectId.S);
    })

    .catch(() => {
        console.log('[Gather Data] - Team no longer exists');
        console.log('[Gather Data] - Get designated team : FAIL');
    })

    .then((result) => {
        if(result) {
            data.team = result.iTeam;
            console.log('[Gather Data] - Get designated team : SUCCESS');
        }

        return actions.getAllUserIdMembershipsForObject({
            objectId: membershipEntry.objectId.S
        });
    })

    .then((result) => {
        data.teamUserIds = result.userIds;
        console.log('[Gather Data] - Get all users in team : SUCCESS');
        console.log('[Gather Data] - END');

        return data;
    });
};

const constructRemovePayloads = function(data) {
    console.log('[Constructing Payloads] - START');
    var payloads = [];
    if(data.team) {
        const dataEventCreator = new utils.dataEventConstructor();
        dataEventCreator.addObject('USER', data.user.objectId, Date.now());
        dataEventCreator.addObject('TEAM', data.team.objectId, data.team.updatedAt);

        var defaultDataTargetIds = data.teamUserIds.filter((objectId) => objectId !== data.user.objectId) || [];

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
        console.log('[Constructing Payloads] - No users left in team');
        console.log('[Constructing Payloads] - END');
    }

    return payloads;
};
