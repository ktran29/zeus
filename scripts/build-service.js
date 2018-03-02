
'use strict';

const promisify = require('promisify-node');
const typson = require('typson');
const jsonfile = promisify('jsonfile');
const path = require('path');
const fs = promisify('fs');
const FileHound = require('filehound');
const shell = require('shelljs');
const child_process = require('child_process');
const tsc = require('typescript');
require('colors');

//------------------------------------------------------------------------------
// Config
//------------------------------------------------------------------------------

const sourceFileExcludeExpression = new RegExp([
    'node_modules',
    '.*_generated.*'
].join('|'));
const schemaMatchExpression = new RegExp([
    '.*Schema\\.ts$'
].join('|'));
const scriptMatchExpression = new RegExp([
    '.*\\.ts$'
].join('|'));
const dryRun = false;
const verboseLogs = false;
const showBuildInfo = false;

//------------------------------------------------------------------------------
// Compilers
//------------------------------------------------------------------------------

// -------
// Schemas
// -------

// Converts a typescript interface definition to a jsonschema
function compileSchema(definitionsFilePath) {

    const mainInterfaceName = path.basename(definitionsFilePath, '.ts');
    const schemaOutputPath = path.join(path.dirname(definitionsFilePath), mainInterfaceName + '_generated.json');

    const logVerbose = function () {
        if (verboseLogs) {
            console.log.apply(console, arguments);
        }
    };

    const buildInfo = [
        `from (ts schema) < ${definitionsFilePath}`.gray,
        `to (json schema) > ${schemaOutputPath}`.blue
    ];

    // Return immediately with build info
    if (dryRun) {
        return Promise.resolve({
            buildInfo: buildInfo
        });
    }

    return Promise.resolve()

    // Verify input file exists
    .then(() => logVerbose(`| ...verifying...`)
        || fs.stat(definitionsFilePath))

    // Convert definition file into json schema
    .then(() => logVerbose('| ...converting...')
        || typson.schema(definitionsFilePath, mainInterfaceName))

   // Write the schema in a pretty format and pass it along
   .then((schema) => logVerbose('| ...writing...')
       || jsonfile.writeFile(schemaOutputPath, schema, { spaces: 4 })
                  .then(() => schema))

    // Return schema and info
    .then((schema) => logVerbose('| ...done!')
        || {
            schema: schema,
            buildInfo: buildInfo
        })

    // Catch errors
    .catch((error) => {
        throw new Error(`Error: failed to build schema from ${definitionsFilePath}: ${error.message || error}`);
    });
}

// -------
// Scripts
// -------

// Converts a typescript file to javascript
function compileScript(sourceFilePath) {

    const sourceFileName = path.basename(sourceFilePath, '.ts');
    const outputFilePath = path.join(path.dirname(sourceFilePath), sourceFileName + '_generated.js');

    const logVerbose = function () {
        if (verboseLogs) {
            console.log.apply(console, arguments);
        }
    };

    const buildInfo = [
        `from (ts script) < ${sourceFilePath}`.gray,
        `to   (js script) > ${outputFilePath}`.yellow
    ];

    // Return immediately with build info
    if (dryRun) {
        return Promise.resolve({
            buildInfo: buildInfo
        });
    }

    return Promise.resolve()

    // Verify input file exists
    .then(() => logVerbose(`| ...verifying...`)
        || fs.stat(sourceFilePath))

    // Read in its contents
    .then(() => logVerbose(`| ...reading...`)
        || fs.readFile(sourceFilePath, { encoding: 'utf8' }))

    // Convert typescript file into javascript
    .then((sourceFile) => logVerbose('| ...converting...')
        || tsc.transpile(sourceFile))

   // Write the schema in a pretty format and pass it along
   .then((script) => logVerbose('| ...writing...')
       || fs.writeFile(outputFilePath, script)
            .then(() => script))

    // Return schema and info
    .then((script) => logVerbose('| ...done!')
        || {
            script: script,
            buildInfo: buildInfo
        })

    // Catch errors
    .catch((error) => {
        throw new Error(`Error: failed to build script from ${sourceFilePath}: ${error.message || error}`);
    });
}

//------------------------------------------------------------------------------
// Build Script
//------------------------------------------------------------------------------

// ------------
// Safety Check
// ------------

// make sure we're running inside a service folder
return fs.stat('serverless.yml')

.catch(() => {
    throw new Error('This script must be run inside a serverless service directory.');
})

// -----------------------------
// Step 1: Sync shared files
// -----------------------------

.then(() => {
    console.log(`Syncing shared files...`);
    shell.exec('rsync -rv --delete ../../shared/ shared');
    console.log(``);
})

// ----------------------------
// Step 2: Install dependencies
// ----------------------------

.then(() => {
    shell.echo('Installing dependencies...');

    // using child_process.execSync instead of shell.exec for colored output
    child_process.execSync('npm install', { stdio: 'inherit' });
    console.log(``);
})

// ----------------------------
// Step 3: Compile source files
// ----------------------------

.then(() => {
    console.log(`Compiling source now. Any issues will be displayed below.`);
    console.log(`VV -- Issues -- VV`);

    return FileHound
        .create()
        .paths('.')
        .addFilter((file) => !sourceFileExcludeExpression.test(file._pathname))
        .find();
})

.then((filePaths) => Promise.all(
    filePaths.map((path) => {

        if (schemaMatchExpression.test(path)) {

            return compileSchema(path);

        } else if (scriptMatchExpression.test(path)) {

            return compileScript(path);

        } else {

            if (verboseLogs) {
                return {
                    buildInfo: [
                        `skipping ${path}`.dim.gray
                    ]
                };
            } else {
                return {
                    buildInfo: []
                };
            }
        }
    })
))

.then((results) => {
    console.log(`^^ -- Issues -- ^^`);

    if (showBuildInfo) {
        console.log(`All source files compiled, info below.`);

        // log build info
        results
            .map((results) => results.buildInfo)
            .reduce((previous, current) => previous.concat(current), [])
            .forEach((info) => console.log(info));
    } else {
        console.log(`All source files compiled`);
    }
})

// --------
// Finished
// --------

.then(() => {
    console.log('');
    console.log('Build finished');
})

.catch((error) => {
    console.error(error.toString());
    console.log('');
    console.error(`Build failed!`);
    process.exit(1);
});
