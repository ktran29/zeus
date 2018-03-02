'use strict';

const actions = {
    deleteObjectUserMembership: require('../actions/deleteObjectUserMembership.js'),
    getAllUserIdMembershipsForObject: require('../actions/getAllUserIdMembershipsForObject.js'),
    getChannelsInTeam: require('../actions/getChannelsInTeam.js'),
    getBoardsInTeam: require('../actions/getBoardsInTeam.js'),
    deleteTeam: require('./deleteTeam.js'),
    leaveChannel: require('./leaveChannel.js'),
    removeFromBoard: require('./removeFromBoard.js'),
    putUpdateField: require('../actions/putUpdateField.js')
};

module.exports = (params) => {

    const userId = params.userId;
    const teamId = params.teamId;

    return Promise.all([
        actions.getChannelsInTeam(teamId),
        actions.getBoardsInTeam(teamId)
    ])

    .then((result) => {
        const channelIds = result[0].channelIds;
        const boardIds = result[1].boardIds;

        return Promise.all([
            Promise.all(channelIds.map((channelId) => {
                return actions.leaveChannel({
                    channelId: channelId,
                    userId: userId
                });
            })),
            Promise.all(boardIds.map((boardId) => {
                return actions.removeFromBoard({
                    boardId: boardId,
                    userId: userId
                });
            }))
        ]);

    })

    .then(() => {
        return actions.getAllUserIdMembershipsForObject({
            objectId: teamId
        });
    })

    .then((result) => {
        const userIds = result.userIds;

        if(userIds.length === 1) {
            return actions.deleteTeam(teamId);
        } else {
            var removeMembershipSuccess;

            return actions.deleteObjectUserMembership({
                userId: userId,
                objectId: teamId
            })

            .then((result) => {
                removeMembershipSuccess = result && result.constructor === Object && Object.keys(result).length === 0;

                return actions.putUpdateField({
                    tableName: 'Teams',
                    objectId: teamId
                });
            })

            .then(() => {
                return {
                    success: removeMembershipSuccess
                };
            });
        }
    })

    .then((result) => {
        const success = result.success;

        return {
            success: success
        };
    });
};
