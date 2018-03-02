'use strict';

const actions = {
    getAllUserIdMembershipsForObject: require('../actions/getAllUserIdMembershipsForObject.js')
};

const utils = {
    notificationConstructor: require('../utils/notificationConstructor.js'),
    dataEventConstructor: require('../utils/dataEventConstructor.js'),
};

const firebaseAdapter = require('../services/firebaseAdapter.js');
const massUpdate = firebaseAdapter.massUpdate;

module.exports = (params) => {
    const operation = params.operation;
    const team = params.objectInfo;

    switch(operation) {

        case 'MODIFY': {
            return handleModify(team);
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

const handleModify = function(team) {
    return gatherModifyData(team)

    .then((data) => {
        return constructModifyPayloads(data);
    })

    .then((payloads) => {
        return massUpdate(payloads);
    });
};

//------------------------------------------------------------------------------
// Modify helper functions
//------------------------------------------------------------------------------

const gatherModifyData = function(team) {
    console.log('[Gather Data] - START');

    var data = {
        team: team
    };

    return actions.getAllUserIdMembershipsForObject({
        objectId: team.objectId.S
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

const constructModifyPayloads = function(data) {
    console.log('[Constructing Payloads] - START');
    var payloads = [];

    const dataEventCreator = new utils.dataEventConstructor();
    dataEventCreator.addObject('TEAM', data.team.objectId.S, data.team.updatedAt.N);

    payloads.push({
        targets: data.userIds,
        dataEvent: dataEventCreator.getDataEvent()
    });

    console.log('[Constructing Payloads] - Default payload constructed');
    console.log('[Constructing Payloads] - END');

    return payloads;
};
