'use strict';

const GetUserRequest_V0_Schema = require('./GetUserRequest_V0_Schema_generated.json');
const UserConverter = require('../../shared/converters/UserConverter');
const LambdaRequestHandler = require('../../shared/utils/LambdaRequestHandler.js');

const transactions = {
    getAllUserIdMembershipsForObject: require('../../shared/transactions/getAllUserIdMembershipsForObject.js')
};

module.exports.handler = new LambdaRequestHandler(GetUserRequest_V0_Schema, (request) => {

    const teamId = request.teamId;
    const short = request.short && (request.short.toLowerCase() === 'true');
    const returnAsObjects = request.returnAsObjects && (request.returnAsObjects.toLowerCase() === 'true');
    const apiVersion = request.apiVersion;

    return transactions.getAllUserIdMembershipsForObject({
        objectId: teamId,
        short: short,
        returnAsObjects: returnAsObjects
    })

    .then((results) => {

        const iUsers = results.iUsers;
        const userIds = results.userIds;

        // construct the appropriate response based on the api version
        switch (apiVersion) {
            case 'v0': {
                if(short) {
                    return {
                        users: iUsers.map((iUser) => UserConverter.convertToShortV0(iUser.iUser))
                    };
                } else {
                    var users;
                    if(returnAsObjects) {
                        return {
                            users: iUsers.map((iUser) => UserConverter.convertToShortV0(iUser.iUser))
                        }
                    } else {
                        return {
                            userIds: userIds
                        };
                    }
                }
            }
            default: {
                throw new Error(`Unsupported api version: ${apiVersion}`);
            }
        }
    });
});
