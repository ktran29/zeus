'use strict';

const actions = {
    getAnnouncementById: require('../actions/getAnnouncementById.js'),
    getDiscussionById: require('../actions/getDiscussionById.js'),
    getTaskById: require('../actions/getTaskById.js'),
    getCommentThreadById: require('../actions/getCommentThreadById.js'),
    getCommentById: require('../actions/getCommentById.js'),
    getUserDataById: require('../actions/getUserDataById.js'),
    getChecklistById: require('../actions/getChecklistById.js'),
    getChecklistItemById: require('../actions/getChecklistItemById.js'),
    getChannelById: require('../actions/getChannelById.js')
};

/*
 * Helper functions
*/
const _ = require('underscore');

// Filters out old/non-updated objects
const filterUpdatedObjects = (params) => {

    // Extract parameteres
    const objectType = params.objectType;
    const objects = params.objects || [];
    const objectMetaDataMap = params.objectMetaDataMap;

    // Check if objectsMetaData exists and has objectType
    if (!objectMetaDataMap || !objectMetaDataMap[objectType]) {
        return objects;
    }

    this.objectsMetaData = objectMetaDataMap[objectType];

    // Gets rid of old/non-updated objects
    var filteredObjects = objects.filter((object) => {
        var metaData = this.objectsMetaData[object.objectId];
        if (metaData) {
            // metadata exists
            if (object.updatedAt > metaData.updatedAt) {
                return true; // Object has been updated since metaData snapshot
            } else {
                return false; // Object has not been updated since metaData snapshot
            }
        } else {
            return true; // No metadata, client does not have this object
        }
    }, this);

    return filteredObjects;
};

