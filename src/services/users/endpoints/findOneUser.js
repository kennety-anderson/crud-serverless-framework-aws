'use strict'

const middy = require('@middy/core')
const doNotWaitForEmptyEventLoop = require('@middy/do-not-wait-for-empty-event-loop')
  // const warmup = require('@middy/warmup')
const httpErroHandler = require('@middy/http-error-handler')
const createError = require('http-errors')
const { ObjectId } = require('mongodb')
const { createConnection } = require('../../../database/mongo/connection')
const User = require('../../../database/mongo/models/User')

const handler = middy(async(event, context) => {

  try {
    await createConnection()

    const { id = null } = event.pathParameters

    if (!ObjectId.isValid(id)) throw createError(422, 'ID malformed')

    const data = await User.findById(id).lean()

    if (!data) throw createError(404, 'User is not found!')

    return {
      statusCode: 200,
      body: JSON.stringify({
        ok: true,
        user: data
      })
    }
  } catch (err) {
    if (err.statusCode) throw createError(err.statusCode, err.message)

    throw createError(500)
  }

})

handler
  .use(doNotWaitForEmptyEventLoop())
  // .use(warmup({ waitForEmptyEventLoop: false }))
  .use(httpErroHandler())

module.exports = { handler }