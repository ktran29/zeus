/// <reference path="../../shared/object-models/APIRequest_Schema.ts" />

interface SwurveTaskRequest_V0_Schema extends APIRequest_Schema {
    taskId: string;
    newLanePosition: number;
    newLaneId?: string;
    laneId: string;
    currentBoardId?: string;
}
