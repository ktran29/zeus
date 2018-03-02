/// <reference path="../../shared/object-models/APIRequest_Schema.ts"/>

interface CreateDiscussionRequest_V0_Schema extends APIRequest_Schema {
    creatorId: string;
    assignedChannelIds: string[];
    originalPostText: string;
    teamId: string;
}
