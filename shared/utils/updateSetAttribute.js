'use strict';

module.exports = function updateSetAttribute(set, values) {

    // When storing sets in dynamo, they can be undefined but they can't be empty.
    // This function checks first if the set exists, and then if the desired updated values
    // exist; if either are undefined, dynamo will throw errors so an undefined set must be
    // returned
    var updatedSet = {};

    if(set && values && values.length > 0) {
        set.values = values;
        updatedSet = {
            Action: 'PUT',
            Value: set
        };
    } else {
        set = undefined;
        updatedSet = {
            Action: 'DELETE',
            Value: set
        };
    }

    return updatedSet;
};
