/// <reference path="../../shared/object-models/APIRequest_Schema.ts" />

interface CreateBoardRequest_V0_Schema extends APIRequest_Schema {
    creatorId: string;
    teamId: string;
    name: string;
    memberIds?: string[];
}
