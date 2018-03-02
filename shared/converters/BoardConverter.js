module.exports.convertToLongV0 = (iBoard) => {
    return {
        // metadata
        objectId: iBoard.objectId, // string
        createdAt: iBoard.createdAt, // number
        updatedAt: iBoard.updatedAt, // number

        // data
        name: iBoard.name, //string
        teamId: iBoard.teamId, //string,
        creatorId: iBoard.creatorId, //string
        memberIds: iBoard.memberIds, //string[]
        laneIds: iBoard.laneIds //string[]
    };
};

module.exports.convertToShortV0 = (iBoard) => {
    return {
        // metadata
        objectId: iBoard.objectId, // string
        createdAt: iBoard.createdAt, // number
        updatedAt: iBoard.updatedAt, // number

        // data
        name: iBoard.name, //string
        numberOfUsers: iBoard.numberOfUsers //number
    };
};

module.exports.convertToIntermediaryFormat = (externalBoard_V0) => {
    // TODO implement when necessary
};
