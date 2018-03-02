/// <reference path="../../shared/object-models/APIRequest_Schema.ts" />

interface GetCommentThreadRequest_V0_Schema extends APIRequest_Schema {
    commentThreadId: string;
    includeComments?: string;
    short?: string;
}
