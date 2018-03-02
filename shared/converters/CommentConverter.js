module.exports.convertToLongV0 = (iComment) => {
    return {
        // metadata
        objectId: iComment.objectId, //string
        createdAt: iComment.createdAt, //number
        updatedAt: iComment.updatedAt, //number

        // data
        authorId: iComment.authorId,
        body: iComment.commentText
    };
};

module.exports.convertToIntermediaryFormat = (externalComment_V0) => {
    // TODO implement when necessary
};
