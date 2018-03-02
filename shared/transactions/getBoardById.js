'use strict';

const actions = {
    getBoardById: require('../actions/getBoardById.js'),
    getUserById: require('../actions/getUserById.js'),
    getAllUserIdMembershipsForObject: require('../actions/getAllUserIdMembershipsForObject.js'),
    getLanesInBoard: require('../actions/getLanesInBoard.js'),
    getLaneById: require('./getLaneById.js')
};

module.exports = (params) => {

    const boardId = params.boardId;
    const includeChildren = params.includeChildren;
    const numberOfUserShorts = params.numberOfUserShorts;

    return actions.getBoardById(boardId)

    .then((result) => {
        const iBoard = result.iBoard;

        return Promise.all([
            actions.getAllUserIdMembershipsForObject({
                objectId: boardId
            }),
            actions.getLanesInBoard(boardId)
        ])

        .then((result) => {
            const memberIds = result[0].userIds;
            const laneIds = result[1].laneIds;
            iBoard.memberIds = memberIds;
            iBoard.laneIds = laneIds;

            if(includeChildren) {
                const memberIds = iBoard.memberIds;
                const laneIds = iBoard.laneIds;
                const numberOfUsers = memberIds.length;
                iBoard.numberOfUsers = numberOfUsers;
                var newMemberIds = [];
                for(var i = 0; i < Math.min(numberOfUsers, numberOfUserShorts, 10); i++) {
                    newMemberIds.push(memberIds[i]);
                }
                return Promise.all([
                    Promise.all(newMemberIds.map((newMemberId) => actions.getUserById(newMemberId))),
                    Promise.all(laneIds.map((laneId) => actions.getLaneById(laneId)))
                ])

                .then((result) => {
                    const iUsers = result[0];
                    const iLanes = result[1];
                    return {
                        iBoard: iBoard,
                        iUsers: iUsers,
                        iLanes: iLanes
                    };
                });
            } else {
                return {
                    iBoard: iBoard
                };
            }
        });

    });
};
