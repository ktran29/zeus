
'use strict';

const promisify = require('promisify-node');
const FileHound = require('filehound');
const fs = promisify('fs');
require('colors');

//------------------------------------------------------------------------------
// Config
//------------------------------------------------------------------------------

// const regExpMatchesToIgnore = new RegExp([
// ].join('|'));

const deleteFile = (path) => {
    if (dryRun) {
        return Promise.resolve();
    }

    return fs.unlink(path);
};

const dryRun = false;
const showInfo = false;

//------------------------------------------------------------------------------
// Main Script
//------------------------------------------------------------------------------

// ------------
// Safety Check
// ------------

// make sure we're running inside a service folder
return fs.stat('serverless.yml')

.catch(() => {
    throw new Error('This script must be run inside a serverless service directory.');
})

// -------------------------------
// Phase 1: Remove generated files
// -------------------------------

.then(() => {
    console.log(`Removing generated files...`);

    return FileHound
        .create()
        .paths('.')
        // .discard(regExpMatchesToIgnore)
        .match('*_generated*')
        .find();
})

.then((filePaths) => Promise.all(
    filePaths.map((path) => {
        if (showInfo) console.log(`deleting ${path}`.gray);

        return deleteFile(path);
    })
))

// --------
// Finished
// --------

.then(() => {
    console.log('');
    console.log(`Clean successful`);
})

.catch((error) => {
    console.error(error.toString());
    console.log('');
    console.error(`Clean failed!`);
});
