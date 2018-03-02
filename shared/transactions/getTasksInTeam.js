'use strict';

const actions = {
    getTasksInChannel: require('./getTasksInChannel.js'),
    getChannelsInTeam: require('../actions/getChannelsInTeam.js')
};

const getUniqueArray = require('../utils/getUniqueArray.js');

const _ = require('lodash');

module.exports = (params) => {

    const teamId = params.teamId;
    const returnAsObjects = params.returnAsObjects;
    var channelIds = params.channelIds;

    return actions.getChannelsInTeam(teamId)

    .then((result) => {
        const teamChannelIds = result.channelIds;

        // if no channelIds are given, gets tasks for all channels in a team
        if(!channelIds) {
            channelIds = teamChannelIds;
        } else {
            channelIds = channelIds.split(',');

            // checks to see if given channels exist in the team
            channelIds = teamChannelIds.filter((channelId) => {
                return channelIds.indexOf(channelId) !== -1;
            });
        }
        return Promise.all(channelIds.map((channelId) => {
            return actions.getTasksInChannel({
                channelId: channelId,
                returnAsObjects: returnAsObjects
            });
        }));
    })

    .then((result) => {
        const channelTasks = result;
        const tasks = [];
        var taskIds = [];
        channelTasks.forEach((channelTask) => {
            const iTasks = channelTask.iTasks;
            if(iTasks) {
                iTasks.forEach((iTask) => {
                    tasks.push(iTask);
                });
            }
            taskIds.concat(channelTask.taskIds);

        });

        return {
            iTasks: getUniqueArray(tasks),
            taskIds: _.flatten(_.uniq(taskIds))
        };
    });
};
