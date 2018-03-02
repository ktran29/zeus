
'use strict';

const promisify = require('promisify-node');
const jsonfile = promisify('jsonfile');
const fs = promisify('fs');
const shell = require('shelljs');
const path = require('path');
const child_process = require('child_process');
require('colors');

//------------------------------------------------------------------------------
// Config
//------------------------------------------------------------------------------

// npm run build && sls deploy --verbose
const serverlessConfigFilePath = '../../serverless-config_generated.json';

// take stage as parameter, defaulting to dev
const stage = process.argv[2] || 'dev';
// take attempts as parameter, defaulting to 1
const attempts = process.argv[3] || 1;

const validStages = [
    'dev',
    'staging',
    'prod'
];
const serviceName = path.basename(shell.pwd().toString());

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

// make sure we're deploying to a valid stage
.then(() => {

    if (!validStages.includes(stage)) {
        throw new Error(`Invalid stage '${stage}'`);
    }
})

// make sure project setup has been run and configured
.then(() => {
    return fs.stat(serverlessConfigFilePath)

    .catch(() => {
        console.log('[deploy-service] Warning: this project has not been configured yet! Running setup...');

        // store directory of current service
        const serviceDir = shell.pwd();

        // move to project directory and run setup
        // (using child_process allows for user input)
        child_process.execSync('cd .. && npm run setup', { stdio: 'inherit' });

        // move back to service directory
        shell.cd(serviceDir);
    });
})

// ------------------------------------------------
// Phase 1: Modify config based on deployment stage
// ------------------------------------------------

.then(() => {
    // open config file
    return jsonfile.readFile(serverlessConfigFilePath)

    .then((configFile) => {

        // set stage
        configFile.stage = stage;

        // set other properties
        switch (stage) {
            case 'dev': {
                configFile.serviceSuffix = `-${configFile.username}`;
                break;
            }
            case 'staging': {
                if (configFile.username !== 'CircleCi') {
                    throw new Error(''
                        + 'Deployment to staging is now handled by CircleCI.'.red
                        + '\n\nIf you would like to deploy, please submit a pull request to merge develop/master into staging/candidate:'.yellow
                        + '\n\thttps://bitbucket.org/tacktechnologies/zeus/pull-requests/new?source=develop/master&dest=staging/candidate'.yellow
                        + '\n'
                    );
                }
                configFile.serviceSuffix = ``;
                break;
            }
            case 'prod': {
                if (configFile.username !== 'CircleCi') {
                    throw new Error(''
                        + 'Deployment to production is now handled by CircleCI.'.red
                        + '\n\nIf you would like to deploy, please submit a pull request to merge staging/candidate into production/release:'.yellow
                        + '\n\thttps://bitbucket.org/tacktechnologies/zeus/pull-requests/new?source=staging/candidate&dest=production/release'.yellow
                        + '\n'
                    );
                }
                configFile.serviceSuffix = ``;
                break;
            }
            default: {
                throw new Error(`Invalid stage '${stage}'. Valid options are ${validStages}`);
            }
        }

        // save file
        return jsonfile.writeFile(serverlessConfigFilePath, configFile);
    });
})

// -----------------------------------------
// Phase 2: Attempt to deploy compiled files
// -----------------------------------------

.then(() => {
    let attemptsLeft = attempts;

    console.log(`[deploy-service] Starting deployment (${attempts} attempts)`);
    console.log(`-----------------------------------------------------------`);

    while (attemptsLeft >= 1) {
        try {
            attemptsLeft -= 1;
            child_process.execSync('serverless deploy', { stdio: 'inherit' });
            break;
        } catch (error) {
            if (attemptsLeft < 1) {
                throw error;
            }

            console.error(error.toString());
            console.error(`[deploy-service] Failed to deploy ${serviceName}, attempting to redeploy ${attemptsLeft} more times...`.yellow);
        }
    }
})

// --------
// Finished
// --------

.then(() => {
    console.log('');
    console.log(`----------------------------------------------------------------------`);
    console.log(`[deploy-service] Successfully deployed ${serviceName} to ${stage} stage`.green);
    console.log(`----------------------------------------------------------------------`);
})
.catch((error) => {
    console.error(error.toString());
    console.log(`--------------------------------------------------------------------`);
    console.error(`[deploy-service] Failed to deploy ${serviceName} to ${stage} stage`.red);
    console.log(`--------------------------------------------------------------------`);
    process.exit(1);
});
