'use strict';

const _ = require('lodash');

module.exports = function getUniqueArray(array) {
    return _.uniqBy(_.flattenDeep(array), 'objectId');
};
