/// <reference path="../../shared/object-models/APIRequest_Schema.ts" />

interface GetChecklistRequest_V0_Schema extends APIRequest_Schema {
    checklistId: string;
    includeItems?: string;
    short?: string;
}
