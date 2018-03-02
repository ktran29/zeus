'use strict';

const actions = {
    putUpdateField: require('../actions/putUpdateField.js'),
    getLaneById: require('../actions/getLaneById.js')
};

module.exports = (params) => {

    const laneId = params.laneId;
    const name = params.name;

    return actions.getLaneById(laneId)

    .then((result) => {
        const iLane = result.iLane;

        return Promise.all([
            actions.putUpdateField({
                tableName: 'Lanes',
                objectId: laneId,
                field: 'name',
                value: name
            }),
            actions.putUpdateField({
                tableName: 'Boards',
                objectId: iLane.boardId
            })
        ]);
    })

    .then(() => actions.getLaneById(laneId))

    .then((result) => {
        const iLane = result.iLane;
        return {
            iLane: iLane
        };
    });
};
