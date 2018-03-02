'use strict';

const transactions = {
    boardMembershipEventHandler: require('../../shared/transactions/boardMembershipEventHandler.js'),
    channelMembershipEventHandler: require('../../shared/transactions/channelMembershipEventHandler.js'),
    teamMembershipChangeHandler: require('../../shared/transactions/teamMembershipChangeHandler.js')

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

        const objectType = objectInfo.objectType.S;

        switch(objectType) {
            case 'BOARD': {
                return transactions.boardMembershipEventHandler({
                    operation: operation,
                    objectInfo: objectInfo
                })
            }

            case 'CHANNEL': {
                return transactions.channelMembershipEventHandler({
                    operation: operation,
                    objectInfo: objectInfo
                });
            }

            case 'TEAM': {
                return transactions.teamMembershipChangeHandler({
                    operation: operation,
                    objectInfo: objectInfo
                })
            }

            default: {
                console.log(`Skipping unsupported type: ${objectType}`);
                return promiseChain;
            }
        }
    }, initialPromiseChain);
});
