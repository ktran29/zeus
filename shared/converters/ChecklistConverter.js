module.exports.convertToLongV0 = (iChecklist) => {
    return {
        // metadata
        objectId: iChecklist.objectId, //string
        createdAt: iChecklist.createdAt, //number
        updatedAt: iChecklist.updatedAt //number

    };
};

module.exports.convertToShortV0 = (iChecklist) => {
    return {
        objectId: iChecklist.objectId, //string
        createdAt: iChecklist.createdAt, //number
        updatedAt: iChecklist.updatedAt, //number
        numberOfItems: iChecklist.numberOfItems, //number
        numberOfCompletedItems: iChecklist.numberOfCompletedItems //number
    };
}

module.exports.convertToIntermediaryFormat = (externalChecklist_V0) => {
    // TODO implement when necessary
};
