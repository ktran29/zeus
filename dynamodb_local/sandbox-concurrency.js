/* eslint semi: ["warn", "never"], indent: ["warn", 2] */

const AWS = require('aws-sdk')
const prettyjson = require('prettyjson')

const stringifyObject = (object) => object && ('\n' + prettyjson.render(object))

const config = {
  endpoint: new AWS.Endpoint('http://localhost:8000'),
  region: 'us-east-1'
}

const dynamo = new AWS.DynamoDB(config)
const documentClient = new AWS.DynamoDB.DocumentClient(config)

const tableInfos = [
  {
    tableName: 'Lanes',
    keyName: 'id'
  }
]

console.log('\nv------------ setup ------------v\n')

Promise.resolve()

.then(() => ensureTablesExist(tableInfos))

.then(showTables)

.then(() => {
  const laneId = '1'
  const initialTaskIds = [1, 2, 3]
  const numberOfConcurrentModifications = 3
  const expectedTaskIds = [1, 2, 3, 4, 5, 6]

  return putLane({
    id: laneId,
    taskIds: initialTaskIds
  })

  .then(() => console.log('\nv------------ starting lane modifications ------------v\n'))

  .then(() => fuckShitUp(laneId, numberOfConcurrentModifications))

  .then(() => console.log('\nv------------ final Lanes table ------------v\n'))

  .then(() => showTable('Lanes'))

  .then(() => console.log('Expected Lanes table:', stringifyObject(getExpectedLanesTable(laneId, initialTaskIds, numberOfConcurrentModifications))))

  .catch((error) => {
    console.error('Error:', error)
  })
})

//------------------------------------------------------------------------
// -- helpers --
//------------------------------------------------------------------------

const fuckShitUp = (laneId, numConcurrentUpdates) => {
  const updates = new Array(numConcurrentUpdates)

  for (var i = 0; i < updates.length; i++) {
    updates[i] = i + 1
  }

  console.log(`\n> starting ${numConcurrentUpdates} concurrently unsafe modifications in parallel...`)

  return Promise.all(
    updates.map((i) => {

      return Promise.resolve()
      .then(() => console.log(`[thread ${i}] starting`))
      .then(() => addNewTaskToLane_safe(laneId))
      .then(() => console.log(`[thread ${i}] finished`))
    })
  )

  .then(() => console.log(`\n> finished concurrent modifications`))
}

// TODO
function addNewTaskToLane_safe(laneId) {
  return addNewTaskToLane_unsafe(laneId)
}

function addNewTaskToLane_unsafe(laneId) {
  return getLane(laneId)
  .then(addNewTaskInMemory)
  .then(putLane)
}

function addNewTaskInMemory(lane, silent) {
  const newTaskId = Number(lane.taskIds.slice(-1)) + 1

  if (!silent) console.log('newTaskId:', newTaskId)

  lane.taskIds.push(newTaskId)

  return lane
}

function getExpectedLanesTable(laneId, initialTaskIds, numberOfConcurrentModifications) {
  const lane = {
    id: laneId,
    taskIds: initialTaskIds
  }

  for (var i = 0; i < numberOfConcurrentModifications; i++) {
    addNewTaskInMemory(lane, true)
  }

  return [lane]
}

function getLane(id) {
  return get('Lanes', 'id', id)
}

function putLane(lane) {
  return put('Lanes', {
    id: lane.id,
    taskIds: lane.taskIds
  })
}

function get(tableName, keyName, keyValue) {

  const Key = {}
  Key[keyName] = keyValue

  return documentClient.get({
    TableName: tableName,
    Key: Key
  })

  .promise()

  .then((data) => {
    if (data.Item) {
      return data.Item
    } else {
      throw new Error(`no item found in table ${tableName} with ${keyName} ${keyValue}`)
    }
  })

  .then((item) => {
    console.log(`retrieved item:`, stringifyObject(item))
    return item
  })
}

function put(tableName, item) {

  return documentClient.put({
    TableName: tableName,
    Item: item
  })

  .promise()

  .then(() => {
    console.log(`${tableName} table updated successfully`)
    return showTable(tableName)
  })
}

function showTable(tableName) {
  return documentClient.scan({
    TableName: tableName
  })
  .promise()
  .then((data) => data.Items)
  .then((items) => console.log(`${tableName} table:`, stringifyObject(items)))
}

function showTables() {
  return dynamo.listTables()
  .promise()
  .then((data) => console.log('Current tables:', data))
}

function ensureTablesExist(tableInfos) {
  const createAllTables = () => {
    return Promise.all(
      tableInfos.map((info) => createTable(info.tableName, info.keyName))
    )
  }

  return dynamo.listTables()
  .promise()
  .then((data) => data.TableNames.length)
  .then((tablesExist) => tablesExist ? Promise.resolve() : createAllTables())
}

function createTable(tableName, keyName) {
  const params = {
    TableName: tableName,
    KeySchema: [
      {
        AttributeName: keyName,
        KeyType: 'HASH',
      }
    ],
    AttributeDefinitions: [
      {
        AttributeName: keyName,
        AttributeType: 'S',
      }
    ],
    ProvisionedThroughput: {
      ReadCapacityUnits: 1,
      WriteCapacityUnits: 1,
    },
  }

  return dynamo.createTable(params).promise()
}
