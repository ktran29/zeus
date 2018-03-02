module.exports.convertToLongV0 = (iChannel) => {
    return {
        // metadata
        objectId: iChannel.objectId, // string
        createdAt: iChannel.createdAt, // number
        updatedAt: iChannel.updatedAt, // number

        // data
        announcementIds: iChannel.announcementIds, //string[]
        discussionIds: iChannel.discussionIds, //string[]
        name: iChannel.name, //string
        taskIds: iChannel.taskIds, //string[]
        creatorId: iChannel.creatorId, //string
        memberIds: iChannel.memberIds
    };
};

module.exports.convertToShortV0 = (iChannel) => {
    return {
        objectId: iChannel.objectId, //string
        createdAt: iChannel.createdAt, //number
        updatedAt: iChannel.updatedAt, //number
        name: iChannel.name //string
    };
};

module.exports.convertToIntermediaryFormat = (externalChannel_V0) => {
    // TODO implement when necessary
};
