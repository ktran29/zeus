'use strict';

const actions = {
    getLaneById: require('../actions/getLaneById.js'),
    getTasksInLane: require('../actions/getTasksInLane.js'),
    putUpdateField: require('../actions/putUpdateField.js'),
    deleteDynamoObject: require('../actions/deleteDynamoObject.js'),
    deleteTask: require('./deleteTask.js')
};

module.exports = (params) => {
    const laneId = params.laneId;

    var iLane;
    var boardId;

    return actions.getLaneById(laneId)

    .then((result) => {
        iLane = result.iLane;
        boardId = iLane.boardId;
        return actions.getTasksInLane(laneId);
    })

    .then((result) => {
        const taskIds = result.taskIds;

        return Promise.all(taskIds.map((taskId) => {
            return actions.deleteTask({
                taskId: taskId
            });
        }));
    })

    .then(() => {
        return actions.putUpdateField({
            tableName: 'Boards',
            objectId: boardId
        });
    })

    .then(() => {
        return actions.deleteDynamoObject({
            objectId: laneId,
            tableName: 'Lanes'
        });
    })

    .then((result) => {
        console.log('Successfully deleted lane');

        return result.constructor === Object && Object.keys(result).length === 0;
    });
};
