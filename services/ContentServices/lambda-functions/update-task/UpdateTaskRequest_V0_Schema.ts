/// <reference path="../../shared/object-models/APIRequest_Schema.ts" />

interface UpdateTaskRequest_V0_Schema extends APIRequest_Schema {
    taskId: string;
    newDueDate: number;
    taskLastUpdatedDate: number;
}
