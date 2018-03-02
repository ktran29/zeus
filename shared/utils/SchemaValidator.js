'use strict';

const validateStandardSchema = require('jsonschema').validate;
const MalformedRequestError = require('./Errors.js').MalformedRequestError;

// TODO: add validation for specific array types instead of just 'array'

//------------------------------------------------------------------------------
// Configuration
//------------------------------------------------------------------------------

const schemaValidators = {
    standard: (object, schema) => validateStandardSchema(object, schema),
    simplified: (object, schema) => validateStandardSchema(object, standardizeSchema(schema))
};
const validSchemaTypes = Object.keys(schemaValidators);
const validAttributeTypes = [
    'array',
    'boolean',
    'number',
    'object',
    'string',
    'undefined'
];
const validTopLevelAttributes = [
    'id',
    'schemaType',
    'required',
    'optional'
];

//------------------------------------------------------------------------------
// Helpers
//------------------------------------------------------------------------------

function isValidAttributeType(type) {
    return validAttributeTypes.indexOf(type) !== -1;
}

function isValidSchemaType(type) {
    return validSchemaTypes.indexOf(type) !== -1;
}

if (!Array.prototype.isSubsetOf) {
    Array.prototype.isSubsetOf = function(otherArray) {
        return this.every((myElement) => {
            return otherArray.indexOf(myElement) !== -1;
        });
    };
}

function standardizeSchema(simpleSchema) {

    const schemaValueType = typeof simpleSchema;
    let standardSchema;

    function addDefinitionsForProperties(properties, standardizedPropertyDefinitions) {
        const propertyNames = Object.keys(properties || {});

        propertyNames.forEach((propName) => {
            const propSchema = properties[propName];
            const standardizedPropSchema = standardizeSchema(propSchema);
            standardizedPropertyDefinitions[propName] = standardizedPropSchema;
        });
    }

    switch (schemaValueType) {
        case 'string': {
            // if the schema is a string then the value of the schema defines the type of an attribute
            const attributeType = simpleSchema;
            if (!isValidAttributeType(attributeType)) {
                throw `InvalidSchemaError: invalid attribute type '${attributeType}', expected one of [${validAttributeTypes}]`;
            }

            standardSchema = {
                type: simpleSchema
            };

            break;
        }
        case 'object': {
            const topLevelAttributes = Object.keys(simpleSchema);
            const schemaIsProperlyFormed = topLevelAttributes.isSubsetOf(validTopLevelAttributes);

            if (!schemaIsProperlyFormed) {
                throw `MalformedSchemaError: expected schema to be object with keys being a subset of [${validTopLevelAttributes}]`;
            }

            let standardizedPropertyDefinitions = {};

            let requiredProperties = Object.keys(simpleSchema.required || {});

            // note: requried property definitions will overwrite optional
            // definitions if duplicates exist
            addDefinitionsForProperties(simpleSchema.optional, standardizedPropertyDefinitions);
            addDefinitionsForProperties(simpleSchema.required, standardizedPropertyDefinitions);
            standardSchema = {
                id: simpleSchema.id,
                type: 'object',
                properties: standardizedPropertyDefinitions,
                required: requiredProperties
            };

            break;
        }
        default: {
            throw `MalformedSchemaError: expected schema to be either:\n`
                + ` - A string denoting an attribute type (one of [${validAttributeTypes}])\n`
                + ` - An object with keys being a subset of ${validTopLevelAttributes}\n`
                + `Provided schema: ${simpleSchema}`;
        }
    }

    return standardSchema;
}

//------------------------------------------------------------------------------
// Exports
//------------------------------------------------------------------------------

module.exports._standardizeSchema = standardizeSchema;

/// Validates the object against the given schema
/// - returns: a promise that either...
///   - resolves with undefined
///   - rejects with a list of errors
module.exports.validate = function validate(object, schema) {
    return new Promise(function(_resolve, _reject) {

        const schemaType = schema.schemaType || 'standard';

        const resolve = (result) => {
            console.log(`Object succesfully validated against ${validationResponse.schema.id}`);
            _resolve(result);
        };

        const reject = (errors) => {
            // Changes schema validation errors to return MalformedRequestError
            var errorString = errors.map(err => err.message).join(', ');
            errors = new MalformedRequestError(errorString, schema.id);
            _reject(errors);
        };

        if (!isValidSchemaType(schemaType)) {
            reject([
                `InvalidSchemaError: invalid schemaType '${schemaType}', expected one of [${validSchemaTypes}].\n`
                + `Provided schema: ${schema}`
            ]);
            return;
        }

        let validationResponse;

        try {
            validationResponse = schemaValidators[schemaType](object, schema);
        } catch (error) {
            reject([
                error
            ]);
            return;
        }

        if (validationResponse.errors.length > 0) {
            reject(validationResponse.errors);
            return;
        }

        resolve();
    });
};
