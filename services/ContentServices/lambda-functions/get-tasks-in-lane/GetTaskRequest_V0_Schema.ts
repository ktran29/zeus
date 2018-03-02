/// <reference path="../../shared/object-models/APIRequest_Schema.ts" />

interface GetTaskRequest_V0_Schema extends APIRequest_Schema {
    laneId: string;
    returnAsObjects?: string;
    short?: string;
}
