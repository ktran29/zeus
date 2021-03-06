/// <reference path="../../shared/object-models/APIRequest_Schema.ts" />

interface GetDiscussionRequest_V0_Schema extends APIRequest_Schema {
    userId: string;
    teamId: string;
    short?: string;
    returnAsObjects?: string;
}
