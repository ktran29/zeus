
const firebase = require('firebase');

const getFirebase = () => {
    // Check if already initialized
    if (firebase.apps.length > 0) {
        return firebase;
    }

    const app = firebase.initializeApp({
        apiKey: 'AIzaSyBVdpaevXrCOfzt07GNKM2SaWHyJwRIsXo',
        authDomain: 'tack-1227.firebaseapp.com',
        databaseURL: 'https://tack-1227.firebaseio.com',
        projectId: 'tack-1227',
        storageBucket: 'tack-1227.appspot.com',
        messagingSenderId: '67213330256'
    });
    console.log('[Firebase]', `initialized ${app.name} app`);

    return firebase;
};

//------------------------------------------------------------------------------
// Update
//------------------------------------------------------------------------------

const updateDevice = (userId, deviceId, update) => {
    const database =  getFirebase().database();
    const dataPath = `/userSockets/${userId}/device/${deviceId}`;

    return database.ref(dataPath).update(update)

    .then(() =>
        console.log('[Firebase] added updated deviceId: ', deviceId)
    );
};

const updateUser = (userId, update) => {
    if (!userId || !update) {
        console.log('[updateUser] undefined parameters, returning early');
        return Promise.resolve();
    }

    const database =  getFirebase().database();

    // retrieve all devices and notify each of the new notification
    return database.ref(`/userSockets/${userId}/device`).once('value')

    .then((snapshot) => {
        const deviceMap = snapshot.val();
        const devices = Object.keys(deviceMap || {});

        if (devices.length > 0) {
            console.log('[Firebase] found', devices.length, 'devices for', userId, ':', devices);
        }

        return Promise.all(
            devices.map((deviceId) => updateDevice(userId, deviceId, update))
        );
    });
};

const updateUsers = (userIds, dataEvent) => {
    if (!userIds || !dataEvent) {
        console.log('[updateUsers] undefined parameters returning early');
        console.log('[updateUsers] userIds: ', userIds, '\ndataEvent:', dataEvent);

        return Promise.resolve();
    }

    console.log(`[Firebase] updating users of new data event for ${userIds.length} users: `);
    console.log(`DataEvent: `, dataEvent);

    const update = decontructDataEventToUpdate(dataEvent);

    return Promise.all(
        userIds.map((userId) => updateUser(userId, update))
    );
};

const massUpdate = (payloads) => {
    if (!payloads) {
        console.log('[paylods] undefined parameters returning early');
        return Promise.resolve();
    }

    console.log(`[Firebase] Mass updating ${payloads.length} payload(s)`);

    return Promise.all(
        payloads.map((payload) => updateUsers(payload.targets, payload.dataEvent))
    );
};

const decontructDataEventToUpdate = (dataEvent) => {
    var updates = {};
    Object.keys(dataEvent).forEach((objectType) => {
        const objects = dataEvent[objectType];

        Object.keys(objects).forEach((objectId) => {
            const objectInfo = objects[objectId];

            // 'USER/userId' = { updatedAt: ... }
            updates[`${objectType}/${objectId}`] = objectInfo;
        });
    });

    return updates;
};

module.exports = {
    updateUsers: updateUsers,
    massUpdate: massUpdate
};
