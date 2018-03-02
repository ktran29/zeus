/// <reference path="./ParseObject_Schema.ts" />

interface Task_V0_Schema extends ParseObject_Schema {
    checklistId: string;
    dueDate: number;
    commentThreadId: string;
    creatorId: string;
    title: string;
    taggedChannelIds: string[];
    assignedChannelIds: string[];
    description: string;
    status: string;
    boardId: string;
}
