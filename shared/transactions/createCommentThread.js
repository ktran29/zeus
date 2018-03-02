'use strict';

const actions = {
    createCommentThread: require('../actions/createCommentThread.js'),
    getCommentThreadById: require('../actions/getCommentThreadById.js')
};

module.exports = () => {

    // No parameters

    return actions.createCommentThread()

        .then((result) => {
            // Extract results
            const objectId = result.objectId;
            return actions.getCommentThread(objectId);
        })

        .then((result) => {
            // Extract results
            const iCommentThread = result.iCommentThread;
            return {
                iCommentThread: iCommentThread
            };
        });

};
