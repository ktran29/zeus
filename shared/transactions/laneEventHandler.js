'use strict';

const actions = {
    getLaneById: require('../actions/getLaneById.js'),
    getBoardById: require('../actions/getBoardById.js'),
    getUserById: require('../actions/getUserById.js'),
    getAllUserIdMembershipsForObject: require('../actions/getAllUserIdMembershipsForObject')
};

const utils = {
    dataEventConstructor: require('../utils/dataEventConstructor.js')
};

const firebaseAdapter = require('../services/firebaseAdapter.js');
const massUpdate = firebaseAdapter.massUpdate;

module.exports = (params) => {
    const operation = params.operation;
    const lane = params.objectInfo;

    console.log('What is objectinfo?', lane);

    switch(operation) {
        case 'INSERT': {
            return handleInsert(lane);
        }

        case 'MODIFY': {
            return handleModify(lane);
        }

        case 'REMOVE': {
            return handleRemove(lane);
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

const handleModify = function(lane) {
    return gatherModifyData(lane)

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

const gatherInsertData = function(lane) {
    console.log('[Gather Data] - START');
    console.log('[Gather Data] - Lane', lane);

    var data = {
        lane: lane
    };

    return actions.getBoardById(data.lane.boardId.S)

    .then((result) => {
        data.board = result.iBoard;
        console.log('[Gather Data] - Get board : SUCCESS');

        return actions.getAllUserIdMembershipsForObject({
            objectId: data.board.objectId
        });
    })

    .then((result) => {
        data.userIds = result.userIds;
        console.log('[Gather Data] - Retrieve all users in board : SUCCESS');
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
    var payloads = [];

    const dataEventCreator = new utils.dataEventConstructor();
    dataEventCreator.addObject('LANE', data.lane.objectId.S, data.lane.updatedAt.N);
    dataEventCreator.addObject('BOARD', data.board.objectId, data.board.updatedAt);

    var defaultDataTargetIds = data.userIds;

    payloads.push({
        targets: defaultDataTargetIds,
        dataEvent: dataEventCreator.getDataEvent()
    });

    console.log('[Constructing Payloads] - Default payload constructed');

    console.log('[Constructing Payloads] - END');

    return payloads;
};

//------------------------------------------------------------------------------
// Modify helper functions
//------------------------------------------------------------------------------

const gatherModifyData = function(lane) {
    console.log('[Gather Data] - START');
    console.log('[Gather Data] - Lane', lane);

    var data = {
        lane: lane
    };

    return actions.getBoardById(data.lane.boardId.S)

    .then((result) => {
        data.board = result.iBoard;
        console.log('[Gather Data] - Get board : SUCCESS');

        return actions.getAllUserIdMembershipsForObject({
            objectId: data.board.objectId
        });
    })

    .then((result) => {
        data.userIds = result.userIds;
        console.log('[Gather Data] - Retrieve all users in board : SUCCESS');
        console.log('[Gather Data] - END');

        return data;
    })

    .catch((error) => {
        console.log('[Gather Data] - FAILED', error);
        throw error;
    });
};

const constructModifyPayloads = function(data) {
    console.log('[Constructing Payloads] - START');
    console.log('[Constructing Payloads] - What is data?', data);
    var payloads = [];

    const dataEventCreator = new utils.dataEventConstructor();
    dataEventCreator.addObject('LANE', data.lane.objectId.S, data.lane.updatedAt.N);

    var defaultDataTargetIds = data.userIds;

    payloads.push({
        targets: defaultDataTargetIds,
        dataEvent: dataEventCreator.getDataEvent()
    });

    console.log('[Constructing Payloads] - Payloads constructed');
    console.log('[Constructing Payloads] - END');

    return payloads;
};

//------------------------------------------------------------------------------
// Remove helper functions
//------------------------------------------------------------------------------

const gatherRemoveData = function(lane) {
    console.log('[Gather Data] - START');
    console.log('[Gather Data] - Lane', lane);

    var data = {
        lane: lane
    };

    return actions.getBoardById(data.lane.boardId.S)

    .then((result) => {
        data.board = result.iBoard;
        console.log('[Gather Data] - Get board : SUCCESS');

        return actions.getAllUserIdMembershipsForObject({
            objectId: data.board.objectId
        });
    })

    .then((result) => {
        data.userIds = result.userIds;
        console.log('[Gather Data] - Retrieve all users in board : SUCCESS');
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
    var payloads = [];

    const dataEventCreator = new utils.dataEventConstructor();
    dataEventCreator.addObject('BOARD',data.board.objectId, data.board.updatedAt);
    dataEventCreator.addObject('LANE', data.lane.objectId.S, -1);

    payloads.push({
        targets: data.userIds,
        dataEvent: dataEventCreator.getDataEvent()
    });

    console.log('[Constructing Payloads] - Default payload constructed');

    console.log('[Constructing Payloads] - END');

    return payloads;
};
