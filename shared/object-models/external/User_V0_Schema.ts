/// <reference path="./ParseObject_Schema.ts" />

interface User_V0_Schema extends ParseObject_Schema {
    activeTeamId: string;
    email: string;
    firstName: string;
    lastName: string;
    middleName: string;
    profilePicture: any;
    teamIds: string[];
    username: string;
}
