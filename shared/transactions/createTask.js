'use strict';

const _ = require('lodash');

const actions = {
    createTask: require('../actions/createTask.js'),
    createCommentThread: require('../actions/createCommentThread.js'),
    createChecklist: require('../actions/createChecklist.js'),
    createChecklistItem: require('../actions/createChecklistItem.js'),
    getTaskById: require('./getTaskById.js'),
    getChecklistById: require('../actions/getChecklistById.js'),
    getChecklistItemById: require('../actions/getChecklistItemById.js'),
    getCommentThreadById: require('../actions/getCommentThreadById.js'),
    putUpdateField: require('../actions/putUpdateField.js'),
    createAssignedAEObject: require('../actions/createAssignedAEObject.js'),
    createChannelAEObject: require('../actions/createChannelAEObject.js'),
    createUnseenAEObject: require('../actions/createUnseenAEObject.js'),
    aggregateUserIds: require('../actions/aggregateUserIds.js'),
    getTasksInLane: require('../actions/getTasksInLane.js'),
    getAllUserIdMembershipsForObject: require('../actions/getAllUserIdMembershipsForObject.js')
};

const generateUniqueIdentifier = require('../utils/generateUniqueIdentifier');

module.exports = (params) => {

    //extract parameters
    const assignedChannelIds = params.assignedChannelIds;
    const assignedUserIds = params.assignedUserIds;
    const boardId = params.boardId;
    const checklistItemTexts = params.checklistItemTexts;
    const creatorId = params.creatorId;
    const description = params.description;
    const dueDate = params.dueDate;
    const laneId = params.laneId;
    const titleText = params.titleText;
    const teamId = params.teamId;
    const taggedChannelIds = params.taggedChannelIds;

    const taskId = generateUniqueIdentifier();
    const now = Date.now();

    var commentThreadId;
    var checklistId;
    var checklistItemIds;

    return Promise.all([
        actions.createCommentThread({
            parentObjectId: taskId,
            parentObjectType: 'TASK'
        }),
        actions.createChecklist(taskId)
    ])

    .then((result) => {

        commentThreadId = result[0].iCommentThread.objectId;
        checklistId = result[1].iChecklist.objectId;

        const createChecklistItemsFromTexts = Promise.all(checklistItemTexts.map((checklistItemText, index) => {
            return actions.createChecklistItem({
                description: checklistItemText,
                index: index,
                checklistId: checklistId
            });
        }));

        const getChannelUserIds = Promise.all(assignedChannelIds.map((assignedChannelId) => {
            return actions.getAllUserIdMembershipsForObject({
                objectId: assignedChannelId
            });
        }));

        return Promise.all([
            getChannelUserIds,
            createChecklistItemsFromTexts
        ]);
    })

    .then((result) => {

        const channelUserIds = result[0];
        var collapsedUserIds = [];
        channelUserIds.forEach((userIds) => {
            collapsedUserIds = collapsedUserIds.concat(userIds.userIds);
        });
        collapsedUserIds = _.uniq(collapsedUserIds.concat(assignedUserIds));
        checklistItemIds = result[1].map(checklistItemObject => checklistItemObject.iChecklistItemId);

        const createUserAEObjects = Promise.all(collapsedUserIds.map((userId) => {
            return actions.createAssignedAEObject({
                objectId: taskId,
                associatedId: userId,
                associatedType: 'USER',
                objectType: 'TASK',
                sortDate: dueDate
            });
        }));

        const createAssignedChannelAEObjects = Promise.all(assignedChannelIds.map((assignedChannelId) => {
            return actions.createAssignedAEObject({
                objectId: taskId,
                associatedId: assignedChannelId,
                associatedType: 'CHANNEL',
                objectType: 'TASK',
                sortDate: dueDate
            });
        }));

        const createTaggedChannelAEObjects = Promise.all(taggedChannelIds.map((taggedChannelId) => {
            return actions.createChannelAEObject({
                channelType: 'Tagged',
                objectId: taskId,
                channelId: taggedChannelId,
                objectType: 'TASK'
            });
        }));

        const createUnseenAEObjects = Promise.all(collapsedUserIds.map((userId) => {
            return actions.createUnseenAEObject({
                objectId: taskId,
                userId: userId,
                teamId: teamId,
                updatedAt: now
            });
        }));

        return Promise.all([
            createUserAEObjects,
            createAssignedChannelAEObjects,
            createTaggedChannelAEObjects,
            createUnseenAEObjects
        ]);
    })

    .then(() => {
        if(laneId) {
            return actions.getTasksInLane(laneId);
        }
    })

    .then((result) => {
        if(result) {
            var bottomLanePosition = result.bottomLanePosition + 65535;
        }

        return actions.createTask({
            boardId: boardId,
            checklistId: checklistId,
            commentThreadId: commentThreadId,
            creatorId: creatorId,
            description: description,
            dueDate: dueDate,
            laneId: laneId,
            titleText: titleText,
            teamId: teamId,
            taskId: taskId,
            createdAt: now,
            updatedAt: now,
            bottomLanePosition: bottomLanePosition
        });
    })

    .then(() => {
        const getTask = actions.getTaskById({
            taskId: taskId
        });
        const getCommentThread = actions.getCommentThreadById(commentThreadId);
        const getChecklist = actions.getChecklistById(checklistId);
        const getChecklistItems = Promise.all(checklistItemIds.map((checklistItemId) => {
            return actions.getChecklistItemById(checklistItemId);
        }));

        return Promise.all([
            getTask,
            getCommentThread,
            getChecklist,
            getChecklistItems
        ]);
    })

    .then((result) => {

        const iTask = result[0].iTask;
        const iCommentThread = result[1].iCommentThread;
        const iChecklist = result[2].iChecklist;
        const iChecklistItems = result[3];
        const collapsedChecklistItems = [];
        iChecklistItems.forEach((iChecklistItem) => collapsedChecklistItems.push(iChecklistItem.iChecklistItem));
        return {
            iTask: iTask,
            iCommentThread: iCommentThread,
            iChecklist: iChecklist,
            iChecklistItems: collapsedChecklistItems
        };
    });
};
