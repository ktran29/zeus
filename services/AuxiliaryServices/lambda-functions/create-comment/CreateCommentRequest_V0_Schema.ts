/// <reference path="../../shared/object-models/APIRequest_Schema.ts" />

interface CreateCommentRequest_V0_Schema extends APIRequest_Schema {
    commentThreadId: string;
    commentText: string;
    userId: string;
    teamId: string;
}
