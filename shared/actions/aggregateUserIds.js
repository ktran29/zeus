'use strict';

const actions = {
    getAllUserIdMembershipsForObject: require('../actions/getAllUserIdMembershipsForObject.js'),
};

const _ = require('lodash');

const ActionRequestHandler = require('../../shared/utils/ActionRequestHandler.js');

module.exports = new ActionRequestHandler(__filename, (params) => {

    // extract parameters with default values
    const assignedUserIds       = params.assignedUserIds || [];
    const assignedChannelIds    = params.assignedChannelIds || [];

    // grab all channels from the db
    return Promise.all(
        _.without(assignedChannelIds, undefined) // remove undefined ids
        .map((id) => actions.getAllUserIdMembershipsForObject({
            objectId: id
        })) // get each channel
    )

    // start with the initial list of assigned user ids and add the
    // member ids from each channel
    .then((results) => results.reduce(
        (allUserIds, result) => allUserIds.concat(result.userIds),
        assignedUserIds
    ))

    // if no channel ids are given, then skips straight to userIds
    .then((allUserIds) => {
        // removes any undefined or duplicate userIds
        const cleansedUserIds =  _.uniq(_.without(allUserIds, undefined));

        return {
            userIds: cleansedUserIds
        };
    });
});
