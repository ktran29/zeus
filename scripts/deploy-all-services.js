
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

// take stage as parameter, defaulting to dev
const stage = process.argv[2] || 'dev';
// take attempts as parameter, defaulting to 1
const attempts = process.argv[3] || 1;

const deployments = [];

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
    console.log(`[deploy-all-services] Attempting to deploy the following services to '${stage}' stage:`, '\n\t' + serviceNames.join('\n\t') + '\n');

    let currentDeployment = 0;
    const totalDeployments = servicePaths.length;

    servicePaths.every((servicePath) => {
        const service = path.basename(servicePath);
        const cd_to_service = `cd ${servicePath}`;
        const bash_get_timestamp = 'sls deploy list | grep Timestamp | sed -E "s,.*Timestamp: ([0-9]+)$,\\1," | tail -1';
        const removeNewlines = (s) => s.replace(/\n/g, '');

        // get the timestamp of the last successful deployment
        const timestamp = removeNewlines(shell.exec(`${cd_to_service} && ${bash_get_timestamp}`, { silent: true }));

        // attempt to deploy
        currentDeployment += 1;
        if (shell.exec(`${cd_to_service} && npm run deploy:already-built ${stage} ${attempts}`).code !== 0) {
            console.error(`[deploy-all-services] Error deploying ${service}, rolling back previous deployments...`.yellow);

            // bail bail bail
            throw new Error(`failed to deploy ${service}`);
        }

        console.log(`[deploy-all-services] Deployed service ${currentDeployment} of ${totalDeployments}`);

        // store successful deployment info in case we need to roll back
        deployments.push({
            service: service,
            servicePath: servicePath,
            timestamp: timestamp
        });

        // keep going
        return true;
    });
})

//------------------------------------------
// Step 3: finished OR rollback if necessary
//------------------------------------------

.then(() => {
    console.log('');
    console.log('[deploy-all-services] Successfully deployed all services'.green);
})

.catch((deploymentError) => {

    return Promise.resolve()

    .then(() => {
        const failedRollbacks = [];

        deployments.every((deployment) => {
            const service = deployment.service;
            const servicePath = deployment.servicePath;
            const timestamp = deployment.timestamp;

            if (!timestamp) {
                console.warn(`No previous deployment found for ${service}, skipping rollback`);
                return true;
            }

            console.log(`Rolling back ${service} to deployment with timestamp ${timestamp}...`);

            if (shell.exec(`cd ${servicePath} && sls rollback -t ${timestamp}`).code !== 0) {
                console.error(`Error: failed to rollback ${service}!`.red);

                // rollback failed. save info and try to remaining rollbacks
                failedRollbacks.push(deployment);
            }

            return true;
        });

        if (failedRollbacks.length) {
            const info = failedRollbacks.map((deployment) => JSON.stringify(deployment)).join('\n');
            throw new Error(`Failed to rollback deployment(s):\n${info}`);
        }
    })

    .then(() => {
        console.error('');
        console.error(deploymentError.toString());
        console.error(`[deploy-all-services] Failed to deploy all services, previous deployments were restored`.yellow);
        process.exit(1);
    })

    .catch((rollbackError) => {
        console.error('');
        console.error(rollbackError.toString());
        console.error(`[deploy-all-services] Failed to deploy all services, not all previous deployments were restored`.red);
        process.exit(1);
    });
});
