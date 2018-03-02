const validate = require('../../utils/SchemaValidator.js').validate;
const exampleUserDatas = require('./UserData_V0_TestExamples.json');
const UserDataSchema = require('./UserData_V0_Schema_generated.json');

console.log('Testing UserData_V0_Schema...');

Promise.all([
    exampleUserDatas.map((userData) => validate(userData, UserDataSchema))
])

.then(() => {
    console.log('All Tests Passed!');
})

.catch((errors) => {
    console.log('Failure!');
    console.log(errors);
});
