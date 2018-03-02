/// <reference path="../../shared/object-models/APIRequest_Schema.ts" />

interface GetCommentRequest_V0_Schema extends APIRequest_Schema {
    commentThreadId: string;
    before?: string;
    max?: string;
}
