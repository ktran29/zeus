'use strict';

const actions = {
    deleteDynamoObject: require('../actions/deleteDynamoObject.js'),
    getCommentById: require('../actions/getCommentById.js'),
    getCommentThreadById: require('../actions/getCommentThreadById.js'),
    putUpdateField: require('../actions/putUpdateField.js')
};

module.exports = (params) => {

    const commentId = params.commentId;

    return actions.getCommentById(commentId)

    .then((result) => {
        const iComment = result.iComment;
        const commentThreadId = iComment.commentThreadId;

        return actions.getCommentThreadById(commentThreadId);
    })

    .then((result) => {
        const iCommentThread = result.iCommentThread;
        const parentObjectId = iCommentThread.parentObjectId;
        const parentObjectType = iCommentThread.parentObjectType;

        if(parentObjectType === 'DISCUSSION') {
            var tableName = 'Discussions';
        } else {
            tableName = 'Tasks';
        }

        return Promise.all([
            actions.putUpdateField({
                tableName: tableName,
                objectId: parentObjectId
            }),
            actions.putUpdateField({
                tableName: 'CommentThreads',
                objectId: iCommentThread.objectId
            })
        ]);
    })

    .then(() => {
        return actions.deleteDynamoObject({
            tableName: 'Comments',
            objectId: commentId
        });
    })

    .then((result) => {
        const success = result.constructor === Object && Object.keys(result).length === 0;

        console.log('Successfully deleted comment');
        return {
            success: success
        };
    });

};
