
module.exports.convertToLongV0 = (iUser) => {
    return {
        // metadata
        objectId:   iUser.objectId, // string
        createdAt:  iUser.createdAt, // number
        updatedAt:  iUser.updatedAt, // number

        // data
        activeTeamId:   iUser.activeTeamId || '', // string
        email:          iUser.email, // string
        firstName:      iUser.firstName || '', // string
        lastName:       iUser.lastName || '', // string
        middleName:     iUser.middleName || '', // string
        profilePicture: iUser.profilePicture, // File
    };
};

module.exports.convertToShortV0 = (iUser) => {
    return {
        objectId:   iUser.objectId, // string
        firstName:      iUser.firstName || '', // string
        lastName:       iUser.lastName || '', // string
        middleName:     iUser.middleName || '', // string
        profilePicture: iUser.profilePicture, // File
    };
};

module.exports.convertToIntermediaryFormat = (externalUser_V0) => {
    // TODO implement when necessary
};
