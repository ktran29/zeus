'use strict';

const actions = {
    deleteObjectUserMembership: require('../actions/deleteObjectUserMembership.js'),
    getAllUserIdMembershipsForObject: require('../actions/getAllUserIdMembershipsForObject.js'),
    deleteChannel: require('./deleteChannel.js'),
    putUpdateField: require('../actions/putUpdateField.js')
};

module.exports = (params) => {
    const userId = params.userId;
    const channelId = params.channelId;

    return actions.getAllUserIdMembershipsForObject({
        objectId: channelId
    })

    .then((result) => {
        const userIds = result.userIds;

        if(userIds.length === 1) {
            return actions.deleteChannel(channelId);
        } else {
            var removeMembershipSuccess;

            return actions.deleteObjectUserMembership({
                userId: userId,
                objectId: channelId
            })

            .then((result) => {
                removeMembershipSuccess = result && result.constructor === Object && Object.keys(result).length === 0;

                return actions.putUpdateField({
                    tableName: 'Channels',
                    objectId: channelId
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
