'use strict';

const GetChannelRequest_V0_Schema = require('./GetChannelRequest_V0_Schema_generated.json');
const ChannelConverter = require('../../shared/converters/ChannelConverter');
const LambdaRequestHandler = require('../../shared/utils/LambdaRequestHandler.js');

const transactions = {
    getChannelsForUser: require('../../shared/transactions/getChannelsForUser.js')
};

module.exports.handler = new LambdaRequestHandler(GetChannelRequest_V0_Schema, (request) => {

    const teamId = request.teamId;
    const userId = request.userId;
    const apiVersion = request.apiVersion;
    const short = request.short && (request.short.toLowerCase() === 'true');

    return transactions.getChannelsForUser({
        teamId: teamId,
        userId: userId
    })

    .then((results) => {

        const iChannels = results.iChannels;

        // construct the appropriate response based on the api version
        switch (apiVersion) {
            case 'v0': {
                if(short) {
                    return {
                        channels: iChannels.map((iChannel) => ChannelConverter.convertToShortV0(iChannel))
                    };
                } else {
                    return {
                        channels: iChannels.map((iChannel) => ChannelConverter.convertToLongV0(iChannel))
                    };
                }
            }
            default: {
                throw new Error(`Unsupported api version: ${apiVersion}`);
            }
        }
    });
});
