interface User_Schema {
    // metadata
    objectId: string;
    createdAt: number;
    updatedAt: number;

    // data
    activeTeamId: string;
    email: string;
    firstName: string;
    lastName: string;
    middleName: string;
    profilePicture: any;
    teamIds: string[];
    username: string;
}
