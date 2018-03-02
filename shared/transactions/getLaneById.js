'use strict';

const actions = {
    getLaneById: require('../actions/getLaneById.js'),
    getTasksInLane: require('../actions/getTasksInLane.js')
};

module.exports = (laneId) => {


    return Promise.all([
        actions.getLaneById(laneId),
        actions.getTasksInLane(laneId)
    ])

    .then((result) => {
        const iLane = result[0].iLane;
        const taskIds = result[1].taskIds;
        iLane.taskIds = taskIds || [];

        return {
            iLane: iLane
        };
    });
};
