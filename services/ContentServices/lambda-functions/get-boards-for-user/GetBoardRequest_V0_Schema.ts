/// <reference path="../../shared/object-models/APIRequest_Schema.ts" />

interface GetBoardRequest_V0_Schema extends APIRequest_Schema {
    teamId: string;
    userId: string;
    short?: string;
}
