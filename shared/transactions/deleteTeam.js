'use strict';

const actions = {
    deleteChannel: require('./deleteChannel.js'),
    deleteBoard: require('./deleteBoard.js'),
    getChannelsInTeam: require('../actions/getChannelsInTeam.js'),
    getBoardsInTeam: require('../actions/getBoardsInTeam.js'),
    getAllUserIdMembershipsForObject: require('../actions/getAllUserIdMembershipsForObject.js'),
    deleteDynamoObject: require('../actions/deleteDynamoObject.js'),
    deleteObjectUserMembership: require('../actions/deleteObjectUserMembership.js')
};

module.exports = (teamId) => {

    return Promise.all([
        actions.getChannelsInTeam(teamId),
        actions.getBoardsInTeam(teamId)
    ])

    .then((result) => {
        const channelIds = result[0].channelIds;
        const boardIds = result[1].boardIds;

        return Promise.all([
            Promise.all(channelIds.map((channelId) => {
                return actions.deleteChannel({channelId: channelId});
            })),
            Promise.all(boardIds.map((boardId) => {
                return actions.deleteBoard({boardId: boardId});
            }))
        ]);

    })

    .then(() => {
        return actions.getAllUserIdMembershipsForObject({objectId: teamId});
    })

    .then((result) => {
        const userIds = result.userIds;

        return Promise.all(userIds.map((userId) => {
            return actions.deleteObjectUserMembership({
                objectId: teamId,
                userId: userId
            });
        }));
    })

    .then(() => {
        return actions.deleteDynamoObject({
            tableName: 'Teams',
            objectId: teamId
        });
    })

    .then((result) => {
        const success = result && result.constructor === Object && Object.keys(result).length === 0;

        return {
            success: success
        };
    });
};
