'use strict';

const actions = {
    batchDeleteDynamoObjects: require('../actions/batchDeleteDynamoObjects.js'),
    deleteDynamoObject: require('../actions/deleteDynamoObject.js'),
    getDiscussionById: require('../actions/getDiscussionById.js'),
    getCommentsInThread: require('../actions/getCommentsInThread.js'),
    getAllAssociatedObjectsForObjectId: require('../actions/getAllAssociatedObjectsForObjectId.js')
};


module.exports = (params) => {

    const discussionId = params.discussionId;

    var iDiscussion;
    var commentThreadId;

    return actions.getDiscussionById(discussionId)

    .then((result) => {
        iDiscussion = result.iDiscussion;

        commentThreadId = iDiscussion.commentThreadId;

        return actions.getCommentsInThread({
            commentThreadId: commentThreadId,
            // hard coding max value to get all comments in thread
            max: 99999999999999999999
        });
    })


    .then((result) => {
        const commentIds = result.commentIds;

        return Promise.all([
            Promise.all(commentIds.map((commentId) => {
                return actions.deleteDynamoObject({
                    tableName: 'Comments',
                    objectId: commentId
                });
            })),
            actions.deleteDynamoObject({
                tableName: 'CommentThreads',
                objectId: commentThreadId
            })
        ]);
    })

    .then(() => {
        return Promise.all([
            actions.getAllAssociatedObjectsForObjectId({
                objectId: discussionId,
                associatedType: 'CHANNEL'
            }),
            actions.getAllAssociatedObjectsForObjectId({
                objectId: discussionId,
                associatedType: 'USER'
            }),
        ]);
    })

    .then((result) => {
        const channelPrimaryKeyIds = result[0].primaryKeyIds || [];
        const channelSecondaryKeyIds = result[0].secondaryKeyIds || [];
        const channelIds = result[0].associatedIds || [];
        const userPrimaryKeyIds = result[1].primaryKeyIds || [];
        const userSecondaryKeyIds = result[1].secondaryKeyIds || [];

        return Promise.all([
            Promise.all(channelPrimaryKeyIds.map((primaryKeyId) => {
                return actions.batchDeleteDynamoObjects({
                    tableName: 'ObjectAssigned-AE',
                    primaryKey: 'associatedId-objectType',
                    secondaryKey: 'sortDate-objectId',
                    primaryKeyId: primaryKeyId,
                    secondaryKeyId: channelSecondaryKeyIds[0]
                });
            })),
            Promise.all(userPrimaryKeyIds.map((primaryKeyId) => {
                return actions.batchDeleteDynamoObjects({
                    tableName: 'ObjectAssigned-AE',
                    primaryKey: 'associatedId-objectType',
                    secondaryKey: 'sortDate-objectId',
                    primaryKeyId: primaryKeyId,
                    secondaryKeyId: userSecondaryKeyIds[0]
                });
            })),
            Promise.all(channelIds.map((channelId) => {
                return actions.batchDeleteDynamoObjects({
                    tableName: 'ObjectChannelTagged-AE',
                    primaryKey: 'objectId',
                    secondaryKey: 'channelId',
                    primaryKeyId: discussionId,
                    secondaryKeyId: channelId
                });
            }))
        ]);

    })

    .then(() => {
        return actions.deleteDynamoObject({
            tableName: 'Discussions',
            objectId: discussionId
        });
    })

    .then((result) => {
        console.log('Successfully deleted discussion');

        return result.constructor === Object && Object.keys(result).length === 0;
    });
};
