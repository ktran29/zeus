'use strict';

const actions = {
    getChannelById: require('../actions/getChannelById.js'),
    deleteObjectUserMembership: require('../actions/deleteObjectUserMembership.js'),
    getAllUserIdMembershipsForObject: require('../actions/getAllUserIdMembershipsForObject.js'),
    getAllTaggedChannelObjectsForObjectId: require('../actions/getAllTaggedChannelObjectsForObjectId.js'),
    getAllObjectsForAssociatedObject: require('../actions/getAllObjectsForAssociatedObject.js'),
    deleteDynamoObject: require('../actions/deleteDynamoObject.js'),
    batchDeleteDynamoObjects: require('../actions/batchDeleteDynamoObjects.js'),
    putUpdateField: require('../actions/putUpdateField.js'),
    deleteAnnouncement: require('./deleteAnnouncement.js'),
    deleteDiscussion: require('./deleteDiscussion.js'),
    deleteTask: require('./deleteTask.js')
};

module.exports = (channelId) => {

    var teamId;

    return actions.getChannelById(channelId)

    .then((result) => {

        teamId = result.iChannel.teamId;

        return Promise.all([
            actions.getAllTaggedChannelObjectsForObjectId({
                channelId: channelId,
                objectType: 'ANNOUNCEMENT'
            }),
            actions.getAllTaggedChannelObjectsForObjectId({
                channelId: channelId,
                objectType: 'DISCUSSION'
            }),
            actions.getAllTaggedChannelObjectsForObjectId({
                channelId: channelId,
                objectType: 'TASK'
            }),
            actions.getAllObjectsForAssociatedObject({
                associatedId: channelId,
                objectType: 'ANNOUNCEMENT'
            }),
            actions.getAllObjectsForAssociatedObject({
                associatedId: channelId,
                objectType: 'DISCUSSION'
            }),
            actions.getAllObjectsForAssociatedObject({
                associatedId: channelId,
                objectType: 'TASK'
            })
        ]);
    })

    .then((result) => {
        const taggedAnnnouncementIds = result[0].objectIds;
        const taggedDiscussionIds = result[1].objectIds;
        const taggedTaskIds = result[2].objectIds;
        const announcementIds = result[3].objectIds;
        const discussionIds = result[4].objectIds;
        const taskIds = result[5].objectIds;

        const deleteTaggedAnnouncements = Promise.all(taggedAnnnouncementIds.map((taggedAnnnouncementId) => {
            return actions.batchDeleteDynamoObjects({
                tableName: 'ObjectChannelTagged-AE',
                primaryKey: 'objectId',
                secondaryKey: 'channelId',
                primaryKeyId: taggedAnnnouncementId,
                secondaryKeyId: channelId
            });
        }));

        const deleteTaggedDiscussions = Promise.all(taggedDiscussionIds.map((taggedDiscussionId) => {
            return actions.batchDeleteDynamoObjects({
                tableName: 'ObjectChannelTagged-AE',
                primaryKey: 'objectId',
                secondaryKey: 'channelId',
                primaryKeyId: taggedDiscussionId,
                secondaryKeyId: channelId
            });
        }));

        const deleteTaggedTasks = Promise.all(taggedTaskIds.map((taggedTaskId) => {
            return actions.batchDeleteDynamoObjects({
                tableName: 'ObjectChannelTagged-AE',
                primaryKey: 'objectId',
                secondaryKey: 'channelId',
                primaryKeyId: taggedTaskId,
                secondaryKeyId: channelId
            });
        }));

        const deleteAnnouncements = Promise.all(announcementIds.map((announcementId) => {
            return actions.deleteAnnouncement({announcementId: announcementId});
        }));

        const deleteDiscussions = Promise.all(discussionIds.map((discussionId) => {
            return actions.deleteDiscussion({discussionId: discussionId});
        }));

        const deleteTasks = Promise.all(taskIds.map((taskId) => {
            return actions.deleteTask({taskId: taskId});
        }));

        return Promise.all([
            deleteTaggedAnnouncements,
            deleteTaggedDiscussions,
            deleteTaggedTasks,
            deleteAnnouncements,
            deleteDiscussions,
            deleteTasks
        ]);
    })

    .then(() => {
        return actions.getAllUserIdMembershipsForObject({objectId: channelId});
    })

    .then((result) => {
        const userIds = result.userIds;

        return Promise.all(userIds.map((userId) => {
            return actions.deleteObjectUserMembership({
                objectId: channelId,
                userId: userId
            });
        }));
    })

    .then(() => {
        return actions.putUpdateField({
            tableName: 'Teams',
            objectId: teamId
        });
    })

    .then(() => {
        return actions.deleteDynamoObject({
            tableName: 'Channels',
            objectId: channelId
        });
    })

    .then((result) => {
        const success = result && result.constructor === Object && Object.keys(result).length === 0;

        return {
            success: success
        };
    });
};
