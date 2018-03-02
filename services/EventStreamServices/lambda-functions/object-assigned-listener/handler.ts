'use strict';

const transactions = {
    objectAssignedEventHandler: require('../../shared/transactions/objectAssignedEventHandler.js')
}

const stringifyObject = require('../../shared/utils/stringifyObject.js');
const DynamoEventStreamHandler = require('../../shared/utils/DynamoEventStreamHandler.js');

const TAG = '[Lambda createNotification]';

module.exports.handler = new DynamoEventStreamHandler((records) => {

    console.log(TAG, `Handling ${records.length} records...`);

    const initialPromiseChain = new Promise((resolve) => resolve());

    return records.reduce((promiseChain, record) => {

        const operation = record.eventName;

        console.log(TAG, 'Handling record:', stringifyObject(record));

        switch(operation) {
            case 'INSERT': {
                const objectInfo = record.dynamodb.NewImage;
                const objectType = objectInfo.objectType.S;
                const objectId = objectInfo.objectId.S;

                return transactions.objectAssignedEventHandler({
                    objectType: objectType,
                    objectInfo: objectInfo,
                    objectId: objectId,
                    operation: operation,
                    event: record,
                });
            }

            case 'REMOVE': {
                const objectInfo = record.dynamodb.OldImage;

                return promiseChain;
            }

            default: {
                console.log(`Skipping unsupported operation: ${operation}`);
                return promiseChain;
            }
        }
    }, initialPromiseChain);
});
