'use strict';

const _ = require('lodash');

const generateUniqueIdentifier = require('../utils/generateUniqueIdentifier.js');

const actions = {
    createAnnouncement: require('../actions/createAnnouncement.js'),
    getAnnouncementById: require('./getAnnouncementById.js'),
    getAllUserIdMembershipsForObject: require('../actions/getAllUserIdMembershipsForObject.js'),
    createAssignedAEObject: require('../actions/createAssignedAEObject.js'),
    createChannelAEObject: require('../actions/createChannelAEObject.js'),
    createObjectUserMembership: require('../actions/createObjectUserMembership.js'),
    createUnseenAEObject: require('../actions/createUnseenAEObject.js')
};

module.exports = (params) => {

    // Extract parameters
    const userId = params.userId;
    const teamId = params.teamId;
    const text = params.text;
    const assignedChannelIds = params.assignedChannelIds;

    const now = Date.now();
    const announcementId = generateUniqueIdentifier();

    return Promise.all(assignedChannelIds.map((assignedChannelId) => {
        return actions.getAllUserIdMembershipsForObject({
            objectId: assignedChannelId
        });
    }))

   .then((result) => {
       // Extract results
       const channelUserIds = result;
       var collapsedUserIds = [];
       channelUserIds.forEach((userIds) => {
           collapsedUserIds = collapsedUserIds.concat(userIds.userIds);
       });

       collapsedUserIds = _.uniq(collapsedUserIds);

       const createAssignedChannelAEObjects = Promise.all(assignedChannelIds.map((assignedChannelId) => {
           return actions.createAssignedAEObject({
               objectId: announcementId,
               associatedId: assignedChannelId,
               associatedType: 'CHANNEL',
               objectType: 'ANNOUNCEMENT',
               sortDate: now
           });
       }));

       const createTaggedChannelAEObjects = Promise.all(assignedChannelIds.map((taggedChannelId) => {
           return actions.createChannelAEObject({
               objectId: announcementId,
               channelId: taggedChannelId,
               objectType: 'ANNOUNCEMENT'
           });
       }));

       const createUnseenAEObjects = Promise.all(collapsedUserIds.map((userId) => {
           return actions.createUnseenAEObject({
               objectId: announcementId,
               userId: userId,
               teamId: teamId,
               updatedAt: now
           });
       }));

       return Promise.all([
           createAssignedChannelAEObjects,
           createTaggedChannelAEObjects,
           createUnseenAEObjects
       ]);
   })

   .then(() => {
       return actions.createAnnouncement({
           announcementId: announcementId,
           userId: userId,
           teamId: teamId,
           text: text,
           createdAt: now,
           updatedAt: now
       });
   })

   .then(() => actions.getAnnouncementById({
       announcementId: announcementId
   }))

   .then((result) => {
       const iAnnouncement = result.iAnnouncement;

       return {
           iAnnouncement: iAnnouncement
       };
   });
};
