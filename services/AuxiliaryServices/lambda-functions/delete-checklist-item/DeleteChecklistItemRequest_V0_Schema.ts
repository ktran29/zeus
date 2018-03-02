/// <reference path="../../shared/object-models/APIRequest_Schema.ts" />

interface DeleteChecklistItemRequest_V0_Schema extends APIRequest_Schema {
    checklistItemId: string;
    checklistId: string;
    taskId: string;
    teamId: string;
}
