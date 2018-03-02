/// <reference path="./ParseObject_Schema.ts" />

interface Channel_V0_Schema extends ParseObject_Schema {
    announcementIds: string[];
    discussionIds: string[];
    memberIds: string[];
    name: string;
    teamId: string;
}
