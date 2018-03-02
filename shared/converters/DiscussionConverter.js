module.exports.convertToLongV0 = (iDiscussion) => {
    return {
        // metadata
        objectId: iDiscussion.objectId, // string
        createdAt: iDiscussion.createdAt, // number
        updatedAt: iDiscussion.updatedAt, // number

        // data
        assignedChannelIds: iDiscussion.assignedChannelIds,
        taggedChannelIds: iDiscussion.taggedChannelIds,
        commentThreadId: iDiscussion.commentThreadId, //string
        itemText: iDiscussion.itemText, //string
        creatorId: iDiscussion.creatorId //string
    };
};

module.exports.convertToShortV0 = (iDiscussion) => {
    return {
        // metadata
        objectId: iDiscussion.objectId, // string
        createdAt: iDiscussion.createdAt, // number
        updatedAt: iDiscussion.updatedAt, // number

        // data
        assignedChannelIds: iDiscussion.assignedChannelIds,
        taggedChannelIds: iDiscussion.taggedChannelIds,
        commentThreadId: iDiscussion.commentThreadId, //string
        itemText: iDiscussion.itemText, //string
        creatorId: iDiscussion.creatorId //string
    };
};

module.exports.convertToIntermediaryFormat = (externalDiscussion_V0) => {
    // TODO implement when necessary
};
