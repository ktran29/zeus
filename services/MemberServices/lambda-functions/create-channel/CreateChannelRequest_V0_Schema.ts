/// <reference path="../../shared/object-models/APIRequest_Schema.ts" />

interface CreateChannelRequest_V0_Schema extends APIRequest_Schema {
    teamId: string;
    channelName: string;
    creatorId: string;
    memberIds?: string[];
}
