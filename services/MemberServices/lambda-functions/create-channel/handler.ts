'use strict';

// for validating request
const CreateChannelRequest_V0_Schema = require('./CreateChannelRequest_V0_Schema_generated.json');

// for creating versioned response
const ChannelConverter = require('../../shared/converters/ChannelConverter.js');

// for outsourcing common request / response handling
const LambdaRequestHandler = require('../../shared/utils/LambdaRequestHandler.js');

// helper methods
const transactions = {
    createChannel: require('../../shared/transactions/createChannel.js')
};

module.exports.handler = new LambdaRequestHandler(CreateChannelRequest_V0_Schema, (request) => {

    // extract parameters
    const apiVersion = request.apiVersion;
    const teamId = request.teamId;
    const channelName = request.channelName;
    const creatorId = request.creatorId;
    const memberIds = request.memberIds;

    return transactions.createChannel({
        teamId: teamId,
        channelName: channelName,
        creatorId: creatorId,
        memberIds: memberIds
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
