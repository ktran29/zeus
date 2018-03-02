/// <reference path="../../shared/object-models/APIRequest_Schema.ts" />

interface GetBoardRequest_V0_Schema extends APIRequest_Schema {
    boardId: string;
    short?: string;
    numberOfUserShorts?: string;
}