module.exports = (params) => {
    // Extract parameters
    const objectType = params.objectType;
    const userDataId = params.userDataId;
    const objectMetaDataMap = params.objectMetaDataMap;

    // Sets the actions based on the passed in objectType
    switch (objectType) {
        case 'AnnouncementItem':
            /* Work Flow:
                Get ALL channelIds from userData object -> Get ALL announcementIds from channels -> Remove duplicate ids w/ uniq
                -> Get ALL announcement objects from ids-> Filter ->  Return filtered Announcements
            */

            return actions.getUserDataById(userDataId)

            .then((result) => {
                var channelIds = result.iUserData.channelIds;

                var getChannelObjectsById= channelIds.map((channelId) => {
                    return actions.getChannelById(channelId);
                });

                return Promise.all(getChannelObjectsById);
            })

            .then((result) => {
                var channelObjects = result;

                var announcementIds = channelObjects.map(channelObject => channelObject.iChannel.announcementIds);

                announcementIds = _.flatten(announcementIds);
                var filteredAnnouncementIds = _.uniq(announcementIds);

                // Gets the individual announcement object from each announcement id
                var getUpdatedAnnouncementObjectsFromIds = filteredAnnouncementIds.map((announcementId) => {
                    return actions.getAnnouncementById(announcementId);
                });

                return Promise.all(getUpdatedAnnouncementObjectsFromIds);
            })

            .then((result) => {
                var allAnnouncementObjects = result;
                allAnnouncementObjects = allAnnouncementObjects.map(announcementObj => announcementObj.iAnnouncement);

                return {
                    iObjectMap: {
                        AnnouncementItem:
                            filterUpdatedObjects({
                                objectType: objectType,
                                objects: allAnnouncementObjects,
                                objectMetaDataMap: objectMetaDataMap
                            })
                    }
                };
            });

        case 'DiscussionItem':
            /* Work Flow:
                Get ALL channelIds from userData object -> Get ALL Discussions in channel -> Filter ->
                Get ALL commentThreads -> Filter -> get ALL comments -> Filter -> Return filtered
                discussions, commentThreads, comments
            */

            var finalDiscussionItems;
            var finalDiscussionCommentThreads;
            var finalDiscussionComments;

            return actions.getUserDataById(userDataId)

            .then((result) => {
                var channelIds = result.iUserData.channelIds;

                var getChannelObjectsById = channelIds.map((channelId) => {
                    return actions.getChannelById(channelId);
                });

                return Promise.all(getChannelObjectsById);
            })

            .then((result) => {
                var channelObjects = result;

                var discussionIds = channelObjects.map(channelObject => channelObject.iChannel.discussionIds);

                discussionIds = _.flatten(discussionIds);
                var filteredDiscussionIds = _.uniq(discussionIds);

                // Gets the individual discussion object from each discussion id
                var getDiscussionObjectsFromIds = filteredDiscussionIds.map((discussionId) => {
                    return actions.getDiscussionById(discussionId);
                });

                return Promise.all(getDiscussionObjectsFromIds);
            })

            .then((result) => {
                var allDiscussionObjects = result;
                allDiscussionObjects = allDiscussionObjects.map(discussionObject => discussionObject.iDiscussion);

                finalDiscussionItems = filterUpdatedObjects({
                    objectType: objectType,
                    objects: allDiscussionObjects,
                    objectMetaDataMap: objectMetaDataMap
                });

                var commentThreadIds = finalDiscussionItems.map(filteredDiscussionItem => filteredDiscussionItem.commentThreadId);

                var getCommentThreadObjectsFromIds = commentThreadIds.map((commentThreadId) => {
                    return actions.getCommentThreadById(commentThreadId);
                });

                return Promise.all(getCommentThreadObjectsFromIds);
            })

            .then((result) => {
                var allCommentThreads = result;

                allCommentThreads = allCommentThreads.map(commentThread => commentThread.iCommentThread);

                finalDiscussionCommentThreads = filterUpdatedObjects({
                    objectType: 'CommentThread',
                    objects: allCommentThreads,
                    objectMetaDataMap: objectMetaDataMap
                });

                var allCommentIds = finalDiscussionCommentThreads.map(discussion => discussion.commentIds);

                allCommentIds = _.flatten(allCommentIds);

                var getCommentObjectsFromIds = allCommentIds.map((commentId) => {
                    return actions.getCommentById(commentId);
                });

                return Promise.all(getCommentObjectsFromIds);
            })

            .then((result) => {
                var allComments = result;
                allComments = allComments.map(comment => comment.iComment);

                finalDiscussionComments = filterUpdatedObjects({
                    objectType: 'Comment',
                    objects: allComments,
                    objectMetaDataMap: objectMetaDataMap
                });

                return {
                    iObjectMap: {
                        DiscussionItem: finalDiscussionItems,
                        CommentThread: finalDiscussionCommentThreads,
                        Comment: finalDiscussionComments
                    }
                };
            });

        case 'Task':
            /* Work Flow:
                Get ALL Tasks in channels from UserData -> Filter -> Get ALL commentThreads -> Filter
                -> get ALL comments -> Filter -> Get ALL checkLists -> Filter
                -> Get ALL checkListItems -> Filter
                -> Return filtered Tasks, commentThreads, comments, checkLists, checkListItems
            */

            var finalTasks;
            var finalTaskCommentThreads;
            var finalTaskComments;
            var finalTaskChecklists;
            var finalTaskChecklistItems;

            return actions.getUserDataById(userDataId)

            .then((result) => {
                // TODO: Using "tacks" since that's what it is in the database. Change to "task" when relevant
                var sentTaskIds = result.iUserData.sentTaskIds;
                var receivedTaskIds = result.iUserData.receivedTaskIds;

                var allTaskIds = receivedTaskIds.concat(sentTaskIds);
                var getTasksFromIds = allTaskIds.map((taskId) => {
                    return actions.getTaskById(taskId);
                });

                return Promise.all(getTasksFromIds);
            })

            .then((result) => {
                var allTaskObjects = result;

                // Convert from array of objects to array of arrays
                allTaskObjects = allTaskObjects.map(taskObject => taskObject.iTask);

                // Filter out duplicates
                finalTasks = filterUpdatedObjects({
                    objectType: 'Task',
                    objects: allTaskObjects,
                    objectMetaDataMap: objectMetaDataMap
                });

                var allCommentThreadIds = finalTasks.map(filteredTask => filteredTask.commentThreadId);
                var allChecklistIds = finalTasks.map(filteredTask => filteredTask.checklistId);

                var getCommentThreadObjectsFromIds = Promise.all(
                    allCommentThreadIds.map((commentThreadId) => {
                        return actions.getCommentThreadById(commentThreadId);
                    })
                );
                var getChecklistObjectsFromIds = Promise.all(
                    allChecklistIds.map((checklistId) => {
                        return actions.getChecklistById(checklistId);
                    })
                );

                return Promise.all([
                    getCommentThreadObjectsFromIds,
                    getChecklistObjectsFromIds
                ]);
            })

            .then((result) => {
                var allCommentThreads = result[0];
                var allChecklists = result[1];

                allCommentThreads = allCommentThreads.map(commentThread => commentThread.iCommentThread);
                allChecklists = allChecklists.map(checklist => checklist.iChecklist);

                allCommentThreads = _.flatten(allCommentThreads);
                allChecklists = _.flatten(allChecklists);

                finalTaskCommentThreads = filterUpdatedObjects({
                    objectType: 'CommentThread',
                    objects: allCommentThreads,
                    objectMetaDataMap: objectMetaDataMap
                });

                finalTaskChecklists = filterUpdatedObjects({
                    objectType: 'Checklist',
                    objects: allChecklists,
                    objectMetaDataMap: objectMetaDataMap
                });

                var allCommentIds = finalTaskCommentThreads.map(commentThread => commentThread.commentIds);
                var allChecklistItemIds = finalTaskChecklists.map(checklist => checklist.checklistItemIds);

                allCommentIds = _.flatten(allCommentIds);
                allChecklistItemIds = _.flatten(allChecklistItemIds);

                var getCommentObjectsByIds = Promise.all(
                    allCommentIds.map((commentId) => {
                        return actions.getCommentById(commentId);
                    })
                );
                var getChecklistItemObjectsByIds = Promise.all(
                    allChecklistItemIds.map((checklistItemId) => {
                        return actions.getChecklistItemById(checklistItemId);
                    })
                );

                return Promise.all([
                    getCommentObjectsByIds,
                    getChecklistItemObjectsByIds
                ]);
            })

            .then((result) => {
                var allComments = result[0];
                var allChecklistItems = result[1];

                allComments = _.flatten(allComments);
                allChecklistItems = _.flatten(allChecklistItems);

                allComments = allComments.map(comment => comment.iComment);
                allChecklistItems = allChecklistItems.map(checklistItem => checklistItem.iChecklistItem);

                finalTaskComments = filterUpdatedObjects({
                    objectType: 'Comment',
                    objects: allComments,
                    objectMetaDataMap: objectMetaDataMap
                });
                finalTaskChecklistItems = filterUpdatedObjects({
                    objectType: 'ChecklistItem',
                    objects: allChecklistItems,
                    objectMetaDataMap: objectMetaDataMap
                });

                return {
                    iObjectMap: {
                        Task: finalTasks,
                        CommentThread: finalTaskCommentThreads,
                        Comment: finalTaskComments,
                        Checklist: finalTaskChecklists,
                        ChecklistItem: finalTaskChecklistItems
                    }
                };
            });

        default:
            console.log(`Unrecognized object type ${objectType}.`);
            return;
    }
};
