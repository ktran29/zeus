/// <reference path="./ParseObject_Schema.ts" />

interface Lane_V0_Schema extends ParseObject_Schema {
    name: string;
    boardId: string;
    taskIds: string[];
}
