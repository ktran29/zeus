/// <reference path="../../shared/object-models/APIRequest_Schema.ts" />

interface CreateAnnouncementRequest_V0_Schema extends APIRequest_Schema {
    userId: string;
    teamId: string;
    text: string;
    assignedChannelIds: string[];
}
