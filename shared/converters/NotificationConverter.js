// TODO: finalize schema
const convertTo_V0 = (iNotification) => {
    return {
        // metadata
        objectId: iNotification.objectId, // string
        createdAt: iNotification.createdAt, // number
        updatedAt: iNotification.updatedAt, // number

        // data
        attributes: iNotification.attributes, //string
        objectType: iNotification.objectType, //string
        operation: iNotification.operation, //string
    };
};

const convert_V0_ToIntermediaryFormat = (notification_V0) => {
    // TODO implement when necessary
};

module.exports = {
    convertTo_V0: convertTo_V0,
    convert_V0_ToIntermediaryFormat: convert_V0_ToIntermediaryFormat
};
