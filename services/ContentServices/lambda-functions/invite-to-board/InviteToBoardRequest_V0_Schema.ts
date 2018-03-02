/// <reference path="../../shared/object-models/APIRequest_Schema.ts" />

interface InviteToBoardRequest_V0_Schema extends APIRequest_Schema {
    userIds: string[];
    teamId: string;
    boardId: string;
}
