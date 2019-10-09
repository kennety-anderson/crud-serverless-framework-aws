'use strict'

const middy = require('@middy/core')
const doNotWaitForEmptyEventLoop = require('@middy/do-not-wait-for-empty-event-loop')
const warmup = require('@middy/warmup')
const cors = require('@middy/http-cors')
const httpErroHandler = require('@middy/http-error-handler')
const createError = require('http-errors')
const { ObjectId } = require('mongodb')
const { createConnection } = require('../../../database/mongo/connection')
const User = require('../../../database/mongo/models/User')

const handler = middy(async (event, context) => {
  const { id } = event.pathParameters

  try {
    await createConnection()

    if (!ObjectId.isValid(id)) throw createError(422, 'ID malformed')

    const data = await User.findById(id)

    if (!data) throw createError(404, 'User is not found!')

    return {
      statusCode: 200,
      body: JSON.stringify({
        user: data
      })
    }
  } catch (err) {
    throw createError(err.statusCode, err.message)
  }
})

handler
  .use(doNotWaitForEmptyEventLoop()) // adiciona o context.doNotWaitForEmptyEventLoop = false
  .use(warmup({ waitForEmptyEventLoop: false })) // retorna de forma rapida quando é um evento warmup
  .use(cors()) // adiciona os headers do cors (tem que ser antes do response)
  .use(httpErroHandler()) // valida qualquer erro do formato http-errors

module.exports = { handler }
