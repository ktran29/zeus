module.exports.convertToLongV0 = (iTeam) => {
    return {
        // metadata
        objectId: iTeam.objectId, //string
        createdAt: iTeam.createdAt, //number
        updatedAt: iTeam.updatedAt, //number

        // data
        name: iTeam.name, //string
        creatorId: iTeam.creatorId, //string
        teamCode: iTeam.code,
        channelIds: iTeam.channelIds,
        memberIds: iTeam.memberIds
    };
};

module.exports.convertToIntermediaryFormat = (externalTeam_V0) => {
    // TODO implement when necessary
};
