const middy = require('@middy/core')
const doNotWaitForEmptyEventLoop = require('@middy/do-not-wait-for-empty-event-loop')
const warmup = require('@middy/warmup')
const cors = require('@middy/http-cors')
const httpErrorHandler = require('@middy/http-error-handler')
const createError = require('http-errors')
const { createConnection } = require('../../../database/mongo/connection')
const Customer = require('../../../database/mongo/models/Customer')

const handler = middy(async (event, context) => {
  try {
    await createConnection()

    const data = await Customer.find()

    return {
      statusCode: 200,
      body: JSON.stringify({
        users: data
      })
    }
  } catch (err) {
    throw createError(500)
  }
})

handler
  .use(doNotWaitForEmptyEventLoop()) // adiciona o context.doNotWaitForEmptyEventLoop = false
  .use(warmup({ waitForEmptyEventLoop: false })) // retorna de forma rapida quando é um evento warmup
  .use(cors()) // adiciona os headers do cors (tem que ser antes do response)
  .use(httpErrorHandler()) // valida qualquer erro do formato http-errors

module.exports = { handler }
