const AWS = require('aws-sdk')
const middy = require('@middy/core')
const doNotWaitForEmptyEventLoop = require('@middy/do-not-wait-for-empty-event-loop')
const warmup = require('@middy/warmup')
const cors = require('@middy/http-cors')
const httpErroHandler = require('@middy/http-error-handler')
const createError = require('http-errors')
const { ObjectId } = require('mongodb')
const { createConnection } = require('../../../database/mongo/connection')
const Customer = require('../../../database/mongo/models/Customer')

const sns = new AWS.SNS()

const handler = middy(async (event, context) => {
  const { id } = event.pathParameters
  const body = event.body

  try {
    await createConnection()

    if (!ObjectId.isValid(id)) throw createError(422, 'ID malformed')

    const data = await Customer.findOneAndUpdate({ _id: id }, body, {
      new: true
    })

    if (!data) throw createError(404, 'Customer is not found!')

    const params = {
      Message: JSON.stringify(data),
      TopicArn: process.env.SNS_TOPIC_CUSTOMER_UPDATE
    }

    await sns.publish(params).promise()

    return {
      statusCode: 200,
      body: JSON.stringify({
        user: data
      })
    }
  } catch (err) {
    if (err.statusCode && err.message) {
      throw createError(err.statusCode, err.message)
    }

    // criação de um erro de requisição mal formada
    throw createError(500)
  }
})

handler
  .use(doNotWaitForEmptyEventLoop()) // adiciona o context.doNotWaitForEmptyEventLoop = false
  .use(warmup({ waitForEmptyEventLoop: false })) // retorna de forma rapida quando é um evento warmup
  .use(cors()) // adiciona os headers do cors (tem que ser antes do response)
  .use(httpErroHandler()) // valida qualquer erro do formato http-errors

module.exports = { handler }
