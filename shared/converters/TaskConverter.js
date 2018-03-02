module.exports.convertToLongV0 = (iTask) => {
    return {
        // metadata
        objectId: iTask.objectId, // string
        createdAt: iTask.createdAt, // number
        updatedAt: iTask.updatedAt, // number

        // data
        checklistId: iTask.checklistId, //string
        dueDate: iTask.dueDate, //number
        commentThreadId: iTask.commentThreadId, //string
        creatorId: iTask.creatorId, //string
        status: iTask.status,
        title: iTask.title,
        assignedUserIds: iTask.assignedUserIds,
        assignedChannelIds: iTask.assignedChannelIds, //string[]
        taggedChannelIds: iTask.taggedChannelIds,
        description: iTask.description, //string
        boardId: iTask.boardId, //string
        laneId: iTask.laneId, // string,
        lanePosition: iTask.lanePosition //number
    };
};

module.exports.convertToShortV0 = (iTask) => {
    return {
        objectId: iTask.objectId, // string
        createdAt: iTask.createdAt, // number
        updatedAt: iTask.updatedAt, // number
        title: iTask.title,
        assignedUserIds: iTask.assignedUserIds,
        assignedChannelIds: iTask.assignedChannelIds, //string[]
        taggedChannelIds: iTask.taggedChannelIds,
        dueDate: iTask.dueDate //number
    };
};

module.exports.convertToIntermediaryFormat = (externalTask_V0) => {
    // TODO implement when necessary
};
