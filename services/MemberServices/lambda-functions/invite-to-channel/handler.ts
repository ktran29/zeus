'use strict';

// for validating request
const InviteToChannelRequest_V0_Schema = require('./InviteToChannelRequest_V0_Schema_generated.json');

// for creating versioned response
const ChannelConverter = require('../../shared/converters/ChannelConverter.js');

// for outsourcing common request / response handling
const LambdaRequestHandler = require('../../shared/utils/LambdaRequestHandler.js');

// helper methods
const transactions = {
    joinChannel: require('../../shared/transactions/joinChannel.js')
};

module.exports.handler = new LambdaRequestHandler(InviteToChannelRequest_V0_Schema, (request) => {

    // extract parameters
    const apiVersion = request.apiVersion;
    const userIds = request.userIds;
    const channelId = request.channelId;
    const teamId = request.teamId;

    return transactions.joinChannel({
        userIds: userIds,
        channelId: channelId,
        teamId: teamId
    })

    .then((result) => {
        // extract results
        const iChannel = result.iChannel;
        // construct the appropriate response based on the api version
        switch (apiVersion) {
            case 'v0': {
                return {
                    channel: ChannelConverter.convertToLongV0(iChannel)
                };
            }

            default: {
                throw new Error(`Unsupported api version: ${apiVersion}`);
            }
        }

    });

});
