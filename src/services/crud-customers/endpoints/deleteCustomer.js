const middy = require('@middy/core')
const doNotWaitForEmptyEventLoop = require('@middy/do-not-wait-for-empty-event-loop')
const warmup = require('@middy/warmup')
const cors = require('@middy/http-cors')
const httpErroHandler = require('@middy/http-error-handler')
const CreateError = require('http-errors')
const { ObjectId } = require('mongodb')
const { createConnection } = require('../../../database/mongo/connection')
const Customer = require('../../../database/mongo/models/Customer')

const handler = middy(async (event, context) => {
  const { id } = event.pathParameters

  try {
    await createConnection()

    if (!ObjectId.isValid(id)) throw new CreateError(422, 'ID malformed')

    const data = await Customer.findOneAndDelete({ _id: id })

    if (!data) throw new CreateError(404, 'Customer is not found!')

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
    throw new CreateError(500)
  }
})

handler
  .use(doNotWaitForEmptyEventLoop()) // adiciona o context.doNotWaitForEmptyEventLoop = false adiciona o context.doNotWaitForEmptyEventLoop = false
  .use(warmup({ waitForEmptyEventLoop: false })) // retorna de forma rapida quando é um evento warmup
  .use(httpErroHandler()) // valida qualquer erro do formato http-errors
  .use(cors()) // adiciona os headers do cors (tem que ser antes do response)

module.exports = { handler }
