/// <reference path="./ParseObject_Schema.ts" />

interface Board_V0_Schema extends ParseObject_Schema {
    name: string;
    laneIds: string[];
    memberIds: string[];
}
