'use strict';

const actions = {
    getLaneById: require('../actions/getLaneById.js'),
    putUpdateField: require('../actions/putUpdateField.js'),
};

const InvalidArgumentError = require('../utils/Errors.js').InvalidArgumentError;

module.exports = (params) => {

    const taskId = params.taskId;
    const newLaneId = params.newLaneId;
    const currentLaneId = params.currentLaneId;
    const currentBoardId = params.currentBoardId;
    const newLanePosition = params.newLanePosition;

    var iLane;

    if(newLaneId) {
        var getLane = actions.getLaneById(newLaneId);
    } else {
        getLane = actions.getLaneById(currentLaneId);
    }

    return getLane

    .then((result) => {
        iLane = result.iLane;
        const boardId = iLane.boardId;

        if(newLaneId && currentBoardId && currentBoardId !== boardId) {
            throw new InvalidArgumentError('Task cannot be moved to this lane.');
        }

        if(newLaneId) {
            var updateTaskLane = actions.putUpdateField({
                tableName: 'Tasks',
                objectId: taskId,
                field: 'laneId',
                value: newLaneId
            });
        }

        return Promise.all([
            actions.putUpdateField({
                tableName: 'Tasks',
                objectId: taskId,
                field: 'lanePosition',
                value: newLanePosition
            }),
            updateTaskLane
        ]);

    })

    .then(() => {
        return {
            iLane: iLane
        };
    });
};
