
'use strict';

const promisify = require('promisify-node');
const fs = promisify('fs');
const shell = require('shelljs');
const FileHound = require('filehound');
const path = require('path');
require('colors');

//------------------------------------------------------------------------------
// Config
//------------------------------------------------------------------------------

//------------------------------------------------------------------------------
// Main Script
//------------------------------------------------------------------------------

// ------------
// Safety Check
// ------------

// make sure we're running from project folder
return fs.stat('.git')

.catch(() => {
    throw new Error('This script must be run from the project root directory.');
})

//-------------------------------------
// Step 1: determine services to deploy
//-------------------------------------
.then(() => {
    return FileHound
        .create()
        .path('services')
        .directory()
        .depth(1)
        .find();
})

//---------------------------------------
// Step 2: attempt to deploy each service
//---------------------------------------
.then((servicePaths) => {
    const serviceNames = servicePaths.map((servicePath) => path.basename(servicePath));
    console.log(`Attempting to build the following services:`, '\n\t' + serviceNames.join('\n\t') + '\n');

    servicePaths.every((servicePath) => {
        const service = path.basename(servicePath);
        const cd_to_service = `cd ${servicePath}`;

        // attempt to build
        if (shell.exec(`${cd_to_service} && npm run build`).code !== 0) {
            shell.echo(`Error building ${service}, bailing...`);

            // bail bail bail
            throw new Error(`Error: failed to build ${service}`);
        }

        // all is well, keep going
        return true;
    });
})

//------------------------------------------
// Step 3: finished
//------------------------------------------

.then(() => {
    console.log('');
    console.log('Successfully built all services');
});
