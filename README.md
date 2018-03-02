# Zeus

Zeus is the god of the Sky, Cloud, Rain, and Lightning, just like our backend ;)

This is Tack's repo for our AWS services using the [Serverless Framework](https://serverless.com).

## Architecture

The function execution workflow follows a 3 layer paradigm of decreasing abstraction:

*Lambda Functions -[ 1:1 ]-> Transactions -[ 1:1+ ]-> Actions*

##### Lambda Functions
_The "API Adapter" layer, located under (`./lambda-functions`)_

These guys directly correlate with our API endpoints and serve primarily as an
adapter layer between the outside world and our internal API. This is where
AWS-specific code should be factored out to and should be very high level.

They are responsible for:
- extracting request parameters
- validating request parameters
- delegating to the appropriate transaction
- transforming the transaction response into a versioned response for the client

_Schemas_. This layer is also responsible handling API versioning and request
validation. Each lambda function should be associated with a versioned schema
defining the signature of the request it expects. Our schemas follow one of two
formats: either the standard jsonschema format or a proprietary simplified version.

##### Transactions (business logic layer)
_The "Business Logic" layer, located under (`./transactions`)_

This is our internal API that should be relatively platform agnostic. Each
transaction should represent a set of actions to be performed atomically (all
or nothing, much like a SQL transaction). While these shouldn't be giant
super functions with crazy side effects (think microservice!), they should still
be fairly high level and delegate implementation details to various actions.
These should also encapsulate integration logic required to stitch together
actions as well as handle any errors related to such integration.

##### Actions
_The "Data Access" layer, located under (`./actions`)_

These should helper methods that are tightly coupled to the database and have
very small scope. They should be able to be composed together to allow for
higher level programming in the transaction layer. This level essentially owns
the database and should handle any errors relating to db interaction. The scope
should be small enough to be reminiscent of unit-testing.

## Setup / Installation

1. Install the serverless framework

    `npm install -g serverless`

2. Set up the serverless-dev profile

    Talk to to your dev lead to get the serveless-dev profile credentials
    These will be stored in ~/.aws/credentials on your dev machine

3. Configure the project for deployment

    Make sure you're in the project root directory.
    run `npm run setup`

##### Scripts

There are various scripts in this project, some meant to be run at the project
level and some at the service level. Which scripts are available is determined by
the `package.json` in your current directory. These can be ran via `npm run xxx`
where xxx is the defined script.

While most functionality will be provided already via scripts defined in `package.json`
(check first!), there may be times where you want to manually run serverless commands.
This is fine, just remember *all serverless commands* should be performed in the directory of the
relevant service.

##### NPM

As the project expands and package dependencies get added, you may find node complaining
that it can't find certain packages. When this happens just run `npm install` and
the appropriate packages should be downloaded and installed in your current directory.

## Creating Functions

The process of creating a new function involves creating a new file somewhere
in the project based on the layer the function should reside in (lambda functions,
transactions, actions, utilities). New lambda functions also require some
function configuration in the `serverless.yml` file in order to be exposed externally.

## Testing

Testing is done through Postman and AWS CloudWatch.

__Documentation:__
[Member Services](https://documenter.getpostman.com/collection/view/1304107-a85ae4f8-d5c7-a189-1d82-c8f7db9682bf), [Content Services](https://documenter.getpostman.com/collection/view/1304107-32d35276-4d0b-656e-ac27-d772e214485b)

__Test Flow:__
* Create a PostMan enviroment for the desired service
  * Specifiy relevant `SERVICE_URL`  and `API_VERSION` (and possibly `API_KEY`)
* Deploy desired service to AWS (see 'Deployment')
* Make API request on Postman
* Check 'Tests' section on Postman to ensure desired output is received
* Logs/Error messages will appear on CloudWatch and client output will appear in console

## Deployment

__Deploying specific functions (for testing)__

*in the directory of the service:*
`npm run update-function <FunctionName>`
If any imports are changed, the whole service needs to be redeployed.

__Deploying an entire service__

*in the directory of the service:*
`npm run deploy [<StageName>]`

List of possible stages:
 * _dev_* - Deploys to personal development endpoint (dev-[username]-[serviceName]) ***Default stage name if none is specified**
 * _staging_ - Deploys to the shared staging endpoint (staging-[serviceName])
 * _prod_* - Deploys to the production endpoint (prod-[serviceName]) ***requires admin privileges**

## Services

Each API should have a service associated with it and vice versa.

__Creating a new service:__

*from the project directory*
`npm run create-service <ServiceName>`

## Error Codes

| Status Code | Error Message                                                                  | Description                                                               |
|-------------|--------------------------------------------------------------------------------|---------------------------------------------------------------------------|
| 400         | MalformedRequestError: Failed to validate ${schema}: ${validationErrorMessage} | The request parameters failed to validate against the request schema      |
| 403         | Missing Authentication Token                                                   | Thrown by AWS when the url requested didn't match a valid endpoint        |
| 404         | ObjectNotFoundError: Couldn't find ${objectType} with id: ${objectId}          | The desired object could not be found in the database                     |
| 422         | InvalidArgumentError: The request contained invalid content: ${errorMessage}   | Invalid content was attempted to be passed in                             |
| 422         | UnsupportedAPIError: API version "${apiVersion}" is not supported.             | The passed in API version did not match any current versions              |
| 500         | GeneralServerError: ${errorMessage}                                            | Default error message given when the error doesn't match any of the above |
