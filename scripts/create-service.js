
'use strict';

const promisify = require('promisify-node');
const jsonfile = promisify('jsonfile');
const fs = promisify('fs');
const child_process = require('child_process');
const shell = require('shelljs');
const path = require('path');
const json2yaml = require('json2yaml');

//------------------------------------------------------------------------------
// Config
//------------------------------------------------------------------------------

const sourceDir = 'services';
const scriptsDir = 'scripts';

// Safety check: make sure arguments are valid
const serviceName = process.argv[2];
if (!serviceName) {
    console.error('Error: invalid parameters');
    console.log('');
    showUsage();
    return;
}

const servicePath = path.join(sourceDir, serviceName);
const scriptsPathFromService = path.relative(servicePath, scriptsDir);

const serverlessConfig = {
    service: serviceName + '${self:custom.config.serviceSuffix}',
    custom: {
        config: '${file(../../serverless-config_generated.json)}'
    },
    provider: {
        name: 'aws',
        runtime: 'nodejs4.3',
        stage: '${self:custom.config.stage}',
        profile: 'serverless-dev',
        region: 'us-east-1',
        role: 'arn:aws:iam::056701433599:role/lambda_basic_execution',
        cfLogs: true
    },
    package: {
        include: [
        ],
        exclude: [
            '\'*.ts\''
        ]
    },
    functions: {
        helloWorld: {
            name: '${self:custom.functionPrefix}helloWorld',
            handler: 'lambda-functions/hello-world/handler_generated.handler',
            events: [
                { http: {
                    path: '/{apiVersion}/echo/hello-world',
                    method: 'post'
                } },
                { http: {
                    path: '/{apiVersion}/echo/hello-world',
                    method: 'get'
                } }
            ]
        }
    }
};

// overwrites package.json defaults for new services
// make sure the dependencies here are up to date
const packageConfig = {
    'version': '0.0.0',
    'main': 'handler.js',
    'scripts': {
        'test': 'echo "Error: no test specified" && exit 1',
        'build': `node --harmony ${scriptsPathFromService}/build-service.js`,
        'clean': `node --harmony ${scriptsPathFromService}/clean-service.js`,
        'deploy': `npm run rebuild && node --harmony ${scriptsPathFromService}/deploy-service.js`,
        'deploy:already-built': `node --harmony ${scriptsPathFromService}/deploy-service.js`,
        'update-function': `node --harmony ${scriptsPathFromService}/update-function.js`,
        'rebuild': 'npm run clean && npm run build'
    },
    'author': '',
    'license': 'ISC',
    'dependencies': {
        'dynamodb-marshaler': '^2.0.0',
        'firebase-admin': '^4.1.3',
        'jsonschema': '^1.1.1',
        'lodash': '^4.17.4',
        'underscore': '^1.8.3'
    },
    'devDependencies': {
        'babel-cli': '^6.24.1'
    }
};

// -----------------------------------------------------------------------------
// Main script
// -----------------------------------------------------------------------------

// start that promise chain
return Promise.resolve()

// make sure the service doesn't already exist
.then(() => {
    return fs.stat(servicePath)

    // K this code is a bit weird. We EXPECT an error to be thrown here so our
    // success and fail blocks gotta be switched here.
    .then(
        () => {
            // file found, bail
            throw new Error(`${serviceName} already exists!`);
        },
        () => {
            // file not found, good let's continue
        }
    );
})

// make sure we're running from project folder
.then(() => {
    return fs.stat('.git')

    .catch(() => {
        throw new Error('This script must be run from the project root directory.');
    });
})


// -------------------------------------
// Step 1: Create the serverless service
// -------------------------------------

.then(() => {
    child_process.execSync(`serverless create --template aws-nodejs --path ${servicePath} --name ${serviceName}`, { stdio: 'inherit' });
})

// -----------------
// Step 2: Setup npm
// -----------------

.then(() => {
    // move to service dir and initialize npm
    child_process.execSync(`cd ${servicePath} && npm init -y > /dev/null`, { stdio: 'inherit' });

    // update package.json
    return jsonfile.readFile(`${servicePath}/package.json`);
})

.then((packageFile) => {

    // npm package names must be kebab-case
    packageFile.name = convertToKebabCase(serviceName);

    // merge with preset package.json configuration
    Object.assign(packageFile, packageConfig);

    return jsonfile.writeFile(`${servicePath}/package.json`, packageFile, { spaces: 2 });
})

// -----------------------------------
// Step 3: Customize folders and files
// -----------------------------------

.then(() => {
    const helloWorldDir = path.join(servicePath, 'lambda-functions', 'hello-world');
    const initialHandlerPath = path.join(servicePath, 'handler.js');
    const finalHandlerPath = path.join(helloWorldDir, 'handler.ts');
    const serverlessConfigPath = path.join(servicePath, 'serverless.yml');
    const serverlessConfigYaml = json2yaml
        .stringify(serverlessConfig)
        .replace(/"/g, '');

    shell.mkdir('-p', helloWorldDir);
    shell.mv(initialHandlerPath, finalHandlerPath);

    return fs.writeFile(serverlessConfigPath, serverlessConfigYaml);
})

// ---------------------
// Step 4: Build service
// ---------------------

.then(() => {
    // move to service dir and build it
    child_process.execSync(`cd ${servicePath} && npm run build`, { stdio: 'inherit' });
})

// --------
// Finished
// --------

.then(() => {
    console.log('');
    console.log(`Successfully created ${serviceName}!`);
    console.log('');
    console.log(`NOTE: ${servicePath}/serverless.yml still needs to be manually configured for your desired functions and endpoints.`);
    console.log('');
})

.catch((error) => {
    console.error(error.toString());
    console.log('');
    console.error(`Failed to create ${serviceName}!`);
});






// ----------------
// Helper functions
// ----------------

function convertToKebabCase(name) {
    return name
        .replace(/([A-Z])([a-z])/g, '-$1$2')   // guarantee words prefixed with -
        .replace(/([a-z])([^-a-z])/g, '$1-$2') // guarantee words suffixed with -
        .replace(/^-|_/g, '')                   // remove duplicates / other delimiters
        .toLowerCase();
}

function showUsage() {
    console.log('usage: npm run create-service <ServiceName>');
    console.log('where <ServiceName> is of the form XxxServices');
}
