/// <reference path="../../shared/object-models/APIRequest_Schema.ts" />

interface UpdateChecklistItemRequest_V0_Schema extends APIRequest_Schema {
    checklistItemId: string;
    newCompleted: boolean;
    taskId: string;
    teamId: string;
}
