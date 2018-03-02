/// <reference path="./ParseObject_Schema.ts" />

interface UserData_V0_Schema extends ParseObject_Schema {
    dismissed: string[];
    channelIds: string[];
    notificationId: string;
    notificationIds: string[];
    prefAnnouncement: boolean[];
    prefDiscussion: boolean[];
    prefMessage: boolean[];
    prefTack: boolean[];
    receivedTaskIds: string[];
    sentTaskIds: string[];
    teamId: string;
    unseen: string[];
    userId: string;
}
