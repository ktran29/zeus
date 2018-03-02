/// <reference path="../../shared/object-models/APIRequest_Schema.ts" />

interface UpdateUserRequest_V0_Schema extends APIRequest_Schema {
    firstName?: string;
    lastName?: string;
    middleName?: string;
    userId: string;
}
