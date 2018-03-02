/// <reference path="./ParseObject_Schema.ts" />

interface Discussion_V0_Schema extends ParseObject_Schema {
    commentThreadId: string;
    assignedChannelIds: string[];
    taggedChannelIds: string[];
    itemText: string;
    userId: string;
}
