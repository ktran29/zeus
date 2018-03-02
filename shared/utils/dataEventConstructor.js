'use strict';

/*
In order to avoid problems with 'this' keyword. Make sure you initialize with new()
*/

module.exports = function () {
    this.dataEvent = {};

    this.addObject = function(objectType, objectId, updatedAt) {
        if (!this.dataEvent[objectType]) {
            this.dataEvent[objectType] = {};
        }

        this.dataEvent[objectType][objectId] = {
            updatedAt: updatedAt
        };
    };

    this.getDataEvent = () => Object.assign({}, this.dataEvent);

    return this;
};


// const users = [user];
// const channels = [channel];
//
// users.forEach((user) => dataEvent.addObject('USER', user.objectId, user.updatedAt));
// channels.forEach((channel) => dataEvent.addObject('CHANNEL', channel.objectId, channel.updatedAt));
