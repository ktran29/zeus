/// <reference path="../../shared/object-models/APIRequest_Schema.ts" />

interface CreateTaskRequest_V0_Schema extends APIRequest_Schema {
    assignedChannelIds: string[];
    assignedUserIds: string[];
    checklistItemTexts: string[];
    creatorId: string;
    description: string;
    dueDate: number;
    titleText: string;
    teamId: string;
    taggedChannelIds: string[];
    boardId?: string;
    laneId?: string;
}
