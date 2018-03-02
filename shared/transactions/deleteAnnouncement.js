'use strict';

const actions = {
    deleteDynamoObject: require('../actions/deleteDynamoObject.js'),
    batchDeleteDynamoObjects: require('../actions/batchDeleteDynamoObjects.js'),
    getAllAssociatedObjectsForObjectId: require('../actions/getAllAssociatedObjectsForObjectId.js')
};

module.exports = (params) => {

    const announcementId = params.announcementId;

    return actions.getAllAssociatedObjectsForObjectId({
        objectId: announcementId,
        associatedType: 'CHANNEL'
    })

    .then((result) => {
        const primaryKeyIds = result.primaryKeyIds || [];
        const secondaryKeyIds = result.secondaryKeyIds || [];
        const channelIds = result.associatedIds || [];


        return Promise.all([
            Promise.all(primaryKeyIds.map((primaryKeyId) => {
                return actions.batchDeleteDynamoObjects({
                    tableName: 'ObjectAssigned-AE',
                    primaryKey: 'associatedId-objectType',
                    secondaryKey: 'sortDate-objectId',
                    primaryKeyId: primaryKeyId,
                    secondaryKeyId: secondaryKeyIds[0]
                });
            })),
            Promise.all(channelIds.map((channelId) => {
                return actions.batchDeleteDynamoObjects({
                    tableName: 'ObjectChannelTagged-AE',
                    primaryKey: 'objectId',
                    secondaryKey: 'channelId',
                    primaryKeyId: announcementId,
                    secondaryKeyId: channelId
                });
            }))
        ]);

    })

    .then(() => {
        return actions.deleteDynamoObject({
            objectId: announcementId,
            tableName: 'Announcements'
        });
    })

    .then((result) => {
        console.log('Successfully deleted announcement');
        return result.constructor === Object && Object.keys(result).length === 0;
    });
};
