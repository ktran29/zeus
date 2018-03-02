'use strict';

const FetchUpdatesRequest_V0_Schema = require('./FetchUpdatesRequest_V0_Schema_generated.json');
const converters = {
    FetchUpdatesConverter: require('../../shared/converters/FetchUpdatesConverter.js'),
    AnnouncementConverter: require('../../shared/converters/AnnouncementConverter.js'),
    DiscussionConverter: require('../../shared/converters/DiscussionConverter.js'),
    TaskConverter: require('../../shared/converters/TaskConverter.js'),
    CommentThreadConverter: require('../../shared/converters/CommentThreadConverter.js'),
    CommentConverter: require('../../shared/converters/CommentConverter.js'),
    ChecklistConverter: require('../../shared/converters/ChecklistConverter.js'),
    ChecklistItemConverter: require('../../shared/converters/ChecklistItemConverter.js')
};
const LambdaRequestHandler = require('../../shared/utils/LambdaRequestHandler.js');
const transactions = {
    fetchUpdates: require('../../shared/transactions/fetchUpdates.js')
};
const UnsupportedObjectTypeError = require('../../shared/utils/Errors.js').UnsupportedObjectTypeError;

module.exports.handler = new LambdaRequestHandler(FetchUpdatesRequest_V0_Schema, (request) => {
    // Extract parameters
    const apiVersion = request.apiVersion;
    const objectType = request.objectType;
    const userDataId = request.userDataId;
    const objectMetaDataMap = request.objectMetaDataMap;

    return transactions.fetchUpdates({
        objectType: objectType,
        userDataId: userDataId,
        objectMetaDataMap: objectMetaDataMap
    })

    .then((result) => {
        var iObjectMap = result.iObjectMap;
        switch(apiVersion) {
            case 'v0': {
                switch(objectType) {
                    case 'AnnouncementItem': {
                        iObjectMap.AnnouncementItem = iObjectMap.AnnouncementItem.map((iAnnouncement) => {
                            return converters.AnnouncementConverter.convertToLongV0(iAnnouncement);
                        });
                        return {
                            objectMap: converters.FetchUpdatesConverter.convertToLongV0(iObjectMap)
                        };
                    }
                    case 'DiscussionItem': {
                        iObjectMap.DiscussionItem = iObjectMap.DiscussionItem.map((iDiscussion) => {
                            return converters.DiscussionConverter.convertToLongV0(iDiscussion);
                        });
                        iObjectMap.CommentThread = iObjectMap.CommentThread.map((iCommentThread) => {
                            return converters.CommentThreadConverter.convertToLongV0(iCommentThread);
                        });
                        iObjectMap.Comment = iObjectMap.Comment.map((iComment) => {
                            return converters.CommentConverter.convertToLongV0(iComment);
                        });
                        return {
                            objectMap: converters.FetchUpdatesConverter.convertToLongV0(iObjectMap)
                        };
                    }
                    case 'Task': {
                        iObjectMap.Task = iObjectMap.Task.map((iTask) => {
                            return converters.TaskConverter.convertToLongV0(iTask);
                        });
                        iObjectMap.CommentThread = iObjectMap.CommentThread.map((iCommentThread) => {
                            return converters.CommentThreadConverter.convertToLongV0(iCommentThread);
                        });
                        iObjectMap.Comment = iObjectMap.Comment.map((iComment) => {
                            return converters.CommentConverter.convertToLongV0(iComment);
                        });
                        iObjectMap.Checklist = iObjectMap.Checklist.map((iChecklist) => {
                            return converters.ChecklistConverter.convertToLongV0(iChecklist);
                        });
                        iObjectMap.ChecklistItem = iObjectMap.ChecklistItem.map((iChecklistItem) => {
                            return converters.ChecklistItemConverter.convertToLongV0(iChecklistItem);
                        });
                        return {
                            objectMap: converters.FetchUpdatesConverter.convertToLongV0(iObjectMap)
                        };
                    }
                    default: {
                        throw new UnsupportedObjectTypeError('fetchUpdates', objectType);
                    }
                }
            }
            default: {
                throw new Error(`Unsupported api version: ${apiVersion}`);
            }
        }
    });
});
