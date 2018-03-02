module.exports.convertToLongV0 = (iAnnouncement) => {
    return {
        // metadata
        objectId: iAnnouncement.objectId, // string
        createdAt: iAnnouncement.createdAt, // number
        updatedAt: iAnnouncement.updatedAt, // number

        // data
        text: iAnnouncement.text, //string
        assignedChannelIds: iAnnouncement.assignedChannelIds,
        taggedChannelIds: iAnnouncement.taggedChannelIds,
        sentBy: iAnnouncement.creatorId, //string
        teamId: iAnnouncement.teamId
    };
};

module.exports.convertToShortV0 = (iAnnouncement) => {
    return {
        objectId: iAnnouncement.objectId,
        createdAt: iAnnouncement.createdAt,
        updatedAt: iAnnouncement.updatedAt,
        text: iAnnouncement.text
    };
};

module.exports.convertToIntermediaryFormat = (externalAnnouncement_V0) => {
    // TODO implement when necessary
};
