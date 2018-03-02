module.exports.convertToLongV0 = (iChecklistItem) => {
    return {
        // metadata
        objectId: iChecklistItem.objectId, //string
        createdAt: iChecklistItem.createdAt, //number
        updatedAt: iChecklistItem.updatedAt, //number

        // data
        checklistId: iChecklistItem.checklistId, //string
        completed: iChecklistItem.completed, //boolean
        contents: iChecklistItem.description, //string
        index: iChecklistItem.index //number
    };
};

module.exports.convertToIntermediaryFormat = (externalChecklistItem_V0) => {
    // TODO implement when necessary
};
