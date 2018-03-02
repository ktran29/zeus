/// <reference path="../../shared/object-models/APIRequest_Schema.ts" />

interface GetUserRequest_V0_Schema extends APIRequest_Schema {
    teamId: string;
    short?: string;
    returnAsObjects?: string;
}
