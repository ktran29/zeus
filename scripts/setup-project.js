
'use strict';

// imports
const promisify = require('promisify-node');
const jsonfile = promisify('jsonfile');
const inquirer = require('inquirer');
const shell = require('shelljs');
const child_process = require('child_process');
const fs = promisify('fs');

// -----------------------------------------------------------------------------
// Config
// -----------------------------------------------------------------------------

const configFilePath = 'serverless-config_generated.json';
var config = {
    stage: 'dev'
};

function promptForUsername(defaultValue) {
    return inquirer.prompt([
        {
            type: 'input',
            name: 'username',
            message: `Please enter a username you would like to use:`,
            default: () => defaultValue,
            validate: (value) => !value.match(/\W/) || 'No spaces allowed, please try again'
        }
    ]);
}

// -----------------------------------------------------------------------------
// Main script
// -----------------------------------------------------------------------------

// ------------
// Safety Check
// ------------

// make sure we're running from project folder
return fs.stat('.git')

.catch(() => {
    throw new Error('This script must be run from the project root directory.');
})

// -----------------------
// Step 1: Generate config
// -----------------------

// ensure we have git
.then(() => {
    if (!shell.which('git')) {
        throw new Error('Sorry, this script requires git');
    }
})

.then(() => {
    // use git user name as default username (stripping whitespace)
    const defaultUsername = shell.exec('git config user.name', { silent: true }).replace(/\W/g, '');

    // intro
    shell.echo('This utility will walk you through setting up zeus on your machine.');
    shell.echo('Please enter the following configuration values (defaults are in parentheses)');
    shell.echo('');

    // prompt user for information
    return promptForUsername(defaultUsername);
})

.then((answers) => {
    config.username = answers.username;
    config.serviceSuffix = `-${config.username}`;
})

// generate config file
.then(() => jsonfile.writeFile(configFilePath, config, { spaces: 4 }))

.then(() => {
    shell.echo('');
    shell.echo('Config generated successfully.');
})

// ----------------------------
// Step 2: Install dependencies
// ----------------------------

.then(() => {
    shell.echo('Installing dependencies...');

    // using child_process.execSync instead of shell.exec for colored output
    child_process.execSync('npm install', { stdio: 'inherit' });
})

// --------------
// Setup Finished
// --------------

.then(() => {
    shell.echo('');
    shell.echo('Setup finished.');
});
