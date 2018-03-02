
module.exports.convertToLongV0 = (iUserData) => {
    return {
        // metadata
        objectId: iUserData.objectId, // string
        createdAt: iUserData.createdAt, // number
        updatedAt: iUserData.updatedAt, // number

        // data
        teamId: iUserData.teamId, // string
        userId: iUserData.userId, // string
    };
};

module.exports.convertToIntermediaryFormat = (externalUserData_V0) => {
    // TODO implement when necessary
};
