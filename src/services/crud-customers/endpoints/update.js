const AWS = require('aws-sdk')
const middy = require('@middy/core')
const doNotWaitForEmptyEventLoop = require('@middy/do-not-wait-for-empty-event-loop')
const warmup = require('@middy/warmup')
const cors = require('@middy/http-cors')
const httpErroHandler = require('@middy/http-error-handler')
const CreateError = require('http-errors')
const { ObjectId } = require('mongodb')
const { createConnection } = require('../../../database/mongo/connection')
const Customer = require('../../../database/mongo/models/Customer')

const sns = new AWS.SNS()

const handler = middy(async (event, context) => {
  const { id } = event.pathParameters
  const body = event.body

  try {
    await createConnection()

    if (!ObjectId.isValid(id)) throw new CreateError(422, 'ID malformed')

    const data = await Customer.findOneAndUpdate({ _id: id }, body, {
      new: true
    })

    if (!data) throw new CreateError(404, 'Customer is not found!')

    const params = {
      Message: JSON.stringify(data),
      TopicArn: process.env.SNS_TOPIC_CUSTOMER_UPDATE
    }

    await sns.publish(params).promise()

    return {
      statusCode: 200,
      body: JSON.stringify({
        data
      })
    }
  } catch (err) {
    if (err.statusCode && err.message) {
      throw new CreateError(err.statusCode, err.message)
    }

    // criação de um erro de requisição mal formada
    throw new CreateError(500)
  }
})

handler
  .use(doNotWaitForEmptyEventLoop()) // adiciona o context.doNotWaitForEmptyEventLoop = false
  .use(warmup({ waitForEmptyEventLoop: false })) // retorna de forma rapida quando é um evento warmup
  .use(httpErroHandler()) // valida qualquer erro do formato http-errors
  .use(cors()) // adiciona os headers do cors (tem que ser antes do response)

module.exports = { handler }
