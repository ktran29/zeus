/// <reference path="../../shared/object-models/APIRequest_Schema.ts" />

interface MarkUnseenRequest_V0_Schema extends APIRequest_Schema {
    objectIds: string[];
    userIds: string[];
    teamId: string;
    updatedAt: number;
}
