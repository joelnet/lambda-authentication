const AWS       = require('aws-sdk')
const config    = require('config')
const promisify = require('functional-js/promises/promisify')
const path      = require('ramda/src/path')

const USERS = `social-${process.env.STAGE}-users`

const docClient = new AWS.DynamoDB.DocumentClient({
        region: config.get('aws.region'),
        apiVersion: config.get('aws.apiversion')
    })

const docClientQuery =
    promisify(docClient.query).bind(docClient)

/* istanbul ignore next */
const query = (table, condition, filter, values) =>
    docClientQuery({
        TableName: table,
        KeyConditionExpression: condition,
        FilterExpression: filter,
        ExpressionAttributeValues: values
    })

const getFirst =
    path(['Items', 0])

/* istanbul ignore next */
module.exports.getUser = (realm, userId) =>
    Promise.resolve()
        .then(() => query(USERS, 'userId = :userId', 'realm = :realm', { ':userId': userId, ':realm': realm }))
        .then(getFirst)
