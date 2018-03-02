'use strict';

const actions = {
    getUserById: require('../actions/getUserById.js'),
    createNotificationInfo: require('../actions/createNotificationInfo.js'),
    getAllAssociatedObjectsForObjectId: require('../actions/getAllAssociatedObjectsForObjectId.js'),
    aggregateUserIds: require('../actions/aggregateUserIds.js'),
    getChecklistById: require('../actions/getChecklistById.js'),
    getTaskById: require('../actions/getTaskById.js'),
    putUpdateField: require('../actions/putUpdateField.js')
};

const utils = {
    dataEventConstructor: require('../utils/dataEventConstructor.js')
};

const firebaseAdapter = require('../services/firebaseAdapter.js');
const massUpdate = firebaseAdapter.massUpdate;

module.exports = (params) => {
    const operation = params.operation;
    const checklistItem = params.objectInfo;

    switch(operation) {
        case 'MODIFY': {
            return handleModify(checklistItem);
        }

        case 'REMOVE': {
            return handleRemove(checklistItem);
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

const handleModify = function(checklistItem) {
    return gatherModifyData(checklistItem)

    .then((data) => {
        return constructModifyPayloads(data);
    })

    .then((payloads) => {
        return massUpdate(payloads);
    })

    .catch((error) => {
        console.log('Handling of Modify ChecklistItem Event FAILED', error);
        throw error;
    });
};

const handleRemove = function(checklistItem) {
    return gatherRemoveData(checklistItem)

    .then((data) => {
        return constructedRemovePayloads(data);
    })

    .then((payloads) => {
        return massUpdate(payloads);
    })

    .catch((error) => {
        console.log('Handling of Remove ChecklistItem Event FAILED', error);
        throw error;
    });
};

const gatherModifyData = function(checklistItem) {
    console.log('[Gather Data] - START');
    console.log('[Gather Data] - ChecklistItem', checklistItem);

    var data = {
        checklistItem: checklistItem
    };

    return actions.getChecklistById(checklistItem.checklistId.S)

    .then((result) => {
        data.checklist = result.iChecklist;
        console.log('[Gather Data] - Get checklist : SUCCESS');

        return Promise.all([
            actions.getAllAssociatedObjectsForObjectId({
                objectId: data.checklist.parentObjectId,
                associatedType: 'CHANNEL'
            }),
            actions.getAllAssociatedObjectsForObjectId({
                objectId: data.checklist.parentObjectId,
                associatedType: 'USER'
            }),
            actions.getTaskById(data.checklist.parentObjectId)
        ]);
    })

    .then((result) => {
        data.channelIds = result[0].associatedIds;
        data.userIds = result[1].associatedIds;
        data.task = result[2].iTask;
        console.log('[Gather Data] - Get all assigned channels : SUCCESS');

        return actions.aggregateUserIds({
            assignedChannelIds: data.channelIds,
            assignedUserIds: data.userIds
        });
    })

    .then((result) => {
        data.aggregatedUserIds = result.userIds;
        console.log('[Gather Data] - Aggregate all users for checklistItem : SUCCESS');
        console.log('[Gather Data] - END');

        return data;
    });
};

const constructModifyPayloads = function(data) {
    console.log('[Constructing Payloads] - START');
    console.log('[Constructing Payloads] - What is data?', data);
    var payloads = [];

    const dataEventCreator = new utils.dataEventConstructor();
    dataEventCreator.addObject('CHECKLIST_ITEM', data.checklistItem.objectId.S, data.checklistItem.updatedAt.N);
    dataEventCreator.addObject('CHECKLIST', data.checklist.objectId, data.checklist.updatedAt);
    dataEventCreator.addObject('TASK', data.task.objectId, data.task.updatedAt);

    payloads.push({
        targets: data.aggregatedUserIds,
        dataEvent: dataEventCreator.getDataEvent()
    });

    console.log('[Constructing Payloads] - Default payload constructed');

    return payloads;
};

const gatherRemoveData = function(checklistItem) {
    console.log('[Gather Data] - START');
    console.log('[Gather Data] - ChecklistItem', checklistItem);

    var data = {
        checklistItem: checklistItem
    };

    return actions.getChecklistById(checklistItem.checklistId.S)

    .then((result) => {
        data.checklist = result.iChecklist;
        console.log('[Gather Data] - Get checklist : SUCCESS');

        return Promise.all([
            actions.getAllAssociatedObjectsForObjectId({
                objectId: data.checklist.parentObjectId,
                associatedType: 'CHANNEL'
            }),
            actions.getAllAssociatedObjectsForObjectId({
                objectId: data.checklist.parentObjectId,
                associatedType: 'USER'
            }),
            actions.getTaskById(data.checklist.parentObjectId)
        ]);
    })

    .then((result) => {
        data.channelIds = result[0].associatedIds;
        data.userIds = result[1].associatedIds;
        data.task = result[2].iTask;
        console.log('[Gather Data] - Get all assigned channels : SUCCESS');

        return actions.aggregateUserIds({
            assignedChannelIds: data.channelIds,
            assignedUserIds: data.userIds
        });
    })

    .then((result) => {
        data.aggregatedUserIds = result.userIds;
        console.log('[Gather Data] - Aggregate all users for checklistItem : SUCCESS');
        console.log('[Gather Data] - END');

        return data;
    });
};

const constructedRemovePayloads = function(data) {
    console.log('[Constructing Payloads] - START');
    console.log('[Constructing Payloads] - What is data?', data);
    var payloads = [];

    const dataEventCreator = new utils.dataEventConstructor();
    dataEventCreator.addObject('CHECKLIST_ITEM', data.checklistItem.objectId.S, -1);
    dataEventCreator.addObject('CHECKLIST', data.checklist.objectId, data.checklist.updatedAt);
    dataEventCreator.addObject('TASK', data.task.objectId, data.task.updatedAt);

    payloads.push({
        targets: data.aggregatedUserIds,
        dataEvent: dataEventCreator.getDataEvent()
    });

    console.log('[Constructing Payloads] - Default payload constructed');

    return payloads;
};
