'use strict';

// for validating request
const DeleteAnnouncementRequest_V0_Schema = require('./DeleteAnnouncementRequest_V0_Schema_generated.json');
// for outsourcing common request / response handling
const LambdaRequestHandler = require('../../shared/utils/LambdaRequestHandler.js');
// helper methods
const transactions = {
    deleteAnnouncement: require('../../shared/transactions/deleteAnnouncement.js')
};

module.exports.handler = new LambdaRequestHandler(DeleteAnnouncementRequest_V0_Schema, (request) => {

    const apiVersion = request.apiVersion;
    const announcementId = request.announcementId;
    const teamId = request.teamId;

    return transactions.deleteAnnouncement({
        announcementId: announcementId,
        teamId: teamId
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
