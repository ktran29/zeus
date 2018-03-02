module.exports.convertToLongV0 = (iLane) => {
    return {
        // metadata
        objectId: iLane.objectId, // string
        createdAt: iLane.createdAt, // number
        updatedAt: iLane.updatedAt, // number

        // data
        name: iLane.name, //string
        boardId: iLane.boardId, //string
        taskIds: iLane.taskIds //string[]
    };
};

module.exports.convertToIntermediaryFormat = (externalLane_V0) => {
    // TODO implement when necessary
};
