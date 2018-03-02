'use strict';

const transactions = {
    boardEventHandler: require('../../shared/transactions/boardEventHandler.js')
}

const stringifyObject = require('../../shared/utils/stringifyObject.js');
const DynamoEventStreamHandler = require('../../shared/utils/DynamoEventStreamHandler.js');

const TAG = '[Lambda createNotification]';

module.exports.handler = new DynamoEventStreamHandler((records) => {

    console.log(TAG, `Handling ${records.length} records...`);

    const initialPromiseChain = new Promise((resolve) => resolve());

    return records.reduce((promiseChain, record) => {

        const operation = record.eventName;
        const objectInfo = record.dynamodb.NewImage || record.dynamodb.OldImage;

        return transactions.boardEventHandler({
            operation: operation,
            objectInfo: objectInfo
        })

    }, initialPromiseChain);
});
