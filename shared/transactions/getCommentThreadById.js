'use strict';

const actions = {
    getCommentThreadById: require('../actions/getCommentThreadById.js'),
    getCommentsInThread: require('../actions/getCommentsInThread.js')
};

module.exports = (params) => {

    // Extract parameters
    const commentThreadId = params.commentThreadId;
    const includeComments = params.includeComments;

    var iCommentThread;

    return actions.getCommentThreadById(commentThreadId)

    .then((result) => {
        // Extract results
        iCommentThread = result.iCommentThread;


        return actions.getCommentsInThread({
            commentThreadId: commentThreadId
        });

    })

    .then((result) => {
        // Extract results
        const iComments = result.iComments;
        iCommentThread.numberOfComments = iComments.length;
        iCommentThread.commentIds = iComments.map((iComment) => iComment.objectId) || [];

        if(includeComments) {
            return {
                iCommentThread: iCommentThread,
                iComments: iComments
            };
        } else {
            return {
                iCommentThread: iCommentThread
            };
        }
    });

};
