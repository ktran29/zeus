module.exports.convertToLongV0 = (iCommentThread) => {
    return {
        // metadata
        objectId: iCommentThread.objectId, //string
        createdAt: iCommentThread.createdAt, //number
        updatedAt: iCommentThread.updatedAt, //number

        // data
        parentObjectId: iCommentThread.parentObjectId, //string
        commentIds: iCommentThread.commentIds
    };
};

module.exports.convertToShortV0 = (iCommentThread) => {
    return {
        objectId: iCommentThread.objectId, //string
        createdAt: iCommentThread.createdAt, //number
        updatedAt: iCommentThread.updatedAt, //number,
        numberOfComments: iCommentThread.numberOfComments, //number
        parentObjectId: iCommentThread.parentObjectId //string
    };
};

module.exports.convertToIntermediaryFormat = (externalCommentThread_V0) => {
    // TODO implement when necessary
};
