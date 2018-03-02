'use strict';

// for validating request
const LeaveChannelRequest_V0_Schema = require('./LeaveChannelRequest_V0_Schema_generated.json');
// for outsourcing common request / response handling
const LambdaRequestHandler = require('../../shared/utils/LambdaRequestHandler.js');
// helper methods
const transactions = {
    leaveChannel: require('../../shared/transactions/leaveChannel.js')
};

module.exports.handler = new LambdaRequestHandler(LeaveChannelRequest_V0_Schema, (request) => {

    // extract parameters
    const channelId = request.channelId;
    const userId = request.userId;
    const apiVersion = request.apiVersion;

    return transactions.leaveChannel({
        channelId: channelId,
        userId: userId
    })

    .then((result) => {
        switch(apiVersion) {
            case 'v0': {
                return result;
            }

            default: {
                throw new Error(`Unsupported api version: ${apiVersion}`);
            }
        }
    });
});
