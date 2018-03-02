'use strict';

const AWS = require('aws-sdk');

const generateUniqueIdentifier = require('../utils/generateUniqueIdentifier.js');

const ActionRequestHandler = require('../../shared/utils/ActionRequestHandler.js');

module.exports = new ActionRequestHandler(__filename, (parentObjectId) => {

    const dynamoDB = new AWS.DynamoDB.DocumentClient();

    const objectId = generateUniqueIdentifier();

    return dynamoDB.put({
        TableName: 'Checklists',
        Item: {
            objectId: objectId,
            createdAt: Date.now(),
            updatedAt: Date.now(),
            parentObjectId: parentObjectId
        }
    })

    .promise()

    .then(() => {
        const iChecklist = {
            objectId: objectId,
            createdAt: Date.now(),
            updatedAt: Date.now()
        };
        console.log('Checklist created succesfully');
        return {
            iChecklist: iChecklist
        };
    });

});
