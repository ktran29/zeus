const SchemaValidator = require('./SchemaValidator.js');
const standardizeSchema = SchemaValidator._standardizeSchema;

const standard_schema_1 = {
    schemaType: 'standard',
    type: 'object',
    properties: {
        teamId: { type: 'string' },
        generalChannel: {
            type: 'object',
            properties: {
                name: { type: 'string' },
                userIds: { type: 'array' }
            },
            required: [
                'name'
            ]
        },
        assignedChannelIds: { type: 'array' }
    },
    required: [
        'teamId',
        'generalChannel'
    ]
};

const simplified_schema_1 = {
    schemaType: 'simplified',
    required: {
        teamId: 'string',
        generalChannel: {
            required: {
                name: 'string'
            },
            optional: {
                userIds: 'array'
            }
        }
    },
    optional: {
        assignedChannelIds: 'array'
    }
};

const standard_schema_2 = {
    type: 'number'
};

const simplified_schema_2 = 'number';

function testSchema(standardSchema, simpleSchema) {
    console.log('simple schema      : ' + JSON.stringify(simpleSchema));
    console.log('------------------');
    console.log('standard schema    : ' + JSON.stringify(standardSchema));
    console.log('------------------');
    console.log('transformed schema : ' + JSON.stringify(standardizeSchema(simpleSchema)));
}

// TODO automate testing instead of having to verify testSchema output manually
