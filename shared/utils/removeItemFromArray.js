'use strict';

module.exports = function removeItemFromArray(params) {
    const objectId = params.objectId;
    var array = params.array;

    if(array) {
        const index = array.indexOf(objectId);
        if(index > -1) {
            array.splice(index, 1);
        }
    }
    
    return array || [];
};
