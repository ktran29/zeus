'use strict';

module.exports = function stringifyObject(object) {

    let indent = '';

    if (typeof object === 'function') {
        return object.toString();
    }

    let objectText = JSON.stringify(object);

    if (!objectText) {
        return objectText;
    }

    return objectText.replace(/([[{])|(,)|([\]}])/g, function (match, pOpen, pNext, pClose) {
        if (pOpen) {
            indent += '\t';
            return pOpen + '\n' + indent;
        } else if (pNext) {
            return pNext + '\n' + indent;
        } else {
            indent = indent.slice(0, -1);
            return '\n' + indent + pClose;
        }
    });
};
