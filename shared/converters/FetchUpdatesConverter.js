module.exports.convertToLongV0 = (iObjectMap) => {
    if (iObjectMap.AnnouncementItem) {
        return {
            announcements: iObjectMap.AnnouncementItem
        };
    } else if (iObjectMap.DiscussionItem) {
        return {
            discussions: iObjectMap.DiscussionItem,
            commentThreads: iObjectMap.CommentThread,
            comments: iObjectMap.Comment
        };
    } else {
        return {
            tasks: iObjectMap.Task,
            commentThreads: iObjectMap.CommentThread,
            comments: iObjectMap.Comment,
            checklists: iObjectMap.Checklist,
            checklistItems: iObjectMap.ChecklistItem
        };
    }
};

module.exports.convertToIntermediaryFormat = (externalDiscussion_V0) => {
    // TODO implement when necessary
};
