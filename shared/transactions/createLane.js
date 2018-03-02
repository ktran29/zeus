'use strict';

const actions = {
    createLane: require('../actions/createLane.js'),
    getLaneById: require('../actions/getLaneById.js')
};

module.exports = (params) => {

    const name = params.name;
    const boardId = params.boardId;

    return actions.createLane({
        name: name,
        boardId: boardId
    })

    .then((result) => {
        const laneId = result.laneId;

        return actions.getLaneById(laneId);
    })

    .then((result) => {
        const iLane = result.iLane;

        return {
            iLane: iLane
        };
    });

};
