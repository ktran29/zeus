'use strict';

/*
In order to avoid problems with 'this' keyword. Make sure you initialize with new()
*/

module.exports = function () {

    this.notificationType = '';
    this.actors = [];
    this.subjects = {};

    // Sets type of notification to passed in string value
    this.setType = function(newType) {
        this.notificationType = newType;
    };

    // Adds an actor to the actors array. Also checks if data is valid.
    this.addActor = function(actor) {
        if (!actor.objectId || !actor.firstName || !actor.lastName) {
            console.log(`Attempted to add an actor to this notification but passed in incorrect information; \n objectId  : ${actor.objectId} \n firstName : ${actor.firstName} \n lastName  : ${actor.lastName}`);
            return;
        }

        this.actors.push(actor);
    };

    // Adds multiple actors. NOTE this isn't really used by anything atm.
    this.addActors = function(actors) {
        for (var actor in actors) {
            this.addActor(actor);
        }
    };

    // Adds an item to a specified subjectType. If the type doesn't exist,
    // an array will be added for it. If it does, item will be appended.
    // The item is not validated. Can be of any object.
    this.addToSubject = function(subjectType, newItem) {
        if (!this.subjects[subjectType]) {
            this.subjects[subjectType] = [];
        }

        this.subjects[subjectType].push(newItem);
    };

    // Adds multiple items to specified subjectType.
    // The items are not validated. Can be of any object.
    this.addMultipleToSubject = function(subjectType, newItems) {
        for (var item in newItems) {
            this.addToSubject(subjectType, item);
        }
    };

    this.getDebugData = function() {
        var debugInfo = `${this.notificationType} \n ${this.actors} \n ${this.subjects}`;
        console.log(debugInfo);
    };

    //  Returns a boolean indicating if this instance has sufficient data to be published.
    this.validate = function() {
        return this.notificationType && this.subjects;
    };

    return this;
};
