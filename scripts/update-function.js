'use strict';

const promisify = require('promisify-node');
const child_process = require('child_process');
const fs = promisify('fs');

//------------------------------------------------------------------------------
// Config
//------------------------------------------------------------------------------

// take function name as parameter
const functionName = process.argv[2];

function showUsage() {
    console.log('usage: npm run update-function <functionName>\n');
}

//------------------------------------------------------------------------------
// Main Script
//------------------------------------------------------------------------------

return Promise.resolve()

// ------------
// Safety Check
// ------------

// make sure a name was supplied
.then(() => {
    if (!functionName) {
        showUsage();
        throw new Error('A function name must be supplied');
    }
})

// make sure we're running inside a service folder
.then(() => {
    return fs.stat('serverless.yml')

    .catch(() => {
        throw new Error('This script must be run inside a serverless service directory.');
    });
})

// ------------------------------
// Phase 1: Do a clean build
// ------------------------------

.then(() => {
    console.log('Performing a clean build...');
    child_process.execSync('npm run rebuild', { stdio: 'inherit' });
})

// ------------------------------
// Phase 2: Deploy function
// ------------------------------

.then(() => {
    console.log('Starting deployment...');
    child_process.execSync(`serverless deploy function -f ${functionName}`, { stdio: 'inherit' });
})

// ------------------------------
// Phase 3: Finished
// ------------------------------

.then(() => {
    console.log('Deploy successful');
})

.catch((error) => {
    console.error(error.toString());
    console.error(`Deployment failed!`);
});
