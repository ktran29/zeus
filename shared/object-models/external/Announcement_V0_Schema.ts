/// <reference path="./ParseObject_Schema.ts" />

interface Announcement_V0_Schema extends ParseObject_Schema {
    teamId: string;
    text: string;
    assignedChannelIds: string[];
    taggedChannelIds: string[];
    creatorId: string;
}
