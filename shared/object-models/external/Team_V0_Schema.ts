/// <reference path="./ParseObject_Schema.ts" />

interface Team_V0_Schema extends ParseObject_Schema {
    assignedChannelIds: string[];
    name: string;
    userIds: string[];
    teamCode: number;
}
