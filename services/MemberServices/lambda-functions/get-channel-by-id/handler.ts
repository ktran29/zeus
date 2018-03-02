'use strict';

const GetChannelRequest_V0_Schema = require('./GetChannelRequest_V0_Schema_generated.json');
const ChannelConverter = require('../../shared/converters/ChannelConverter');
const LambdaRequestHandler = require('../../shared/utils/LambdaRequestHandler.js');

const transactions = {
    getChannelById: require('../../shared/transactions/getChannelById.js')
};

module.exports.handler = new LambdaRequestHandler(GetChannelRequest_V0_Schema, (request) => {

    const apiVersion = request.apiVersion;
    const channelId = request.channelId;
    const short = request.short && (request.short.toLowerCase() === 'true');

    return transactions.getChannelById(channelId)

    .then((results) => {

        const iChannel = results.iChannel;

        // construct the appropriate response based on the api version
        switch (apiVersion) {
            case 'v0': {
                if(short) {
                    return {
                        channel: ChannelConverter.convertToShortV0(iChannel)
                    };
                } else {
                    return {
                        channel: ChannelConverter.convertToLongV0(iChannel)
                    };
                }
            }
            default: {
                throw new Error(`Unsupported api version: ${apiVersion}`);
            }
        }
    });
});
