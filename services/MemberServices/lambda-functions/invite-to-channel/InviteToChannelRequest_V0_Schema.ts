/// <reference path="../../shared/object-models/APIRequest_Schema.ts" />

interface InviteToChannelRequest_V0_Schema extends APIRequest_Schema {
    channelId: string;
    teamId: string;
    userIds: string[];
}
