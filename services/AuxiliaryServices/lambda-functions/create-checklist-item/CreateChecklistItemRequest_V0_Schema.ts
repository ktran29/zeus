/// <reference path="../../shared/object-models/APIRequest_Schema.ts" />

interface CreateChecklistItemRequest_V0_Schema extends APIRequest_Schema {
    checklistId: string;
    description: string;
    userId: string;
}
