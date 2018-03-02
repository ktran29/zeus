/// <reference path="./ParseObject_Schema.ts" />

interface ChecklistItem_V0_Schema extends ParseObject_Schema {
    assignedUserIds: string[];
    completed: boolean;
    contents: string;
    index: number;
}
