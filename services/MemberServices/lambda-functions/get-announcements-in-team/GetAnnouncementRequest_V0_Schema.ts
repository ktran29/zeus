/// <reference path="../../shared/object-models/APIRequest_Schema.ts" />

interface GetAnnouncementRequest_V0_Schema extends APIRequest_Schema {
    teamId: string;
    channels?: string;
    returnAsObjects?: string;
}
